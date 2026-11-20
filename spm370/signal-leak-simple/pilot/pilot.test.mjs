import test from 'node:test';
import assert from 'node:assert/strict';
import { handler } from './handler.mjs';
import { bindPilot } from './client.mjs';
import { pilot } from './config.mjs';
import {readFileSync} from 'node:fs';
const id='12345678-1234-4234-8234-123456789123',sub='dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const p={attemptId:id,choices:[0,1,1],answers:['Pause privately','Ask safety lead','Check consent']};
const origin='https://school.example';
const post=(opts={})=>new Request(origin+'/api',{method:opts.method??'POST',headers:{origin:opts.origin??origin,...(opts.token===false?{}:{authorization:'Bearer synthetic'})},...(opts.method==='GET'?{}:{body:JSON.stringify(opts.data??p)})});
test('disabled server and client are closed and Canvas fallback remains explicit',async()=>{
 assert.equal((await handler({origin,enabled:false})(post())).status,503);
 assert.equal(bindPilot(null,null,{config:pilot}),undefined);
 const h=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(h,/copy its full contents.*Signal Leak Check.*Text Entry.*Submit Assignment/);
 assert.match(h,/Download handoff/);
});
test('authorization and payload controls precede storage',async()=>{
 let writes=0;
 const make=(verifyUser)=>handler({origin,enabled:true,verifyUser,save:async()=>{writes++;return null;}});
 const valid=make(async()=>({id:sub,verified:true}));
 for(const [request,expected] of [[post({origin:'https://other.example'}),403],[post({method:'GET'}),405],[post({token:false}),401],[post({data:{...p,email:'fake@example.test'}}),400],[post({data:{...p,answers:['x',' ','z']}}),400],[post({data:{...p,choices:[0,1,3]}}),400],[post({data:{...p,answers:['x'.repeat(31000),'y','z']}}),400]])assert.equal((await valid(request)).status,expected);
 assert.equal((await make(async()=>({id:sub,verified:false}))(post())).status,401);
 assert.equal(writes,0);
 assert.equal((await valid(post())).status,403);
});
test('same copy replay yields same receipt; conflicting edit does not replace',async()=>{
 let first, commits=0;const receipt={receipt:id,savedAt:'2026-11-20T00:00:00Z'};
 const h=handler({origin,enabled:true,verifyUser:async()=>({id:sub,verified:true}),save:async(s,b)=>{
  assert.equal(s,sub);
  const json=JSON.stringify(b);
  if(first&&first!==json)return {conflict:true};
  if(!first){first=json;commits++;}
  return receipt;
 }});
 const dropped=await h(post());assert.equal(dropped.status,200);
 const retry=await h(post());assert.deepEqual(await retry.json(),{attemptId:id,...receipt});
 assert.equal((await h(post({data:{...p,answers:['edited','x','y']}}))).status,409);
 assert.equal(commits,1);
});
class Element{
 constructor(ownerDocument){this.ownerDocument=ownerDocument;this.children=[];this.events={};}
 append(...nodes){this.children.push(...nodes);}
 setAttribute(){}
 addEventListener(name,fn){this.events[name]=fn;}
}
test('optional client sends only with consent, survives lost response, and binds the snapshot',async()=>{
 const doc={createElement(){return new Element(doc);}};
 const box=new Element(doc), cache=new Map();let sent=[],account=sub;
 bindPilot(box,{choices:p.choices,answers:p.answers},{
   config:{enabled:true,endpoint:origin+'/api',acquireSession:async()=>({subject:account,accessToken:'synthetic'})},
   storage:{getItem:k=>cache.get(k),setItem:(k,v)=>cache.set(k,v)},
   uuid:()=>id,fetcher:async(u,o)=>{sent.push(JSON.parse(o.body));if(sent.length===1)throw Error();return Response.json({attemptId:id,receipt:id,savedAt:'2026-11-20T00:00:00Z'});}
 });
 const [, , label, button, message]=box.children[0].children;
 assert.equal(sent.length,0);
 await button.events.click();assert.equal(sent.length,0);
 label.children[0].checked=true;
 await button.events.click();assert.match(message.textContent,/No save was confirmed/);
 account=id;
 await button.events.click();assert.match(message.textContent,/different account/);assert.equal(sent.length,1);
 account=sub;
 await button.events.click();assert.match(message.textContent,/pilot copy saved/);
 assert.deepEqual(sent,[p,p]);assert.equal([...cache.values()][0].includes('synthetic'),false);
});
