const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
// All assessment calls use a synthetic in-memory server. Nothing reaches production.
const sourceDir=process.env.DL4_SOURCE_DIR||__dirname;
const backendDir=process.env.DL4_BACKEND_DIR||path.join(sourceDir,'backend');
const turn=()=>new Promise(setImmediate);
const decode=s=>String(s).replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const attrs=s=>{const r={};for(const m of s.matchAll(/([a-zA-Z_][\w:.-]*)(?:="([^"]*)")?/g))r[m[1]]=m[2]===undefined?true:decode(m[2]);return r;};
class Clock {
 constructor(){this.now=0;this.next=1;this.timers=new Map();}
 setTimeout(fn,ms=0,...args){const id=this.next++;this.timers.set(id,{when:this.now+Math.max(0,Number(ms)||0),fn,args});return id;}
 clearTimeout(id){this.timers.delete(id);}
 async advance(ms){const target=this.now+ms;let n=0;for(;;){const next=[...this.timers].filter(([,x])=>x.when<=target).sort((a,b)=>a[1].when-b[1].when)[0];if(!next)break;if(++n>2000)throw Error('Timer loop');this.now=next[1].when;this.timers.delete(next[0]);next[1].fn(...next[1].args);await turn();await turn();}this.now=target;await turn();await turn();}
}
class Dom {
 constructor(){this.ids=new Map();this.nodes=[];this.listeners={};this.activeElement=null;this.host=this.element({id:'assessment-host'});Object.defineProperty(this.host,'innerHTML',{get:()=>this.html||'',set:v=>{this.html=String(v);this.parse();}});this.ids.set('assessment-host',this.host);this.body={appendChild(){},classList:{add(){},remove(){}}};}
 element(a={},tag='div',content=''){const dom=this;const e={tagName:tag.toUpperCase(),id:a.id||'',name:a.name||'',type:a.type||'',value:a.value===undefined?(tag==='textarea'?decode(content):''):a.value,checked:!!a.checked,disabled:!!a.disabled,textContent:decode(content),dataset:{},attributes:a,form:null,parentForm:null,style:{},classList:{add(){},remove(){},contains(){return false;}},focus(){dom.activeElement=this;},remove(){dom.nodes=dom.nodes.filter(x=>x!==this);if(this.id)dom.ids.delete(this.id);},click(){dom.onAnchorClick?.(this);},setAttribute(k,v){this.attributes[k]=String(v);if(k==='disabled')this.disabled=true;},removeAttribute(k){delete this.attributes[k];if(k==='disabled')this.disabled=false;},getAttribute(k){return this.attributes[k]??null;},hasAttribute(k){return k in this.attributes;},contains(other){return other===this||other?.parentForm===this.id;},closest(selector){if(selector==='#graded-form'||selector==='#identity-form')return this.parentForm===selector.slice(1)?dom.ids.get(selector.slice(1)):null;if(selector==='button')return this.tagName==='BUTTON'?this:null;if(selector==='[data-grade]')return this.dataset.grade?this:null;if(selector==='form')return this.form;return null;},matches(selector){return dom.matches(this,selector);},querySelector(selector){return dom.querySelector(selector);},querySelectorAll(selector){return dom.querySelectorAll(selector);}};
 for(const [k,v]of Object.entries(a))if(k.startsWith('data-'))e.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v;
 return e;}
 parse(){this.ids=new Map([['assessment-host',this.host]]);this.nodes=[];this.activeElement=null;
 const forms=[...this.html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/g)].map(m=>({id:attrs(m[1]).id,start:m.index,end:m.index+m[0].length}));
 for(const m of this.html.matchAll(/<(input|textarea|form|button|fieldset|p|h2|details|section|div)\b([^>]*)>/g)){const a=attrs(m[2]);let text='';if(['textarea','button'].includes(m[1])){const end=this.html.indexOf('</'+m[1]+'>',m.index);text=this.html.slice(m.index+m[0].length,end<0?undefined:end);}const e=this.element(a,m[1],text);e.parentForm=forms.find(f=>m.index>f.start&&m.index<f.end)?.id||null;this.nodes.push(e);if(e.id)this.ids.set(e.id,e);}
 for(const n of this.nodes)n.form=n.parentForm?this.ids.get(n.parentForm):null;
 }
 getElementById(id){return this.ids.get(id)||null;}
 addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
 dispatch(type,e){for(const fn of this.listeners[type]||[])fn(e);}
 createElement(tag){return this.element({},tag);}
 matches(e,selector){
  if(selector.includes(',').valueOf())return selector.split(',').some(s=>this.matches(e,s.trim()));
  if(selector==='#graded-form .assessment-controls')return e.parentForm==='graded-form'&&String(e.attributes.class||'').split(/\s+/).includes('assessment-controls');
  if(selector==='#graded-form button[type="submit"]')return e.parentForm==='graded-form'&&e.tagName==='BUTTON'&&e.type==='submit';
  if(selector==='#graded-form textarea')return e.tagName==='TEXTAREA'&&e.parentForm==='graded-form';
  if(selector==='#identity-form input')return e.tagName==='INPUT'&&e.parentForm==='identity-form';
  if(selector==='#resume-form input')return e.tagName==='INPUT'&&e.parentForm==='resume-form';
  if(selector.startsWith('#')&&!selector.includes(' '))return e.id===selector.slice(1);
  const n=selector.match(/input\[name=["']([^"']+)["']\](:checked)?/);
  if(n)return e.tagName==='INPUT'&&e.name===n[1]&&(!n[2]||e.checked);
  const data=selector.match(/^\[data-([\w-]+)(?:=["']([^"']+)["'])?\]$/);
  if(data){const k=data[1].replace(/-([a-z])/g,(_,c)=>c.toUpperCase());return e.dataset[k]!==undefined&&(data[2]===undefined||e.dataset[k]===data[2]);}
  return e.tagName.toLowerCase()===selector;
 }
 querySelectorAll(selector){return this.nodes.filter(e=>this.matches(e,selector));}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
}
async function createHarness(role='management'){
 const {createHandler,hash}=await import(pathToFileURL(path.join(backendDir,'server.mjs')));
 const {memoryStore,assessment,TEST_KEY}=await import(pathToFileURL(path.join(backendDir,'tests/fixtures.mjs')));
 const store=memoryStore();store.setAssessment({...assessment,explanationMinWords:20,maxExplanationChars:1800});
 const handler=createHandler({store,instructorKeyHash:await hash(TEST_KEY),rateSecret:'synthetic-independent-reliability'});
 const clock=new Clock(),dom=new Dom(),faults=[],calls=[],pending=[],windowEvents={},errors=[],downloads=[];
 const downloadURL={createObjectURL(blob){const url='blob:synthetic-'+downloads.length;downloads.push({url,blob});return url;},revokeObjectURL(){}};
 dom.onAnchorClick=e=>{const file=downloads.find(d=>d.url===e.href);if(file)file.name=e.download;};
 const fetch=async(url,options)=>{
  const body=JSON.parse(options.body),token=options.headers['x-attempt-token'];
  const call={body:structuredClone(body),token,signal:options.signal,status:null,phase:'handling'};calls.push(call);
  const idx=faults.findIndex(f=>f.action===body.action);const fault=idx<0?null:faults.splice(idx,1)[0];
  if(fault?.kind==='never-fetch'){call.phase='pending';return new Promise((resolve,reject)=>pending.push({action:body.action,resolve,reject}));}
  if(fault?.kind==='reject-before'){call.phase='done';throw new TypeError('Synthetic offline transport');}
  if(fault?.kind==='503'){call.status=503;call.phase='done';return new Response(JSON.stringify({error:'Synthetic unavailable',code:'SERVER_UNAVAILABLE'}),{status:503,headers:{'Content-Type':'application/json'}});}
  if(fault?.kind==='429'){call.status=429;call.phase='done';return new Response(JSON.stringify({error:'Synthetic rate limit; retry later',code:'RATE_LIMITED'}),{status:429,headers:{'Content-Type':'application/json'}});}
  const response=await handler(new Request(url,{...options,headers:{...options.headers,Origin:'https://jflevine.github.io'}}));
  call.status=response.status;
  if(fault?.kind==='lost-after-commit'){call.phase='done';throw new TypeError('Synthetic lost response after successful write');}
  if(fault?.kind==='never-body'){return {ok:response.ok,status:response.status,json:()=>{call.phase='pending';return new Promise((resolve,reject)=>pending.push({action:body.action,resolve,reject}));}};}
  if(fault?.kind==='hold-after-commit'){const data=await response.json();call.phase='pending';return await new Promise(resolve=>pending.push({action:body.action,release:()=>{call.phase='done';resolve({ok:response.ok,status:response.status,json:async()=>structuredClone(data)});}}));}
  call.phase='done';
  return response;
 };
 const context={document:dom,console,crypto:require('node:crypto').webcrypto,structuredClone,Blob,URL:downloadURL,AbortController,AbortSignal,Promise,TextEncoder,
  setTimeout:clock.setTimeout.bind(clock),clearTimeout:clock.clearTimeout.bind(clock),fetch,
  FormData:class {constructor(f){this.form=f;}get(name){if(this.form.data)return this.form.data[name]??null;const el=dom.nodes.find(e=>e.parentForm===this.form.id&&e.name===name);return el?.type==='checkbox'?el.checked?'on':null:el?.value??null;}},
  confirm:()=>true,alert:m=>errors.push(m),addEventListener:(t,f)=>(windowEvents[t]??=[]).push(f),removeEventListener:(t,f)=>windowEvents[t]=(windowEvents[t]||[]).filter(x=>x!==f),
  location:{href:'https://synthetic.invalid/'},navigator:{onLine:true},performance:{now:()=>clock.now}
 };
 context.window=context;
 vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(sourceDir,'assessment.js'),'utf8'),context,{filename:'assessment.js'});
 context.LAB_ASSESS.mount({role,roleName:role+' adviser',gameplay:{priority:'synthetic',evidence:['one','two'],strategy:'synthetic',twist:'synthetic'}});
 const flush=async()=>{for(let i=0;i<2000;i++){await turn();if(i%20===19)await new Promise(resolve=>setTimeout(resolve,1));const latest=calls.at(-1);if(i>=12&&((!context.LAB_ASSESS.state().busy&&latest?.phase!=='handling')||latest?.phase==='pending'))break;}};
 const advance=clock.advance.bind(clock);clock.advance=async(ms)=>{await advance(ms);await flush();};
 const change=(id,value)=>{const el=dom.getElementById(id);assert(el,'Missing field '+id);el.value=value;dom.dispatch('input',{target:el});};
 const choose=(index,value)=>{for(const el of dom.nodes.filter(e=>e.name==='mc-'+index))el.checked=el.value===value;const selected=dom.nodes.find(e=>e.name==='mc-'+index&&e.checked);assert(selected,'Missing radio '+index);dom.dispatch('input',{target:selected});};
 const click=async grade=>{const el=dom.nodes.find(e=>e.dataset.grade===grade);assert(el,'Missing data-grade '+grade);assert(!el.disabled,'Disabled '+grade);dom.dispatch('click',{target:el});await flush();};
 const forceClick=async grade=>{dom.dispatch('click',{target:{closest:()=>({dataset:{grade},disabled:false})}});await flush();};
 const submit=async id=>{const form=dom.getElementById(id);assert(form,'Missing form '+id);dom.dispatch('submit',{target:form,preventDefault(){}});await flush();};
 const begin=async()=>{change('student-name','Synthetic Reliability');change('student-email','synthetic-'+role+'@lasalle.edu');const attest=dom.nodes.find(e=>e.parentForm==='identity-form'&&e.name==='attest');if(attest)attest.checked=true;await submit('identity-form');};
 const answerText='This is synthetic student writing for an independent recovery test. The proposed advice has enough meaningful words to pass the completion gate without using any real student data.';
 const fill=(text=answerText)=>{assessment.questions.forEach((q,i)=>choose(i,q.answer));change('explanation',text);};
 const beforeUnload=()=>{const e={type:'beforeunload',defaultPrevented:false,returnValue:undefined,preventDefault(){this.defaultPrevented=true;}};for(const f of windowEvents.beforeunload||[])f(e);return e.defaultPrevented||e.returnValue!==undefined;};
 const dispose=async()=>{for(const p of pending){try{p.reject?.(new Error('Synthetic test cleanup'));p.release?.();}catch{}}await flush();clock.timers.clear();};
 return {store,clock,dom,context,calls,faults,pending,errors,downloads,flush,change,choose,click,forceClick,submit,begin,fill,beforeUnload,dispose,answerText,state:()=>context.LAB_ASSESS.state()};
}
module.exports={createHarness,turn};

