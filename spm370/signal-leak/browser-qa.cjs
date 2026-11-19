const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');

const root = process.cwd();
const out = path.join(root,'signal-qa-results');
const mime = {'.html':'text/html','.mjs':'text/javascript','.css':'text/css'};
const paragraphs = {
  known:'Ari confirmed that the clip exposed their home address. The visitor report does not establish who the visitor was or why they came.',
  actions:'I instructed production to remove the chat overlay. The producer controls the broadcast, while outside platforms separately review requests about copies.',
  next:'The team lead checks privately with Ari in five minutes. The organizer records who controls the cameras, the review time and which platform reports still need a response.'
};
const desk='#desk';
const field=(p,form,name)=>p.locator('#'+form+' [name="'+name+'"]');

async function waitForText(locator, text) {
  await locator.filter({hasText:text}).first().waitFor();
}
async function act(p,id,params) {
  await p.locator('[data-act="'+id+'"]').click();
  for (const [name,value] of Object.entries(params)) {
    const item=field(p,'actionForm',name);
    if (await item.evaluate(e=>e.tagName)==='SELECT') await item.selectOption(value);
    else await item.fill(value);
  }
  await p.getByRole('button',{name:'Record action',exact:true}).click();
  await p.locator('#actionForm').waitFor({state:'hidden'});
}
async function download(p,id,file) {
  const next=p.waitForEvent('download');
  await p.locator('#'+id).click();
  await (await next).saveAs(file);
  return fs.readFile(file,'utf8');
}

async function journey(browser,url,route,width) {
  const context=await browser.newContext({viewport:{width,height:850},acceptDownloads:true});
  const errors=[],external=[];
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  context.on('request',req=>{
    const u=new URL(req.url());
    if (['http:','https:'].includes(u.protocol) && (u.origin!==new URL(url).origin || req.method()!=='GET')) external.push(req.method()+' '+u.href);
  });
  await page.goto(url);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').getAttribute('class'),'skip');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator(':focus').getAttribute('id'),'main');
  await field(page,'startForm','alias').fill('Fictional Finch '+route);
  await field(page,'startForm','alias').press('Enter');
  await page.locator(desk).waitFor();
  assert.equal(await page.locator('#advance').isEnabled(),false);
  assert.equal(await page.locator('#memoForm button').isEnabled(),false);
  assert.doesNotMatch(await page.locator('#feed').innerText(),/visitor|TikTok/);
  await page.getByText('Records and authority',{exact:true}).click();
  await page.locator('[data-doc=protocol]').press('Enter');
  await waitForText(page.locator('#document'),'Northbank incident protocol');
  assert.equal(await page.locator(':focus').getAttribute('id'),'document');
  await page.getByText('Ask a person',{exact:true}).click();
  await field(page,'messageForm','to').selectOption('player');
  await field(page,'messageForm','message').fill('What do you need right now?');
  await page.getByRole('button',{name:'Send question'}).click();
  await waitForText(page.locator('#feed'),'stay with me');
  await page.locator('[data-act=pause]').press('Enter');
  await page.locator('#cancelAction').press('Enter');
  assert.equal(await page.locator(':focus').getAttribute('data-act'),'pause');
  await page.locator('[data-act=production]').click();
  await field(page,'actionForm','control').selectOption(route);
  await field(page,'actionForm','reason').fill('Keep the chat off screen while we check what Ari needs.');
  for (const [name,value] of Object.entries(paragraphs)) await field(page,'memoForm',name).fill(value);
  await page.reload();await page.locator(desk).waitFor();
  assert.equal(await field(page,'actionForm','control').inputValue(),route);
  assert.match(await field(page,'actionForm','reason').inputValue(),/chat off screen/);
  assert.equal(await field(page,'messageForm','to').inputValue(),'player');
  for (const [name,value] of Object.entries(paragraphs)) assert.equal(await field(page,'memoForm',name).inputValue(),value);
  await page.getByRole('button',{name:'Record action',exact:true}).click();
  await page.locator('#advance').click();
  await waitForText(page.locator('#feed'),'TikTok');
  await waitForText(page.locator('#feed'),route==='hold'?'break screen':'cameras on Ari');
  if (route==='hold') await act(page,'refer',{summary:'Ari confirmed the exposure. Please assess privately and agree on a contact.'});
  else await act(page,'checkin',{plan:'The support lead stays with Ari and checks privately about camera coverage.'});
  await page.locator('#advance').click();
  await waitForText(page.locator('#feed'),route==='hold'?'earlier referral':'Do you have information');
  assert.equal(await page.locator('#advance').isVisible(),false);
  assert.equal(await page.locator('#memoForm button').isEnabled(),false);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  const status=route==='hold'?'hold':'resume';
  await act(page,'decision',{status,basis:'Review with Ari and the support lead in five minutes. Captain can call for another pause.'});
  await page.locator('#memoForm button').press('Enter');
  await page.locator('#receipt').waitFor();await page.reload();await page.locator('#receipt').waitFor();
  const txt=await download(page,'downloadText',path.join(out,route+'.txt'));
  assert.match(txt,/Nothing sent to the instructor/);assert.ok(txt.includes(paragraphs.next));
  assert.match(txt,/CHRONOLOGICAL DECISION LOG/);assert.ok(txt.indexOf('Northbank incident protocol')<txt.indexOf('Director · Direct production'));
  assert.ok(txt.indexOf('verified copies') < txt.lastIndexOf('Director · Set the next match decision'));
  assert.ok(txt.includes(route==='hold'?'Show a neutral break screen'.toLowerCase():'keep the game on screen'));
  assert.doesNotMatch(txt,/Juniper Hall|Room 204|tokenHashes|requestId/);
  await page.getByText('Optional data copy',{exact:true}).click();
  const report=JSON.parse(await download(page,'download',path.join(out,route+'.json')));
  assert.deepEqual(report.handoff,paragraphs);assert.equal(report.practiceOnly,true);
  assert.equal(report.decisionLog.filter(e=>e.who.startsWith('Director ·')).length,3);
  const other=await context.newPage();await other.goto(url);await other.locator('#start').waitFor();
  assert.equal(await other.locator('#desk').isVisible(),false);await other.close();
  await page.screenshot({path:path.join(out,route+'.png')});
  page.once('dialog',d=>d.dismiss());await page.locator('#erase').click();assert.equal(await page.locator('#receipt').isVisible(),true);
  page.once('dialog',d=>d.accept());await page.locator('#erase').click();await page.locator('#start').waitFor();
  await page.reload();await page.locator('#start').waitFor();
  assert.equal(await field(page,'startForm','alias').inputValue(),'');
  assert.equal(await page.evaluate(()=>Object.keys(sessionStorage).some(k=>k.startsWith('signal-leak.')||k.includes('spm370-signal-leak'))),false);
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log('PASS '+route+' at '+width+'px on '+new URL(url).protocol+': two stages, different operational consequences, keyboard, unfinished instruction & memo recovery, two parsed exports, fresh-tab isolation, cancel/erase, no external requests');
  await context.close();
}

