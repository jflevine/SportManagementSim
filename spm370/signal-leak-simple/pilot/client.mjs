export function bindPilot(container, snapshot, {config, storage, fetcher, uuid}) {
 if (!config.enabled || !/^https:\/\//.test(config.endpoint) || typeof config.acquireSession !== 'function') return;
 const doc=container.ownerDocument;
 const el=(tag,text)=>{const n=doc.createElement(tag);n.textContent=text;return n;};
 const box=el('section','');box.className='card';
 const consent=el('input','');consent.type='checkbox';
 const label=el('label','');label.append(consent,' I choose to send this handoff as an optional pilot copy to my instructor.');
 const button=el('button','Send optional pilot copy');button.type='button';
 const message=el('p','');message.setAttribute('role','status');
 box.append(el('h3','Optional pilot copy'),el('p','Canvas text entry is still the official submission. If you opt in, the pilot sends your verified course account ID, three decisions and three written responses to the restricted instructor store. It is not required and does not affect your grade.'),label,button,message);
 container.append(box);
 const key='spm370-signal-leak-simple-pilot-v1';
 button.addEventListener('click',async()=>{
   if(!consent.checked){message.textContent='Choose the optional checkbox before sending. Nothing was sent.';return;}
   button.disabled=true;
   let timer;
   try {
     const session=await config.acquireSession();
     if(!session?.accessToken || !session?.subject) {message.textContent='No verified course session. Nothing was sent. Use Canvas.';return;}
     const current=JSON.stringify(snapshot);
     let save=JSON.parse(storage.getItem(key)||'null');
     if(save&&(save.subject!==session.subject||save.snapshot!==current)){
       message.textContent='An earlier pilot copy is held for a different account or version. To avoid replacing it, use Canvas for this version.';return;
     }
     if(!save){
       save={subject:session.subject,snapshot:current,attemptId:uuid()};
       storage.setItem(key,JSON.stringify(save));
     }
     const controller=new AbortController();timer=setTimeout(()=>controller.abort(),10000);
     const res=await fetcher(config.endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.accessToken,...(config.publishableKey?{apikey:config.publishableKey}:{})},body:JSON.stringify({attemptId:save.attemptId,...JSON.parse(save.snapshot)}),signal:controller.signal,cache:'no-store'});
     const receipt=await res.json();
     if(!res.ok||receipt.attemptId!==save.attemptId||typeof receipt.receipt!=='string'||!Number.isFinite(Date.parse(receipt.savedAt))) throw new Error('No confirmed receipt');
     message.textContent='Optional pilot copy saved. Receipt: '+receipt.receipt+'. Submit your official response in Canvas.';
   }catch{message.textContent='No save was confirmed. You can retry this exact copy or submit in Canvas. Download still works.';}
   finally{clearTimeout(timer);button.disabled=false;}
 });
}
