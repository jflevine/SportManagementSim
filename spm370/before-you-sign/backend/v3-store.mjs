const TABLE='spm370_llc3_v3_attempts';
export function databaseStore(db){
 const unwrap=({data,error})=>{if(error)throw error;return data;};
 return {
  settings:async()=>unwrap(await db.from('spm370_llc3_v3_settings').select('*').eq('id',true).single()),
  setOpen:async value=>unwrap(await db.from('spm370_llc3_v3_settings').update({is_open:value}).eq('id',true).select('is_open').single()),
  limit:async(bucket,max)=>unwrap(await db.rpc('spm370_bys_limit',{p_bucket:bucket,p_max:max})),
  byToken:async hash=>unwrap(await db.from(TABLE).select('*').eq('token_hash',hash).maybeSingle()),
  byEmail:async email=>unwrap(await db.from(TABLE).select('id').eq('email',email).maybeSingle()),
  byId:async id=>unwrap(await db.from(TABLE).select('*').eq('id',id).maybeSingle()),
  insert:async row=>unwrap(await db.from(TABLE).insert(row).select('*').single()),
  update:async(id,revision,patch)=>unwrap(await db.from(TABLE).update({...patch,revision:revision+1}).eq('id',id).eq('revision',revision).select('*').maybeSingle()),
  list:async()=>{const rows=[];for(let start=0;;start+=500){const batch=unwrap(await db.from(TABLE).select('id,full_name,email,created_at,revision,stage_answers,notes,final_decision,final_brief,submitted_at,receipt,mc_score,note_scores,brief_score,grader_notes,reviewed_at').order('full_name',{ascending:true}).order('id',{ascending:true}).range(start,start+499));rows.push(...batch);if(batch.length<500)return rows;}}
 };
}