async function recoveryChecks(browser,url) {
  const context=await browser.newContext();
  const p=await context.newPage();
  await p.goto(url);
  await field(p,'startForm','alias').fill('Fictional legacy rehearsal');
  await field(p,'startForm','alias').press('Enter');
  await p.locator('#desk').waitFor();
  const oldDraft='Earlier draft from a fictional director retained across recovery.';
  // Seed the merged release's exact storage shape, including an unrelated run.
  await p.evaluate(text=>{
    const ck='simkit.cred.spm370-signal-leak.local';
    const c=sessionStorage.getItem(ck), id=JSON.parse(c).runId;
    const db=JSON.parse(sessionStorage.getItem('signal-leak.tab.v2'));
    db.runs[id].caseVersion=1;
    db.runs.other={...db.runs[id],id:'other',team:'Fictional other director'};
    db.events.other=[];
    localStorage.setItem(ck,c);
    localStorage.setItem('signal-leak.local.v1',JSON.stringify(db));
    localStorage.setItem('signal-leak.draft.'+id,JSON.stringify({known:text}));
    sessionStorage.clear();
  },oldDraft);
  await p.reload();await p.locator('#recover').waitFor();assert.equal(await p.locator('#desk').isVisible(),false);
  await p.locator('#recover').click();await p.locator('#desk').waitFor();
  assert.equal(await field(p,'memoForm','known').inputValue(),oldDraft);
  assert.deepEqual(await p.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('signal-leak.local.v1')).runs)),['other']);
  await p.reload();await p.locator('#desk').waitFor();
  assert.equal(await field(p,'memoForm','known').inputValue(),oldDraft);
  await context.close();
  const blocked=await browser.newContext();await blocked.addInitScript(()=>{
    Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('Disabled for this test','SecurityError');}});
  });
  const b=await blocked.newPage();await b.goto(url);
  await field(b,'startForm','alias').fill('Fictional temporary director');
  await field(b,'startForm','alias').press('Enter');await b.locator('#desk').waitFor();
  await waitForText(b.locator('#storageStatus'),'Browser saving is unavailable');
  await act(b,'pause',{reason:'Recheck with the player before restarting.'});
  assert.equal(await b.locator('#advance').isEnabled(),true);
  await blocked.close();
  console.log('PASS legacy opt-in, draft and unrelated record preservation, and storage-denied warning with in-memory play');
}

(async()=>{
  await fs.mkdir(out,{recursive:true});
  const { buildPortable }=await import('./make-portable.mjs');
  const portable=path.join(out,'Signal-Leak.html');await buildPortable(portable);
  const server=http.createServer(async(req,res)=>{
    try {
      let pathname=new URL(req.url,'http://localhost').pathname;
      if (pathname.endsWith('/')) pathname+='index.html';
      const file=path.resolve(root,'.'+decodeURIComponent(pathname));
      if (!file.startsWith(root+path.sep)) throw Error('path');
      const data=await fs.readFile(file);
      res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data);
    } catch {res.statusCode=404;res.end();}
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  try {
    browser=await chromium.launch();
    await journey(browser,'http://127.0.0.1:'+server.address().port+'/spm370/signal-leak/','hold',1280);
    await journey(browser,pathToFileURL(portable).href,'overlay',390);
    await recoveryChecks(browser,'http://127.0.0.1:'+server.address().port+'/spm370/signal-leak/');
  } finally {if (browser) await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
