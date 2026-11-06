import {scoreAnswers} from '../validation.mjs';
export const TEST_KEY='synthetic-instructor-only';
export const assessment={version:'synthetic-1',title:'Synthetic assessment, not course content',explanationPrompt:'Explain a synthetic choice.',explanationMinWords:3,maxExplanationChars:200,writingMax:2,rubric:{principle:'Semantic review only.'},questions:Array.from({length:8},(_,i)=>({id:`test-${i+1}`,prompt:`Synthetic item ${i+1}`,points:1,answer:i%2?'b':'a',why:'Synthetic feedback.',options:[{id:'a',text:'Test option A'},{id:'b',text:'Test option B'}]}))};
const copy=v=>structuredClone(v);
export function memoryStore() {
  let settings={is_open:true,assessment:copy(assessment)};const rows=new Map(),reviews=[],rateHits=new Map();let fail=false,limited=false;
  return {
    rows,reviews,rateHits,setFailure:v=>{fail=v;},setLimited:v=>{limited=v;},
    settings:async()=>{if(fail)throw Error('private storage diagnostic must never leak');return copy(settings);},
    setAssessment:a=>{settings.assessment=copy(a);},setOpen:async v=>{settings.is_open=v;},
    limit:async(bucket,max)=>{if(fail)throw Error('storage failed');const hits=(rateHits.get(bucket)||0)+1;rateHits.set(bucket,hits);return !limited&&hits<=max;},
    byToken:async h=>copy([...rows.values()].find(r=>r.token_hash===h)||null),
    byEmail:async(e,v)=>copy([...rows.values()].find(r=>r.email===e&&r.assessment_version===v)||null),
    byId:async id=>copy(rows.get(id)||null),
    list:async()=>copy([...rows.values()]),
    insert:async input=>{if([...rows.values()].some(r=>r.token_hash===input.token_hash||(r.email===input.email&&r.assessment_version===input.assessment_version))){const e=Error('unique');e.code='23505';throw e;}const r={id:crypto.randomUUID(),created_at:new Date().toISOString(),revision:0,explanation:'',gameplay:{},submitted_at:null,receipt:null,submission_fingerprint:null,mc_score:null,writing_score:null,grader_notes:'',reviewer_type:null,reviewed_at:null,...copy(input)};rows.set(r.id,r);return copy(r);},
    change:async(id,revision,action,patch)=>{
      if(fail)throw Error('storage failed');const r=rows.get(id);if(!r)return null;
      if(r.submitted_at&&['saveDraft','submit'].includes(action))return copy(r);
      if(r.revision!==revision)return null;
      if(['saveDraft','submit'].includes(action)&&!settings.is_open)throw Error('closed');
      if(action==='submit')Object.assign(r,copy(patch),{submitted_at:new Date().toISOString(),mc_score:scoreAnswers(patch.answers,r.assessment_snapshot)});
      else if(action==='grade'){if(!r.submitted_at)throw Error('not submitted');Object.assign(r,copy(patch),{reviewed_at:new Date().toISOString()});reviews.push({...copy(patch),attempt_id:id,revision:revision+1});}
      else Object.assign(r,copy(patch));r.revision++;return copy(r);
    }
  };
}
