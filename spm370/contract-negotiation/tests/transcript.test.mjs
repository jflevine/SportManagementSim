import test from 'node:test';
import assert from 'node:assert/strict';
import {inflateRawSync} from 'node:zlib';
import {transcriptDocx,transcriptFilename} from '../transcript-docx.mjs';
import {proposalText,DISPLAY_FIELDS} from '../display.mjs';

function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
// Independently read both ZIP directories and verify every member's CRC and sizes.
function unzip(bytes){
 const b=Buffer.from(bytes),end=b.length-22;assert.equal(b.readUInt32LE(end),0x06054b50,'ZIP end record');
 assert.equal(b.readUInt16LE(end+20),0);const count=b.readUInt16LE(end+10),out=new Map();let p=b.readUInt32LE(end+16);
 assert.equal(p+b.readUInt32LE(end+12),end,'central directory bounds');
 for(let i=0;i<count;i++){
  assert.equal(b.readUInt32LE(p),0x02014b50);const method=b.readUInt16LE(p+10),crc=b.readUInt32LE(p+16),packed=b.readUInt32LE(p+20),size=b.readUInt32LE(p+24),n=b.readUInt16LE(p+28),extra=b.readUInt16LE(p+30),comment=b.readUInt16LE(p+32),local=b.readUInt32LE(p+42),name=b.subarray(p+46,p+46+n).toString('utf8');
  assert.equal(b.readUInt32LE(local),0x04034b50);assert.equal(b.readUInt16LE(local+8),method);const ln=b.readUInt16LE(local+26),le=b.readUInt16LE(local+28);assert.equal(b.subarray(local+30,local+30+ln).toString('utf8'),name);const data=b.subarray(local+30+ln+le,local+30+ln+le+packed);assert([0,8].includes(method));const decoded=method===0?data:inflateRawSync(data);
  assert.equal(decoded.length,size,name+' uncompressed length');assert.equal(crc32(decoded),crc,name+' CRC');assert(!out.has(name),'unique ZIP members');out.set(name,decoded.toString('utf8'));p+=46+n+extra+comment;
 }
 assert.equal(p,end);return out;
}
const decode=s=>s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&');
const textOf=xml=>[...xml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(x=>decode(x[1])).join('\n');
const terms=()=>Object.fromEntries(DISPLAY_FIELDS.map((k,i)=>[k,k==='exclusive_category'?'keyboard':k==='convenience'?'removed':/^(fee|advance_percent|payment_days|segments|segment_minutes|videos|video_min_seconds|video_max_seconds|revision_rounds|review_business_days|exclusive_post_days|reuse_days|cure_days|cancel_unearned_percent|segment_fee_share_percent)$/.test(k)?i+1:i%2===0]));
function fixture(){return {id:'synthetic-session-77',name:'Zoë O’Neil & <Co>',email:'fixture@example.invalid',mode:'graded',case_id:'synthetic-case-v7',receipt:'RECEIPT-TEST-88',submitted_at:'2030-05-06T07:08:09Z',outcome:'Partial agreement',phase:'submitted',token_hash:'PRIVATE_TOPLEVEL_CANARY',role:'PRIVATE_ROLE_CANARY',events:[
 {seq:1,actor:'counterpart',created_at:'2030-05-06T06:10:11Z',text:'Opening <offer> & “terms” 🙂',payload:{proposal:terms(),counterparty_accepts:true,discrepancies:['PRIVATE_DIAGNOSTIC_CANARY'],usage:{secret:'PRIVATE_USAGE_CANARY'}}},
 {seq:2,actor:'student',created_at:'2030-05-06T06:12:13Z',text:'First line\nSecond line\r\nThird line: naïve café — yes.',payload:{accepted_proposal:{...terms(),fee:919},request_id:'PRIVATE_REQUEST_CANARY'}},
 {seq:3,actor:'system',created_at:'2030-05-06T06:14:15Z',text:'Record saved; this is not a grade.',payload:{validation_alert:'PRIVATE_VALIDATION_CANARY'}}
 ]};}

test('Word transcript is a complete ZIP with valid CRCs and required OOXML parts',()=>{
 const bytes=transcriptDocx(fixture());assert(bytes instanceof Uint8Array);const files=unzip(bytes);
 for(const name of ['[Content_Types].xml','_rels/.rels','word/document.xml'])assert(files.has(name),name);
 assert.match(files.get('[Content_Types].xml'),/wordprocessingml\.document\.main\+xml/);assert.match(files.get('_rels/.rels'),/word\/document\.xml/);assert.match(files.get('word/document.xml'),/<w:document\b/);
 assert.match([...files.values()].join('\n'),/Times New Roman/);
});

test('Word transcript escapes XML while preserving Unicode and multiline message text',()=>{
 const xml=unzip(transcriptDocx(fixture())).get('word/document.xml'),text=textOf(xml);
 assert(xml.includes('&lt;offer&gt;'));assert(xml.includes('&amp;'));assert(!xml.includes('<offer>'));assert(text.includes('Opening <offer> & “terms” 🙂'));
 for(const phrase of ['Zoë O’Neil & <Co>','First line','Second line','Third line: naïve café — yes.'])assert(text.includes(phrase),phrase);
 assert.match(xml,/First line<\/w:t><\/w:r><w:r><w:br\/><\/w:r><w:r><w:t[^>]*>Second line<\/w:t><\/w:r><w:r><w:br\/><\/w:r><w:r><w:t[^>]*>Third line:/,'both LF and CRLF remain visible Word line breaks');
 assert(!xml.includes('\r'),'CRLF is normalized');assert(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(xml),'no invalid XML controls');
});

test('Word transcript retains session metadata, every chronological event, and both proposal records',()=>{
 const s=fixture(),text=textOf(unzip(transcriptDocx(s)).get('word/document.xml'));
 for(const value of [s.id,s.name,s.email,s.case_id,s.receipt,s.submitted_at,s.outcome])assert(text.includes(value),'metadata '+value);
 let previous=-1;for(const e of s.events){const start=text.indexOf(e.text.split(/\r?\n/)[0]);assert(start>previous,'event order');previous=start;assert(text.includes(e.created_at),'event timestamp');assert(new RegExp('(?:^|\\n|\\s)'+e.seq+'[. ·:)—-]').test(text),'event sequence '+e.seq);}
 for(const proposal of [s.events[0].payload.proposal,s.events[1].payload.accepted_proposal])for(const line of proposalText(proposal).split('\n').filter(Boolean))assert(text.includes(line),'proposal field '+line);
});

test('Word exporter includes only public record fields, never auxiliary or credential payloads',()=>{
 const all=[...unzip(transcriptDocx(fixture())).values()].join('\n');assert.doesNotMatch(all,/PRIVATE_[A-Z_]+_CANARY/);
 assert.doesNotMatch(all,/token_hash|validation_alert|discrepancies|counterparty_rules/);
});

test('transcript filenames are safe for downloads, including empty and non-ASCII names',()=>{
 for(const name of ['../../bad\\name:<x>?*|','東京','😀','', 'a'.repeat(400)])for(const extension of ['docx','txt']){
  const filename=transcriptFilename({...fixture(),name},extension);assert.equal(typeof filename,'string');assert(filename.endsWith('.'+extension));assert(!/[\\/:<>"|?*\x00-\x1f]/.test(filename));assert(!filename.includes('..'));assert(filename.length<240);assert(filename.slice(0,-extension.length-1).length>0);
 }
});
