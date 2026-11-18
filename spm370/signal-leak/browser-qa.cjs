const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = process.cwd(), out = path.join(root,'signal-qa-results');
const mime = {'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css'};
(async()=>{
 await fs.mkdir(out,{recursive:true});
 const server=http.createServer(async(req,res)=>{try{let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(p.endsWith('/'))p+='index.html';const f=path.resolve(root,'.'+p);if(!f.startsWith(root+path.sep))throw Error('path');res.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');res.end(await fs.readFile(f));}catch{res.statusCode=404;res.end('Not found');}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 let browser;
 try{
  browser=await chromium.launch({headless:true});
  for(const width of [1280,390]){
   const context=await browser.newContext({viewport:{width,height:900},acceptDownloads:true});
   const external=[], errors=[];
   await context.route('**/*',route=>{if(!route.request().url().startsWith(base)){external.push(route.request().url());return route.abort();}return route.continue();});
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   const url=base+'/spm370/signal-leak/?practice=1';
   await page.goto(url);await page.locator('#mode').filter({hasText:'LOCAL PRACTICE'}).waitFor();
   await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').textContent(),'Skip to incident workspace');await page.keyboard.press('Enter');assert.equal(await page.locator(':focus').getAttribute('id'),'main');
   await page.locator('input[name=alias]').fill('QA fictional '+width);await page.locator('input[name=alias]').press('Enter');await page.locator('#desk').waitFor({state:'visible'});
   await page.locator('#orientation summary').click();
   await page.locator('[data-doc=protocol]').focus();await page.keyboard.press('Enter');await page.locator('#document h3').waitFor();assert.equal(await page.locator(':focus').getAttribute('id'),'document');
   await page.locator('#desk summary').filter({hasText:'Ask a person'}).click();await page.locator('#people').selectOption('producer');await page.locator('textarea[name=message]').fill('What can you do about the overlay and clip?');await page.locator('#messageForm button').click();await page.waitForFunction(()=>document.querySelector('textarea[name=message]').value==='');assert.equal(await page.locator('#people').inputValue(),'producer');
   await page.locator('[data-act=pause]').focus();await page.keyboard.press('Enter');await page.locator('#actionForm textarea').fill('Pause protectively and review in ten minutes with campus safety.');await page.locator('#cancelAction').click();assert.equal(await page.locator(':focus').getAttribute('data-act'),'pause');
   await page.keyboard.press('Enter');await page.locator('#actionForm textarea').fill('Pause protectively and review in ten minutes with campus safety.');await page.locator('#actionForm button').first().click();await page.locator('#actionForm').waitFor({state:'hidden'});
   const paragraphs={known:'The location appeared in the broadcast. The visitor connection has not been established. We should distinguish the verified report from uncertainty.',actions:'I paused play and requested a review. Production should stop the overlay and preserve a restricted capture. Campus safety should check in privately with the player.',next:'Review with campus safety in ten minutes. The team needs a clear welfare update; the organizer must monitor repost reports and maintain restricted evidence.'};
   for(const [name,value] of Object.entries(paragraphs))await page.locator(`#memoForm textarea[name=${name}]`).fill(value);
   await page.reload();await page.locator('#desk').waitFor({state:'visible'});for(const [name,value]of Object.entries(paragraphs))assert.equal(await page.locator(`#memoForm textarea[name=${name}]`).inputValue(),value);
   for(let i=0;i<2;i++){await page.locator('#advance').click();await page.locator('#advance').waitFor({state:'visible'});await page.waitForFunction(()=>!document.querySelector('#advance').disabled);}
   await page.locator('#memoForm button').click();await page.locator('#receipt').waitFor({state:'visible'});assert.match(await page.locator('#receiptText').textContent(),/browser only/);
   const pending=page.waitForEvent('download');await page.locator('#download').click();const download=await pending;await download.saveAs(path.join(out,`handoff-${width}.json`));const payload=JSON.parse(await fs.readFile(path.join(out,`handoff-${width}.json`),'utf8'));assert.equal(payload.practiceOnly,true);assert.deepEqual(payload.handoff,paragraphs);assert.ok(payload.decisionLog.length>0);
   const textPending=page.waitForEvent('download');await page.locator('#downloadText').click();const textDownload=await textPending;await textDownload.saveAs(path.join(out,`handoff-${width}.txt`));const text=await fs.readFile(path.join(out,`handoff-${width}.txt`),'utf8');assert.ok(text.includes(paragraphs.known));assert.ok(text.includes('NOT A SUBMISSION RECEIPT'));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'No horizontal overflow');
   await page.screenshot({path:path.join(out,`student-${width}.png`),fullPage:true});
   await page.reload();await page.locator('#receipt').waitFor({state:'visible'});
   const instructor=await context.newPage();await instructor.goto(base+'/spm370/signal-leak/instructor.html?practice=1');await instructor.locator('#load button').click();await instructor.locator('#runs article').waitFor();assert.match(await instructor.locator('#runs').textContent(),/QA fictional/);assert.match(await instructor.locator('#runs').textContent(),/visitor connection/);
   await instructor.screenshot({path:path.join(out,`instructor-${width}.png`),fullPage:true});
   assert.deepEqual(errors,[],'No student page JavaScript errors');assert.deepEqual(external,[],'No external requests or live data');
   console.log(`PASS ${width}: keyboard, records, recipient, cancel, action, draft restore, finalize, download, refresh, local instructor retrieval, overflow`);
   await context.close();
  }
 } finally {if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
