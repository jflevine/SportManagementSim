'use strict';
window.LLC3=(()=>{
 const ENDPOINT='https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm370-llc3-v3';
 const KEY='spm370-llc3-private-session-v3';let token='',pending=null;
 try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&/^[a-f0-9]{48}$/.test(s.token)){token=s.token;pending=s.pending||null;}}catch{}
 const remember=()=>{try{localStorage.setItem(KEY,JSON.stringify({token,pending}));return true;}catch{return false;}};
 async function call(action,body={}){const c=new AbortController(),timer=setTimeout(()=>c.abort(),18000);try{const r=await fetch(ENDPOINT,{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json','x-attempt-token':token},body:JSON.stringify({action,...body}),signal:c.signal});let d;try{d=await r.json();}catch{throw Error('No server confirmation was received. Keep your draft and retry.');}if(!r.ok||!d.ok){const e=Error(d.error||'Request not confirmed.');e.status=r.status;throw e;}return d;}catch(e){if(e.name==='AbortError')throw Error('The connection timed out. Retry to check what the server saved.');throw e;}finally{clearTimeout(timer);}}
 return {ENDPOINT,hasSession:()=>!!token,token:()=>token,call,remember,
 adopt:code=>{if(!/^[a-f0-9]{48}$/.test(code.trim()))throw Error('Enter the complete 48-character resume code.');token=code.trim();pending=null;remember();},
 start:async(name,email)=>{if(!token){token=Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');pending={name,email,attest:true};remember();}let d;try{d=await call('start',pending||{name,email,attest:true});}catch(e){if([400,409].includes(e.status)){token='';pending=null;remember();}throw e;}pending=null;remember();return d;},
 resume:async()=>{if(pending){const d=await call('start',pending);pending=null;remember();return d;}return call('resume');}
 };
})();
