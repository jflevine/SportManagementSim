'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const M=require('../experience.js');

test('every character portrait exists locally and the studio SVG has no active or external content',()=>{
  const hashes=new Set();
  for(const [id,c] of Object.entries(M.cast)){
    assert.match(c.avatar,/^assets\/avatars\/[a-z]+\.(webp|svg)$/);
    const bytes=fs.readFileSync(path.join(__dirname,'..',c.avatar));
    assert.ok(bytes.length>100&&bytes.length<100000);
    if(id==='echo'){
      const svg=bytes.toString('utf8');assert.match(svg,/<svg\s/);assert.match(svg,/viewBox="0 0 256 256"/);
      assert.doesNotMatch(svg,/<script|<foreignObject|\son\w+=|(?:href|src)\s*=/i);
    }else{
      assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
      hashes.add(createHash('sha256').update(bytes).digest('hex'));
    }
  }
  assert.equal(hashes.size,6);
});
