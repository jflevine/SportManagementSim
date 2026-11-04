// A durable tab retry copy is a precondition to every network attempt.
export async function sendFrozen(payload,{config,signal,ensureRetrySaved,fetchImpl=fetch}) {
  let saved=false;
  try { saved=ensureRetrySaved()===true; } catch { saved=false; }
  if(!saved){const error=new Error('The frozen retry copy could not be saved.');error.code='RETRY_STORAGE_BLOCKED';throw error;}
  const response=await fetchImpl(config.submissionEndpoint,{method:'POST',headers:{'Content-Type':'application/json',apikey:config.publicApiKey,Authorization:`Bearer ${config.publicApiKey}`},body:JSON.stringify(payload),signal,credentials:'omit',cache:'no-store',redirect:'error'});
  return {response,data:await response.json()};
}
