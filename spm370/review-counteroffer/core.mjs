export const API = 'https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm370-counteroffer';
export const CASE_VERSION = 'decision-lab-3-v1';
export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'spm370-review-counteroffer-v1';
export const decisions = {proceed:'Keep the proposed price and main terms; clarify one obligation',counter:'Propose a different price or scope of work, and clarify one obligation',decline:'Decline and use staff-created promotion'};
export const clauseTitles = ['Video and publication','Fee and payment','Review and timing','Reposting and promotion','Additional support','Ownership and permissions'];
export function wordCount(value=''){return value.trim() ? value.trim().split(/\s+/u).length : 0;}
export function csvCell(value){const s=String(value??'');return '"'+(/^[\s]*[=+@-]/.test(s)?"'"+s:s).replaceAll('"','""')+'"';}
export function toCSV(rows){return '\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n');}
export function token(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');}
export function responseText(payload, receipt=null){return [
 'SPM 370 • Legal Decision Lab 3 • Review the Counteroffer',
 receipt ? `SERVER CONFIRMED • Receipt: ${receipt.receipt} • ${receipt.submitted_at}` : 'UNSUBMITTED COPY • This download is not proof of submission.',
 `Case: ${payload.case_version||CASE_VERSION}`,
 `Name: ${payload.name||''}`, `Email: ${payload.email||''}`,
 `Decision: ${decisions[payload.decision]||''}`,
 '\nRECOMMENDATION\n'+(payload.recommendation||''),
 `\nPRIORITY CLAUSE: ${payload.clause_number||''} ${clauseTitles[Number(payload.clause_number)-1]||''}`,
 '\nREPLY TO CASEY OR ORIGINAL CLAUSE REVISION\n'+(payload.clarification||'')
].join('\n');}
export function download(name,text,type='text/plain;charset=utf-8'){
 const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function request(path,{method='GET',headers={},body,timeout=25000}={}){
 const controller=new AbortController();const id=setTimeout(()=>controller.abort(),timeout);
 try{
  const r=await fetch(API+path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined,signal:controller.signal,cache:'no-store'});
  let data;try{data=await r.json();}catch{throw Object.assign(new Error('The service returned an unreadable response.'),{status:r.status});}
  if(!r.ok||data.ok===false)throw Object.assign(new Error(typeof data.error==='string'?data.error:(data.message||'The request could not be completed.')),{status:r.status,code:data.code});
  return data;
 }finally{clearTimeout(id);}
}
