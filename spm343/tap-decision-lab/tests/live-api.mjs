import assert from 'node:assert/strict';
const endpoint='https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm343-tap-lab2';
async function request(body,query=''){
 const response=await fetch(endpoint+query,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});
 return {status:response.status,data:await response.json()};
}
const health=await request();assert.equal(health.status,200);assert.equal(health.data.liveEnabled,false);
const auth=await request({action:'instructorList'});assert.equal(auth.status,401);
const disabled=await request({action:'submit',mode:'live'});assert.equal(disabled.status,403);assert.equal(disabled.data.error.code,'LIVE_DISABLED');
const rejected=await request({action:'pilotProgress',format:'guided',stage:'draft',responses:['SYNTHETIC INVALID FIELD']});assert.equal(rejected.status,400);
for(const [format,stage] of [['tournament','draft'],['guided','plan_locked'],['guided','submitted']]){
 const input={action:'pilotProgress',format,stage};const saved=await request(input);assert.equal(saved.status,200);assert.equal(saved.data.demo.format,format);assert.equal(saved.data.demo.stage,stage);
 const replay=await request(input);assert.deepEqual(replay.data,saved.data,'Identical public synthetic update must be idempotent');
 const guest=await request(null,'?view=guest');assert.equal(guest.status,200);assert.equal(guest.data.demo.format,format);assert.equal(guest.data.demo.stage,stage);
 const text=JSON.stringify(guest.data);for(const forbidden of ['email','firstName','lastName','receipt','scores','review','responses','attemptId','studentId','instructorKey'])assert(!text.includes(`"${forbidden}"`),`${forbidden} leaked`);
}
console.log('PASS: live status, private access denial, real-submission closure, strict public payload rejection, synthetic save/retry/guest loop, guest response whitelist');
console.log('Only one shared synthetic demo record was updated. No real student submissions or instructor key were used.');
