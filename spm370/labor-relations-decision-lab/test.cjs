const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const listeners={},nodes={};
const node=id=>nodes[id]??=( {innerHTML:'',textContent:'',value:'',disabled:false,classList:{add(){},remove(){},toggle(){}},addEventListener(){},focus(){},scrollIntoView(){},setCustomValidity(){},reportValidity(){}} );
const context=vm.createContext({document:{getElementById:node,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:(type,fn)=>listeners[type]=fn,body:{appendChild(){}}},window:{scrollTo(){},addEventListener(){},print(){}},requestAnimationFrame:fn=>fn(),location:{hash:'',pathname:'/',search:''},history:{replaceState(){}},setTimeout,URL,Blob,confirm:()=>false});
vm.runInContext(source,context);
const run=s=>vm.runInContext(s,context);
const click=data=>listeners.click({target:{closest:()=>({dataset:data,disabled:false})}});
assert(nodes.app.innerHTML.includes('The meetings stopped.'));
click({action:'start'}); assert.equal(run('state.stage'),1);
click({file:'0'});click({file:'0'});click({file:'1'});click({file:'2'});assert.equal(run('state.opened.length'),2);
click({action:'toResponse'});assert.equal(run('state.stage'),2);
click({response:'1'});click({response:'0'});assert.equal(run('state.response'),1);
click({action:'toTwist'});click({twist:'0'});click({twist:'3'});assert.equal(run('state.twist'),0);
click({action:'toMemo'});assert(nodes.app.innerHTML.includes('memoForm'));
let paths=0;
for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)for(let a=0;a<4;a++)for(let b=0;b<4;b++){
 run(`state.opened=[${i},${j}];state.response=${a};state.twist=${b};state.complete=false;`);
 for(let stage=1;stage<=4;stage++){run(`showStage(${stage})`);assert(!nodes.app.innerHTML.includes('undefined'));assert(nodes.app.innerHTML.length>2000)}
 run(`state.memo={risk1:'<script>alert(1)</script> bad faith',risk2:'Financial disclosure risk tied to refusal.',missing:'The complete record and financial request.',next:'Schedule meetings and provide relevant support.'};state.complete=true;render()`);
 assert(!nodes.app.innerHTML.includes('<script>alert'));assert(nodes.app.innerHTML.includes('&lt;script&gt;'));assert(run('reportText()').includes('Financial disclosure risk'));
 paths++;
}
assert(!/localStorage|sessionStorage|fetch\(|XMLHttpRequest|sendBeacon/.test(source));
assert(html.includes('minlength="20"'));assert(html.includes('@media(max-width:760px)'));
assert(html.includes('prefers-reduced-motion'));assert(html.includes('Skip to activity'));
console.log('PASS: '+paths+' complete decision combinations; double-click locks; 2-file limit; memo escaping; no network submission or persistence; responsive/accessibility structure.');
