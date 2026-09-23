import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {fileURLToPath} from 'node:url';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {JSDOM,VirtualConsole}=require(process.env.JSDOM_PATH||'jsdom');
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function app(){let html=fs.readFileSync(path.join(dir,'index.html'),'utf8');let js=fs.readFileSync(path.join(dir,'model.js'),'utf8').replaceAll('export ','')+'\n'+fs.readFileSync(path.join(dir,'app.js'),'utf8').split('\n').slice(1).join('\n');
 html=html.replace('<script type="module" src="app.js"></script>',()=>'<script>'+js+'</script>');const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://example.test',virtualConsole:vc,beforeParse(w){w.scrollTo=()=>{};w.alert=()=>{};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async t=>{w.copied=t}}});}});
 const d=dom.window.document,q=s=>d.querySelector(s),click=s=>{assert.ok(q(s),s);q(s).click();};return{dom,d,q,click,errors};}
for(const pct of ['0','0.5','0.7'])test(`complete DOM interaction run: ${pct} debt, selection/removal, validation, results, reset`,async()=>{
 const {dom,d,q,click,errors}=app();click('#howBtn');assert.ok(q('#howDialog').open);click('#closeHow');click('#launchBtn');assert.equal(q('.screen.active').id,'decisionCenter');
 for(let c=1;c<=3;c++){
  assert.equal(q('#cycleLabel').textContent,`CYCLE ${c} / 3`);
  const opts=[...d.querySelectorAll('[data-proposal]')];const cp=opts.find(x=>x.textContent.includes('CAPITAL'));assert.ok(cp);cp.click();
  click(`[data-debt="${pct}"]`);assert.equal(d.querySelectorAll('.portfolio-item').length,1);
  click('#selectBtn');assert.equal(d.querySelectorAll('.portfolio-item').length,0);click('#selectBtn');click(`[data-debt="${pct}"]`);
  for(const id of ['docScenario','docAdvisors','docWorkbook']){click(`[data-doc="${id}"]`);assert.ok(q('#'+id).classList.contains('active'));}
  assert.equal(d.querySelectorAll('.advisor').length,3);
  const others=[...d.querySelectorAll('[data-proposal]')].filter(x=>x.dataset.proposal!==cp.dataset.proposal);
  others[0].click();click('#selectBtn');others[1].click();click('#selectBtn');assert.equal(d.querySelectorAll('.portfolio-item').length,2);
  click('#commitBtn');assert.equal(q('.screen.active').id,'rationaleScreen');click('#runCycleBtn');assert.equal(q('.screen.active').id,'rationaleScreen');
  click('#backBtn');assert.equal(q('.screen.active').id,'decisionCenter');assert.equal(d.querySelectorAll('.portfolio-item').length,2);click('#commitBtn');
  q('#rationaleText').value='We chose lasting revenue over talent now because cash supports our growth mandate.';q('#riskChoice').value='Demand / adoption risk';click('#runCycleBtn');
  assert.equal(q('.screen.active').id,'resultScreen');assert.equal(d.querySelectorAll('#actualVsForecast tr').length,2);assert.ok(q('#resultEvent').textContent);assert.ok(q('#diagnosis').textContent.includes('principal repaid'));click('#advanceBtn');
 }
 assert.equal(q('.screen.active').id,'finalScreen');assert.equal(d.querySelectorAll('#history tr').length,3);assert.equal(d.querySelectorAll('#scorecards>div').length,5);click('#copyReport');await Promise.resolve();assert.ok(dom.window.copied.includes('Board score'));
 click('#againBtn');assert.equal(q('.screen.active').id,'welcome');click('#launchBtn');assert.equal(q('#cycleLabel').textContent,'CYCLE 1 / 3');click('#resetBtn');assert.equal(q('.screen.active').id,'welcome');assert.deepEqual(errors,[]);dom.window.close();
});
test('holding cash is playable through all three cycles with a rationale',()=>{const {dom,q,click,errors}=app();click('#launchBtn');for(let c=1;c<=3;c++){click('#commitBtn');assert.ok(q('#rationalePortfolio').textContent.includes('Hold cash'));q('#riskChoice').value='Opportunity-cost risk';q('#rationaleText').value='We hold cash rather than commit before we have convincing demand evidence.';click('#runCycleBtn');click('#advanceBtn');}assert.equal(q('.screen.active').id,'finalScreen');assert.deepEqual(errors,[]);dom.window.close();});
test('every literal ID selector has a live element; removed evidence is absent',()=>{const {dom,d}=app();const js=fs.readFileSync(path.join(dir,'app.js'),'utf8');for(const m of js.matchAll(/\$\('#([a-zA-Z0-9_-]+)'\)/g))assert.ok(d.getElementById(m[1]),m[1]);assert.ok(!d.body.textContent.toLowerCase().includes('department file'));dom.window.close();});
