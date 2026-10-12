export function createStore({url,key,fetcher=fetch}){
 async function request(path,method='GET',body){
  const r=await fetcher(`${url}/rest/v1/${path}`,{method,headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});
  if(!r.ok){const error=await r.json().catch(()=>({}));throw Object.assign(Error(error.message||'Database request failed'),{status:r.status});}return r.status===204?null:r.json();
 }
 return {
  async policy(mode){const a=await request('spm370_contract_policies?mode=eq.'+encodeURIComponent(mode)+'&active=eq.true&select=*');return a[0]?.body||null;},
  async policyById(id){const a=await request('spm370_contract_policies?id=eq.'+encodeURIComponent(id)+'&select=body');return a[0]?.body||null;},
  async savePolicy(p){return request('spm370_contract_policies','POST',{id:p.id,mode:p.mode,active:true,body:p});},
  async session(id){const a=await request('spm370_contract_sessions?id=eq.'+encodeURIComponent(id)+'&select=*');return a[0]||null;},
  async events(id){return request('spm370_contract_events?session_id=eq.'+encodeURIComponent(id)+'&order=seq.asc&select=seq,actor,text,created_at,payload');},
  async list(){return request('spm370_contract_sessions?order=created_at.desc&select=id,name,email,mode,case_id,created_at,submitted_at,receipt,paused_at&limit=500');},
  async command(action,args){return request('rpc/spm370_contract_command','POST',{action,args});}
 };
}
