'use strict';
// Read-only UI regression. No assessment API requests or student records are created.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css'};
const server=http.createServer((req,res)=>{const file=path.resolve(__dirname,'.'+new URL(req.url,'http://localhost').pathname+(req.url==='/'?'index.html':''));if(!file.startsWith(__dirname+path.sep)){res.writeHead(403);res.end();return;}try{res.setHeader('Content-Type',mime[path.extname(file)]||'text/plain');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
(async()=>{let browser;await new Promise(r=>server.listen(0,'127.0.0.1',r));try{
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 const base=`http://127.0.0.1:${server.address().port}/`;
 for(const width of [1280,388,323]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[],apiRequests=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/functions/v1/**',route=>{apiRequests.push(route.request().url());return route.abort();});
  await page.goto(base);
  assert(await page.locator('[data-action="start"]').isDisabled());
  assert.match(await page.locator('#entry-help').innerText(),/choose Management adviser or Union adviser/);
  for(const role of ['management','union']){
   await page.locator(`[data-action="role"][data-value="${role}"]`).click();
   assert(await page.locator('[data-action="start"]').isDisabled());
   assert.match(await page.locator('#entry-help').innerText(),/choose one client priority/);
   await page.locator('[data-action="priority"]').first().click();
   assert(await page.locator('[data-action="start"]').isEnabled());
   assert.match(await page.locator('#entry-help').innerText(),/No resume code is needed/);
  }
  // A mistaken resume click has an explicit first-time exit; it needs no code.
  for(let repeat=0;repeat<2;repeat++){
   await page.locator('[data-action="resume"]').click();
   assert.equal(await page.locator('#identity-form').count(),0);
   assert(await page.locator('#resume-form').isVisible());
   assert.match(await page.locator('#assessment-title').innerText(),/Resume or check your grade/);
   await page.locator('#rules-button').click();
   await page.locator('[data-action="close-guide"]').first().click();
   assert(await page.getByRole('button',{name:'First visit? Start the activity',exact:true}).isVisible());
   await page.getByRole('button',{name:'First visit? Start the activity',exact:true}).click();
   assert(await page.locator('[data-action="start"]').isDisabled());
   assert.equal(await page.locator('#resume-form').count(),0);
  }
  await page.locator('[data-action="role"][data-value="management"]').click();
  await page.locator('[data-action="priority"]').first().click();
  await page.locator('[data-action="start"]').click();
  assert.equal(await page.locator('#stage-title').innerText(),'Read your case file.');
  assert.equal(await page.locator('#resume-form').count(),0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
  assert.deepEqual(errors,[]);assert.deepEqual(apiRequests,[]);
  await page.close();console.log(`PASS ${width}px: prerequisites, both roles, repeated resume recovery, guide return, entry, no overflow/errors/API calls`);
 }
}finally{await browser?.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
