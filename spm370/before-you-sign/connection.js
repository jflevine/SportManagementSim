'use strict';
window.BYS=(()=>{
 const ENDPOINT='https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm370-before-you-sign';
 const KEY='spm370-bys-private-session-v2';
 let token='',pending=null;
 try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v&&/^[a-f0-9]{48}$/.test(v.token)){token=v.token;pending=v.pending||null;}}catch{}
 function remember(){try{localStorage.setItem(KEY,JSON.stringify({token,pending}));return true;}catch{return false;}}
 async function call(action,body={}){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);
  try{const r=await fetch(ENDPOINT,{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json','x-attempt-token':token},body:JSON.stringify({action,...body}),signal:controller.signal});let d;try{d=await r.json();}catch{throw Error('The server did not confirm this request. Keep this page open and retry.');}if(!r.ok||!d.ok){const e=Error(d.error||'Request not confirmed.');e.status=r.status;throw e;}return d;
  }catch(e){if(e.name==='AbortError')throw Error('The connection timed out. Your draft is still here. Retry to check for a receipt.');throw e;}finally{clearTimeout(timer);}
 }
 return {ENDPOINT,hasSession:()=>Boolean(token),token:()=>token,remember,
  forget:()=>{token='';pending=null;try{localStorage.removeItem(KEY);}catch{}},
  adopt:code=>{if(!/^[a-f0-9]{48}$/.test(code.trim()))throw Error('Enter the complete 48-character resume code.');token=code.trim();pending=null;remember();},
  start:async(name,email)=>{if(!token){token=Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');pending={name,email,attest:true};remember();}let d;try{d=await call('start',pending||{name,email,attest:true});}catch(e){if(e.status===400||e.status===409){token='';pending=null;remember();}throw e;}pending=null;remember();return d;},
  resume:async()=>{if(pending){const d=await call('start',pending);pending=null;remember();return d;}return call('resume');},call
 };
})();
