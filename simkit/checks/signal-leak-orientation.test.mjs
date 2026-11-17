import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const page=readFileSync(new URL('../../spm370/signal-leak/index.html',import.meta.url),'utf8');
test('remote learner orientation remains available outside hidden start/desk sections',()=>{assert.ok(page.indexOf('id="orientation"')<page.indexOf('id="start"'));assert.match(page,/<details id="orientation" open>/);for(const term of ['no live launch required','No knowledge of Circuit Break','chat overlay','prepared responses','not while you read or type','Both later updates','200–300 words','not a live course assignment','does not mean your instructor received it','equivalent route'])assert.ok(page.includes(term),term);});
