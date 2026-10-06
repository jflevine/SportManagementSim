'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const {JSDOM}=require('jsdom');
const dir=path.resolve(__dirname,'..'),KEY='spm343-build-the-hype-v1';
function boot({save=null,hash='',storageFails=false,downloadFails=false}={}){
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');const dom=new JSDOM(html,{url:'https://example.test/spm343/build-the-hype/'+hash,runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;
 const errors=[];w.addEventListener('error',e=>errors.push(e.error));w.scrollTo=()=>{};w.print=()=>{w.printed=true;};w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.HTMLAnchorElement.prototype.click=function(){w.downloadLink={filename:this.download,href:this.href};};w.URL.createObjectURL=b=>{if(downloadFails)throw new Error('blocked');w.downloadBlob=b;return 'blob:fixture';};w.URL.revokeObjectURL=()=>{};
 if(save)w.localStorage.setItem(KEY,typeof save==='string'?save:JSON.stringify(save));
 if(storageFails){w.Storage.prototype.getItem=()=>{throw new Error('blocked')};w.Storage.prototype.setItem=()=>{throw new Error('blocked')};}
 w.eval(fs.readFileSync(path.join(dir,'model.js'),'utf8'));w.eval(fs.readFileSync(path.join(dir,'app.js'),'utf8'));
 const q=s=>w.document.querySelector(s);const click=s=>{assert.ok(q(s),`Missing ${s}`);assert.equal(q(s).disabled,false,`Disabled ${s}`);q(s).click();};
 return {dom,w,q,click,errors,state:()=>JSON.parse(w.localStorage.getItem(KEY)),close:()=>dom.window.close()};
}
function finish(ui,{mission='compete',format='groups',features=['coaching','cast'],adjustment='backup'}={}){const {click}=ui;click('#next');click(`[data-mission="${mission}"]`);click('#next');click(`[data-format="${format}"]`);click('#next');for(const f of features)click(`[data-feature="${f}"]`);click('#next');click(`[data-adjustment="${adjustment}"]`);click('#next');}
test('solo and pair complete all phases, expose no identity/login/submission fields',()=>{
 for(const mode of ['solo','pair']){const u=boot();u.click(`[data-mode="${mode}"]`);finish(u);assert.equal(u.state().step,5);assert.equal(u.state().mode,mode);assert.ok(u.q('#download'));assert.match(u.q('#screen').textContent,/not real attendance/);assert.match(u.q('#screen').textContent,/Not measured/);assert.equal(u.q('input[type=email],input[type=password]'),null);assert.deepEqual(u.errors,[]);u.close();}
});
test('feature limit, budget failure, repeated clicks, and zero-feature plan remain functional',()=>{
 const u=boot();u.click('#next');u.click('[data-mission="showcase"]');u.click('#next');u.click('[data-format="knockout"]');u.click('#next');u.click('[data-feature="cast"]');u.click('[data-feature="creator"]');u.click('[data-feature="coaching"]');assert.match(u.q('#selection-status').textContent,/exceed/);assert.equal(u.state().features.length,2);
 u.click('[data-feature="predictions"]');u.click('[data-feature="spotlight"]');assert.match(u.q('#selection-status').textContent,/Three features/);assert.equal(u.state().features.length,3);
 for(const id of ['cast','creator','predictions'])u.click(`[data-feature="${id}"]`);assert.equal(u.state().features.length,0);u.click('#next');u.click('[data-adjustment="remix"]');u.click('#next');assert.match(u.q('#screen').textContent,/10 of 10/);u.close();
});
test('reload restores selections, text, outcome and same surprise',()=>{
 const a=boot();finish(a);a.q('#reflection').value='Our audience drove the format.';a.q('#reflection').dispatchEvent(new a.w.Event('input'));const saved=a.state();a.close();
 const b=boot({save:saved});assert.equal(b.state().step,5);assert.equal(b.q('#reflection').value,'Our audience drove the format.');assert.match(b.q('#print-report').textContent,/Our audience drove/);b.click('#replay');assert.equal(b.state().adjustment,'');assert.equal(b.state().reflection,'');assert.deepEqual(b.state().features,['coaching','cast']);assert.equal(b.state().step,1);b.close();
});
test('back navigation and edited choices invalidate old adjustment and recap',async()=>{
 const u=boot();finish(u);u.click('[data-go="1"]');u.click('[data-mission="connect"]');assert.equal(u.state().adjustment,'');assert.equal(u.q('#print-report').textContent,'');assert.equal(u.q('[data-go="5"]').disabled,true);
 u.click('#next');u.click('#next');u.click('#next');u.click('[data-adjustment="delay"]');u.click('#next');u.w.history.back();await new Promise(r=>setTimeout(r,150));assert.equal(u.state().step,4);assert.match(u.q('#screen-title').textContent,/real life/);u.w.history.forward();await new Promise(r=>setTimeout(r,150));assert.equal(u.state().step,5);u.close();
});
test('escaping, static report download, print, and download failure',()=>{
 const u=boot();u.q('#event-name').value='<img src=x onerror=alert(1)>';u.q('#event-name').dispatchEvent(new u.w.Event('input'));finish(u);u.q('#reflection').value='<script>alert(1)</script>';u.q('#reflection').dispatchEvent(new u.w.Event('input'));assert.equal(u.q('#poster img[onerror]'),null);assert.equal(u.q('#print-report script'),null);u.click('#download');assert.equal(u.w.downloadLink.filename,'build-the-hype-recap.html');assert.match(u.q('#export-status').textContent,/No work was submitted/);u.click('#print');assert.equal(u.w.printed,true);u.close();
 const b=boot({downloadFails:true});finish(b);b.click('#download');assert.match(b.q('#export-status').textContent,/blocked/);b.close();
});
test('corrupted/blocked storage and invalid hashes do not block play',()=>{
 for(const settings of [{save:'bad JSON'},{storageFails:true},{hash:'#5'}]){const u=boot(settings);assert.ok(u.q('#next'));if(settings.hash)assert.equal(u.state().step,1);else finish(u);assert.deepEqual(u.errors,[]);u.close();}
});
test('reset requires a dialog; cancel preserves work; confirm replaces only this save',()=>{
 const u=boot();finish(u);u.w.localStorage.setItem('unrelated-course','keep');u.click('#reset-button');assert.equal(u.q('#reset-dialog').open,true);u.click('#cancel-reset');assert.equal(u.state().step,5);u.click('#reset-button');u.click('#confirm-reset');assert.equal(u.state().step,0);assert.deepEqual(u.state().features,[]);assert.equal(u.w.localStorage.getItem('unrelated-course'),'keep');u.click('#guide-button');assert.equal(u.q('#guide-dialog').open,true);u.close();
});
test('semantic keyboard controls, focus restoration and reduced-motion styles exist',()=>{
 const u=boot();u.click('#next');assert.equal(u.w.document.activeElement.id,'screen');u.click('[data-mission="compete"]');assert.equal(u.w.document.activeElement.dataset.mission,'compete');assert.equal(u.q('[data-mission="compete"]').getAttribute('aria-pressed'),'true');assert.ok(u.q('.skip-link'));assert.ok(u.q('#announcer[aria-live="polite"]'));assert.ok(u.q('label[for]')===null);const css=fs.readFileSync(path.join(dir,'styles.css'),'utf8');assert.match(css,/prefers-reduced-motion/);assert.match(css,/@media\(max-width:680px\)/);assert.match(css,/:focus-visible/);assert.match(css,/@media print/);u.close();
});
