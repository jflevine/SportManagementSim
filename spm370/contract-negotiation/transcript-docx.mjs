import {proposalText} from './display.mjs';

const encoder=new TextEncoder();
const XML='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const W='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const modeLabel=mode=>({graded:'Midterm',pilot:'Instructor test',practice:'Practice'}[mode]||String(mode||''));
// XML 1.0 permits tabs/newlines but not low controls or isolated surrogates.
function clean(value){return Array.from(String(value??'')).filter(c=>{const n=c.codePointAt(0);return n===9||n===10||n===13||(n>=32&&n<=0xd7ff)||(n>=0xe000&&n<=0xfffd)||(n>=0x10000&&n<=0x10ffff);}).join('');}
function escape(value){return clean(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));}
function runs(value){return clean(value).split(/(\r\n|\r|\n|\t)/).map(part=>/^\r\n$|^[\r\n]$/.test(part)?'<w:r><w:br/></w:r>':part==='\t'?'<w:r><w:tab/></w:r>':`<w:r><w:t xml:space="preserve">${escape(part)}</w:t></w:r>`).join('');}
function paragraph(value,style='Normal'){return `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr>${runs(value)}</w:p>`;}

const crcTable=Uint32Array.from({length:256},(_,value)=>{let n=value;for(let i=0;i<8;i++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(data){let n=0xffffffff;for(const byte of data)n=crcTable[(n^byte)&255]^(n>>>8);return (n^0xffffffff)>>>0;}
function join(parts){const output=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let at=0;for(const part of parts){output.set(part,at);at+=part.length;}return output;}
// A standard ZIP archive with stored entries: no CDN, compression library, or
// browser-specific filesystem API is needed to create a genuine OOXML file.
function zip(files){
 const local=[],central=[];let offset=0;
 for(const [path,content] of files){
  const name=encoder.encode(path),data=encoder.encode(content),crc=crc32(data);
  const header=new Uint8Array(30),h=new DataView(header.buffer);
  h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,0,true);h.setUint16(12,0x0021,true);
  h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,name.length,true);
  local.push(header,name,data);
  const directory=new Uint8Array(46),d=new DataView(directory.buffer);
  d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x0800,true);d.setUint16(10,0,true);d.setUint16(14,0x0021,true);
  d.setUint32(16,crc,true);d.setUint32(20,data.length,true);d.setUint32(24,data.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);
  central.push(directory,name);offset+=header.length+name.length+data.length;
 }
 const directory=join(central),end=new Uint8Array(22),e=new DataView(end.buffer);
 e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,directory.length,true);e.setUint32(16,offset,true);
 return join([...local,directory,end]);
}

export function transcriptFilename(session,extension='docx'){
 const last=String(session?.name||'').trim().split(/\s+/).at(-1)||'Student';
 const name=last.normalize('NFKC').replace(/[^\p{L}\p{N}_-]/gu,'').slice(0,80)||'Student';
 const ext=String(extension).toLowerCase().replace(/[^a-z0-9]/g,'')||'docx';
 return `${name}_Transcript.${ext}`;
}

export function transcriptDocx(session){
 if(!session||!Array.isArray(session.events))throw Error('A saved conversation record is required.');
 const finished=!!session.submitted_at&&!!session.receipt;
 const body=[paragraph('SPM 370 — Contract Negotiation Transcript','Title'),paragraph(finished?'Finished conversation':'UNFINISHED CONVERSATION — not yet finished and saved','Heading')];
 const metadata=[['Name',session.name],['Email',session.email],['Mode',modeLabel(session.mode)],['Case',session.case_id],['Session',session.id],['Receipt',session.receipt||'Not yet issued'],['Submitted',session.submitted_at||'Not yet submitted'],['Student-recorded outcome',session.outcome||'Not recorded']];
 for(const [label,value]of metadata)body.push(paragraph(`${label}: ${value??''}`,'Metadata'));
 body.push(paragraph('Numbered conversation','Heading'));
 for(const event of session.events){
  const actor={student:'You',counterpart:'Avery Chen',system:'Session record'}[event.actor]||String(event.actor||'Record');
  body.push(paragraph(`${event.seq}. ${actor} | ${event.created_at??''}`,'Heading'),paragraph(event.text));
  // Only the displayed deal terms are exported. Never serialize arbitrary
  // payloads, provider diagnostics, private policies, or resume credentials.
  if(event.payload?.proposal)body.push(paragraph('Counterparty proposal','Heading'),paragraph(proposalText(event.payload.proposal)));
  if(event.payload?.accepted_proposal)body.push(paragraph('Recorded acceptance','Heading'),paragraph(proposalText(event.payload.accepted_proposal)));
 }
 body.push(paragraph('Next step','Heading'),paragraph(session.mode==='pilot'?'Instructor test: inspect this transcript and the saved outcome. This test is ungraded; no Canvas submission is required.':session.mode==='practice'?'Finish the short record on your assigned practice form. This rehearsal is ungraded.':'Complete the separate Word term sheet (file 03), then upload it and this transcript to Canvas. Saving here is not a Canvas submission. Keep this record for your Contract Recommendation Memo.'));
 const document=XML+`<w:document xmlns:w="${W}"><w:body>${body.join('')}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body></w:document>`;
 const styles=XML+`<w:styles xmlns:w="${W}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="en-US"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:after="160"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading"><w:name w:val="Transcript heading"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="140" w:after="60"/></w:pPr><w:rPr><w:b/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Metadata"><w:name w:val="Transcript metadata"/><w:basedOn w:val="Normal"/><w:next w:val="Metadata"/><w:pPr><w:keepNext/><w:spacing w:after="20"/></w:pPr></w:style></w:styles>`;
 const rel='http://schemas.openxmlformats.org/package/2006/relationships',office='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
 return zip([
  ['[Content_Types].xml',XML+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'],
  ['_rels/.rels',XML+`<Relationships xmlns="${rel}"><Relationship Id="rId1" Type="${office}/officeDocument" Target="word/document.xml"/></Relationships>`],
  ['word/document.xml',document],['word/styles.xml',styles],
  ['word/_rels/document.xml.rels',XML+`<Relationships xmlns="${rel}"><Relationship Id="rId1" Type="${office}/styles" Target="styles.xml"/></Relationships>`]
 ]);
}
