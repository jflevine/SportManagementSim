const TABLE='spm370_bys_attempts';
export function databaseStore(db){
 const unwrap=({data,error})=>{if(error)throw error;return data;};
 return {
  settings:async()=>unwrap(await db.from('spm370_bys_settings').select('*').eq('id',true).single()),
  setOpen:async value=>unwrap(await db.from('spm370_bys_settings').update({is_open:value}).eq('id',true).select('is_open').single()),
  limit:async(bucket,max)=>unwrap(await db.rpc('spm370_bys_limit',{p_bucket:bucket,p_max:max})),
  byToken:async hash=>unwrap(await db.from(TABLE).select('*').eq('token_hash',hash).maybeSingle()),
  byEmail:async email=>unwrap(await db.from(TABLE).select('id,token_hash').eq('email',email).maybeSingle()),
  byId:async id=>unwrap(await db.from(TABLE).select('*').eq('id',id).maybeSingle()),
  insert:async row=>unwrap(await db.from(TABLE).insert(row).select('*').single()),
  update:async(id,revision,patch)=>unwrap(await db.from(TABLE).update({...patch,revision:revision+1}).eq('id',id).eq('revision',revision).select('*').maybeSingle()),
  list:async()=>unwrap(await db.from(TABLE).select('id,full_name,email,created_at,revision,activity,activity_submitted_at,activity_receipt,quiz_answers,quiz_submitted_at,quiz_receipt,mc_score,activity_score,essay_scores,grader_notes,reviewed_at').order('created_at',{ascending:false}).limit(200))
 };
}
