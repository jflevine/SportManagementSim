'use strict';
// Isolated browser regression. Every assessment request is handled by the synthetic
// in-memory backend; external requests are blocked. No production record is created.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const sourceDir=process.env.DL4_SOURCE_DIR||__dirname;
const backendDir=process.env.DL4_BACKEND_DIR||path.join(sourceDir,'backend');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css'};
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const file=path.resolve(sourceDir,'.'+pathname+(pathname==='/'?'index.html':''));
  if(!file.startsWith(sourceDir+path.sep)){res.writeHead(403);res.end();return;}
  try{res.setHeader('Content-Type',mime[path.extname(file)]||'text/plain');res.end(fs.readFileSync(file));}
  catch{res.writeHead(404);res.end();}
});
const deferred=()=>{let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};};
async function bounded(promise,message){
  let timer;
  try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(message)),10000);})]);}
  finally{clearTimeout(timer);}
}

(async()=>{
  const {createHandler,hash}=await import(pathToFileURL(path.join(backendDir,'server.mjs')));
  const {memoryStore,assessment,TEST_KEY}=await import(pathToFileURL(path.join(backendDir,'tests/fixtures.mjs')));
  const store=memoryStore();
  store.setAssessment({...assessment,explanationMinWords:20,maxExplanationChars:1800});
  const handler=createHandler({store,instructorKeyHash:await hash(TEST_KEY),rateSecret:'synthetic-browser-reliability'});
  const calls=[],errors=[],blockedExternal=[];
  const heldSave=deferred(),releaseSave=deferred();
  let browser,holdNextSave=false,loseNextSubmit=true;
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try{
    browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
    const base=`http://127.0.0.1:${server.address().port}/`;
    const context=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});
    const page=await context.newPage();
    page.setDefaultTimeout(10000);
    page.on('pageerror',e=>errors.push(e.message));
    page.on('dialog',d=>d.type()==='confirm'?d.accept():d.dismiss());
    await context.route('**/*',async route=>{
      const request=route.request(),url=new URL(request.url());
      if(request.url().startsWith(base))return route.continue();
      if(url.pathname!=='/functions/v1/spm370-labor-v3'){
        blockedExternal.push(url.origin+url.pathname);return route.abort();
      }
      const cors={'access-control-allow-origin':new URL(base).origin,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'content-type,x-attempt-token'};
      if(request.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
      // Run the real handler against a synthetic memory store. The request URL is
      // never fetched, and the private test key is never exposed to the page.
      const body=request.postDataJSON(),headers=await request.allHeaders();
      calls.push({action:body.action,body:structuredClone(body)});
      const response=await handler(new Request('https://synthetic.invalid/functions/v1/spm370-labor-v3',{
        method:'POST',headers:{...headers,origin:'https://jflevine.github.io'},body:JSON.stringify(body)
      }));
      const responseBody=await response.text();
      if(body.action==='saveDraft'&&holdNextSave){
        holdNextSave=false;heldSave.resolve();await releaseSave.promise;
      }
      if(body.action==='submit'&&loseNextSubmit){loseNextSubmit=false;return route.abort('failed');}
      return route.fulfill({status:response.status,headers:cors,contentType:'application/json',body:responseBody});
    });
    await page.goto(base);
    await page.locator('[data-action="role"][data-value="management"]').click();
    await page.locator('[data-action="priority"]').first().click();
    await page.locator('[data-action="start"]').click();
    await page.locator('[data-action="evidence"]').nth(0).click();
    await page.locator('[data-action="evidence"]').nth(1).click();
    await page.locator('[data-action="next"]').click();
    await page.locator('[data-action="strategy"]').first().click();
    await page.locator('[data-action="next"]').click();
    await page.locator('[data-action="twist"]').first().click();
    await page.locator('[data-action="next"]').click();
    await page.locator('#student-name').fill('Synthetic Browser Reliability');
    await page.locator('#student-email').fill('synthetic-browser-reliability@lasalle.edu');
    await page.locator('#identity-form [name="attest"]').check();
    await page.locator('#identity-form button[type="submit"]').click();
    await page.waitForFunction(()=>{const s=LAB_ASSESS.state();return s.record&&!s.busy&&!s.dirty;});

    holdNextSave=true;
    for(const [i,q] of assessment.questions.entries())await page.locator(`input[name="mc-${i}"][value="${q.answer}"]`).check();
    const original='This synthetic explanation tests reliable saving using no student information. The adviser should explain the relevant idea, connect it to a case fact, and describe a practical consequence.';
    const explanation=page.locator('#explanation');
    await explanation.fill(original);
    await bounded(heldSave.promise,'Autosave did not start');
    assert(await explanation.isEnabled(),'native textarea stays editable during automatic saving');
    assert(await page.locator('input[name="mc-0"]').first().isEnabled(),'native answers stay editable');
    assert(await page.locator('[data-grade="save"]').isDisabled(),'manual write is blocked while autosave is in flight');
    assert(await page.locator('#graded-form button[type="submit"]').isDisabled(),'final submit is blocked while autosave is in flight');
    const attest=page.locator('[name="final-attest"]');
    await attest.check();
    await explanation.focus();
    await explanation.press('ControlOrMeta+End');
    const appended=' This later sentence was typed while the earlier save response was delayed.';
    await page.keyboard.type(appended);
    const expected=original+appended;
    // Let any browser focus scrolling settle before measuring background reflow.
    await page.evaluate(()=>new Promise(resolve=>{
      let last=-1,stable=0,frames=0;
      const tick=()=>{stable=window.scrollY===last?stable+1:0;last=window.scrollY;
        if(stable>=3||++frames>=120)resolve();else requestAnimationFrame(tick);};tick();
    }));
    const editorBefore=await page.evaluate(()=>{
      const e=document.querySelector('#explanation');window.syntheticEditorNode=e;
      return {start:e.selectionStart,end:e.selectionEnd,scroll:window.scrollY};
    });
    assert.equal(await explanation.inputValue(),expected);
    assert(await attest.isChecked());
    releaseSave.resolve();
    await page.waitForFunction(()=>!LAB_ASSESS.state().busy);
    const editorAfter=await page.evaluate(()=>{
      const e=document.querySelector('#explanation');
      return {same:e===window.syntheticEditorNode,focused:document.activeElement===e,start:e.selectionStart,end:e.selectionEnd,scroll:window.scrollY};
    });
    assert(editorAfter.same,'autosave completion must not replace the native editor node');
    assert(editorAfter.focused,'autosave completion must not steal keyboard focus');
    assert.equal(editorAfter.start,editorBefore.start,'selection start survives background response');
    assert.equal(editorAfter.end,editorBefore.end,'selection end survives background response');
    assert(Math.abs(editorAfter.scroll-editorBefore.scroll)<2,'background response must not jump the page');
    assert.equal(await explanation.inputValue(),expected,'older response must not replace newer native typing');
    assert(await attest.isChecked(),'review attestation survives background completion');
    await page.waitForFunction(()=>{const s=LAB_ASSESS.state();return !s.busy&&!s.dirty;});
    const row=[...store.rows.values()][0];
    assert.equal(row.explanation,expected,'follow-up autosave persists newer typing');
    assert.equal(row.submitted_at,null,'automatic draft never finalizes or scores an attempt');
    assert.equal(row.mc_score,null);
    assert.equal(row.writing_score,null);

    // Exercise the real browser's required checkbox, which a DOM stub cannot check.
    await attest.uncheck();
    const submitCount=calls.filter(c=>c.action==='submit').length;
    await page.locator('#graded-form button[type="submit"]').click();
    assert(await attest.evaluate(e=>e.validity.valueMissing));
    assert.equal(calls.filter(c=>c.action==='submit').length,submitCount,'missing attestation blocks native form submission');
    await attest.check();
    await page.locator('#graded-form button[type="submit"]').click();
    await page.locator('[data-grade="check"]').waitFor({state:'visible'});
    assert(await page.evaluate(()=>LAB_ASSESS.state().uncertain),'lost successful response needs reconciliation');
    assert.equal([...store.rows.values()][0].explanation,expected);
    assert([...store.rows.values()][0].receipt,'synthetic server committed the submission before response loss');
    await page.locator('[data-grade="check"]').click();
    await page.waitForFunction(()=>!!LAB_ASSESS.state().record?.receipt&&!LAB_ASSESS.state().busy);
    assert.match(await page.locator('#assessment-host').innerText(),/Server-confirmed submission/);
    assert.match(await page.locator('#assessment-host').innerText(),/Pending, not zero/);
    assert.equal(calls.filter(c=>c.action==='start').length,1);
    assert.equal(calls.filter(c=>c.action==='submit').length,1,'recovery retrieves the receipt without a second submission');
    assert.equal(store.rows.size,1);
    assert.deepEqual(await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length})),{local:0,session:0});
    assert.deepEqual(errors,[]);
    assert.deepEqual(blockedExternal,[]);
    console.log('PASS: native editing, focus/selection/scroll, attestation, follow-up autosave, lost-response receipt recovery, and no browser storage; synthetic backend only');
  }finally{
    releaseSave.resolve();
    await browser?.close();
    await new Promise(r=>server.close(r));
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
