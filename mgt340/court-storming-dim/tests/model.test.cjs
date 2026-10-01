const assert=require('node:assert/strict');
const test=require('node:test');
const M=require('../model.js');
const prepared={risk:'team',measures:['lane','brief'],positions:{stewards:'access',liaison:'bench',supervisor:'route'},trigger:'gathering',comms:'confirm'};
test('coverage concentration leaves an observable gap, recovery retains evidence',()=>{
 const gap=M.simulate(prepared,['concentrate']);assert.equal(gap.current.access,'Uncovered');
 const recovered=M.simulate(prepared,['concentrate','rebalance','verify']);
 assert.equal(recovered.current.departed,true);assert.equal(recovered.current.positions.stewards,'access');
 assert.ok(recovered.current.warnings.some(x=>x.includes('All three units')));assert.equal(recovered.current.confirmed,true);
});
test('prepared readiness permits departure; radio instruction alone does not',()=>{
 assert.equal(M.simulate(prepared,['hold','send']).current.departed,true);
 const unconfirmed={...prepared,comms:'broadcast'};
 assert.equal(M.simulate(unconfirmed,['hold','send']).current.departed,false);
});
test('backup choice depends on verification selected during planning',()=>{
 assert.equal(M.simulate(prepared,['reinforce','announce','alternate']).current.departed,false);
 const backup={...prepared,measures:['lane','backup']};
 const s=M.simulate(backup,['reinforce','announce','alternate']).current;
 assert.equal(s.departed,true);assert.equal(s.alternate,true);assert.equal(s.positions.stewards,'access');
});
test('an early release can coexist with team departure and still leave a coverage gap',()=>{
 const s=M.simulate(prepared,['hold','send','release']).current;
 assert.equal(s.departed,true);assert.equal(s.access,'Uncovered');assert.ok(s.warnings.some(x=>x.includes('released')));
});
test('all 27 paths complete deterministically without mutating the plan',()=>{
 const before=JSON.stringify(prepared);let count=0;
 for(const a of M.ROUNDS[0].choices)for(const b of M.ROUNDS[1].choices)for(const c of M.ROUNDS[2].choices){
  const choices=[a.id,b.id,c.id],run=M.simulate(prepared,choices);
  assert.equal(run.history.length,3);assert.equal(run.complete,true);assert.deepEqual(run,M.simulate(prepared,choices));
  assert.equal(M.report(prepared,choices).length,4);assert.ok(run.history.every(h=>h.result&&h.lesson));count++;
 }
 assert.equal(count,27);assert.equal(JSON.stringify(prepared),before);
});

test('playing-space entry remains recorded after recovery, but covered access prevents entry in the model',()=>{
 const recovered=M.simulate(prepared,['concentrate','rebalance','verify']).current;
 assert.equal(recovered.departed,true);assert.equal(recovered.entryOccurred,true);
 const prevented=M.simulate(prepared,['hold','send','verify']).current;
 assert.equal(prevented.entryOccurred,false);
});
