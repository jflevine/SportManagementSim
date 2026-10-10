// MGT 340 field audit site-selection checkpoint. Private Supabase service-role writes only.
const PROJECT_URL = Deno.env.get('SUPABASE_URL') || '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const ALLOWED_ORIGIN = 'https://jflevine.github.io';
const VERSION = 'mgt340-field-audit-site-v1';
const TABLE = 'mgt340_field_audit_sites';
const DEADLINE_UTC = Date.parse('2026-10-19T03:59:59.999Z'); // Oct 18, 11:59:59 p.m. Philadelphia (EDT).
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[a-z0-9.!#$%&'*+\/= ?^_`{|}~-]+@lasalle\.edu$/; // See stricter conditions below.
const CATEGORIES = new Set(['lasalle-varsity','campus-operation','college-school','youth-community','professional-amateur','tournament-race','facility-recreation','live-esports','other']);
const INPUT_KEYS = new Set(['attemptId','formVersion','firstName','lastName','email','requestKind','siteCategory','siteName','eventDate','eventTime','venueLocation','observationFocus']);
class InputError extends Error { constructor(message) { super(message); this.status = 400; } }
function cleanString(value, min, max, label) {
  if (typeof value !== 'string' || value.length > max * 2 || /[\u0000-\u001f\u007f]/u.test(value)) throw new InputError('Check ' + label + '.');
  const result = value.trim().replace(/\s+/gu,' ').normalize('NFC');
  if (result.length < min || result.length > max) throw new InputError('Check ' + label + '.');
  return result;
}
function parseDate(value) {
  if (typeof value !== 'string' || !/^2026-\d\d-\d\d$/.test(value)) throw new InputError('Choose a valid event date.');
  const actual = new Date(value+'T00:00:00Z');
  if (!Number.isFinite(actual.valueOf()) || actual.toISOString().slice(0,10) !== value || value < '2026-09-01' || value > '2026-11-08') throw new InputError('Your event must be between September 1 and November 8, 2026. Contact your instructor about exceptions.');
  return value;
}
function normalize(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(k=>!INPUT_KEYS.has(k))) throw new InputError('Please review your submission.');
  if (input.formVersion !== VERSION || typeof input.attemptId !== 'string' || !UUID.test(input.attemptId)) throw new InputError('Reload the form and try again.');
  const first_name = cleanString(input.firstName,1,80,'your first name');
  const last_name = cleanString(input.lastName,1,80,'your last name');
  if (!/\p{L}/u.test(first_name) || !/\p{L}/u.test(last_name)) throw new InputError('Enter your first and last name.');
  const email = cleanString(input.email,8,120,'your La Salle email').toLowerCase();
  if (!EMAIL.test(email) || email.includes(' ') || email.includes('..') || email.startsWith('.') || email.split('@')[0].endsWith('.') || email.split('@')[0].length > 64) throw new InputError('Use your official @lasalle.edu email address.');
  if (!['site','assistance'].includes(input.requestKind)) throw new InputError('Choose site confirmation or request assistance.');
  const base = {attempt_id:input.attemptId.toLowerCase(),receipt_id:crypto.randomUUID(),form_version:VERSION,first_name,last_name,email,request_kind:input.requestKind};
  if (input.requestKind === 'assistance') {
    if (['siteCategory','siteName','eventDate','eventTime','venueLocation','observationFocus'].some(k=>input[k] !== null && input[k] !== '' && input[k] !== undefined)) throw new InputError('Please clear the site fields when requesting assistance.');
    return {...base,site_category:null,site_name:null,event_date:null,event_time:null,venue_location:null,observation_focus:null,approval_status:'assistance_requested'};
  }
  if (!CATEGORIES.has(input.siteCategory)) throw new InputError('Select the type of sport setting.');
  const site_name = cleanString(input.siteName,2,150,'the event or operation name');
  const event_date = parseDate(input.eventDate);
  const event_time = input.eventTime === '' || input.eventTime === null || input.eventTime === undefined ? null : String(input.eventTime);
  if (event_time !== null && !/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(event_time)) throw new InputError('Check the event time.');
  const venue_location = cleanString(input.venueLocation,2,180,'the venue and location');
  const observation_focus = cleanString(input.observationFocus,8,400,'what you expect to observe');
  return {...base,site_category:input.siteCategory,site_name,event_date,event_time,venue_location,observation_focus,approval_status:input.siteCategory === 'lasalle-varsity' ? 'approved' : 'pending_review'};
}
function identical(saved, candidate) {
  return ['attempt_id','form_version','first_name','last_name','email','request_kind','site_category','site_name','event_date','event_time','venue_location','observation_focus'].every(key=>saved[key] === candidate[key]);
}
function receipt(row) {
  return {ok:true,receiptId:row.receipt_id,attemptId:row.attempt_id,submittedAt:row.submitted_at,late:Date.parse(row.submitted_at)>DEADLINE_UTC,approvalStatus:row.approval_status,requestKind:row.request_kind,siteName:row.site_name,eventDate:row.event_date};
}
const rest = PROJECT_URL ? new URL('/rest/v1/'+TABLE,PROJECT_URL) : null;
const dbHeaders = {apikey:SERVICE_KEY,Authorization:'Bearer '+SERVICE_KEY,'Content-Type':'application/json'};
const headersFor = origin => ({
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store',
  'Vary':'Origin',
  'X-Content-Type-Options':'nosniff',
  ...(origin === ALLOWED_ORIGIN ? {'Access-Control-Allow-Origin':ALLOWED_ORIGIN,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'authorization, apikey, content-type'} : {})
});
function respond(status,body,headers) {return new Response(body===null?null:JSON.stringify(body),{status,headers});}
Deno.serve(async req => {
  const origin = req.headers.get('origin');
  const headers = headersFor(origin);
  const error = (status,code,message)=>respond(status,{ok:false,error:{code,message}},headers);
  if (origin !== ALLOWED_ORIGIN) return error(403,'ORIGIN','This page is not an authorized submission source.');
  if (req.method === 'OPTIONS') return respond(204,null,headers);
  if (req.method !== 'POST') return error(405,'METHOD','POST required.');
  if (!rest || !SERVICE_KEY || PROJECT_URL !== 'https://havsvkhddvdbzbsmhqbr.supabase.co') return error(503,'CONFIG','Submissions are currently unavailable.');
  if (!/^application\/json(?:\s*;.*)?$/i.test(req.headers.get('content-type')||'')) return error(415,'FORMAT','JSON submission required.');
  if (req.headers.has('content-encoding')) return error(415,'FORMAT','Compressed requests are not supported.');
  try {
    const limit = 8192;
    const claimed = Number(req.headers.get('content-length')||'0');
    if (!Number.isFinite(claimed) || claimed>limit) return error(413,'SIZE','Submission is too large.');
    const reader = req.body?.getReader();
    if (!reader) return error(400,'BODY','Enter your site details.');
    let total=0;const chunks=[];
    try {while (true) {const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>limit)return error(413,'SIZE','Submission is too large.');chunks.push(value);}}
    finally {reader.releaseLock();}
    const bytes = new Uint8Array(total);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.byteLength;}
    let raw;try {raw=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch {throw new InputError('The submission could not be read. Reload and try again.');}
    const row=normalize(raw);
    const deadline = AbortSignal.timeout(8500);
    const saved=await fetch(rest,{method:'POST',headers:{...dbHeaders,Prefer:'return=representation'},body:JSON.stringify(row),signal:deadline,redirect:'error'});
    if(saved.status===201) {const added=await saved.json();if(!Array.isArray(added)||added.length!==1)throw Error('No receipt record');return respond(200,receipt(added[0]),headers);}
    if(saved.status===409) {
      // A retry of exactly the same randomized attempt may safely recover its receipt.
      const url=new URL(rest);url.searchParams.set('attempt_id','eq.'+row.attempt_id);url.searchParams.set('select','*');url.searchParams.set('limit','1');
      const result=await fetch(url,{headers:dbHeaders,signal:deadline,redirect:'error'});
      if(!result.ok) throw Error('Retry lookup failed');
      const rows=await result.json();
      if(Array.isArray(rows)&&rows.length===1&&identical(rows[0],row)) return respond(200,receipt(rows[0]),headers);
      return error(409,'ALREADY_SUBMITTED','A site confirmation already exists for this email, or this attempt has changed. Contact Professor Levine to make a correction.');
    }
    throw Error('Backend failed');
  } catch(e) {
    if(e instanceof InputError) return error(400,'VALIDATION',e.message);
    return error(503,'SAVE_UNCONFIRMED','We could not confirm that this submission was saved. Keep the page open and retry, or contact Professor Levine.');
  }
});