const ATTEMPTS='spm370_labor_v3_attempts';
const SETTINGS='spm370_labor_v3_settings';
export function databaseStore(db) {
  const unwrap=({data,error})=>{if(error)throw error;return data;};
  return {
    settings:async()=>unwrap(await db.from(SETTINGS).select('*').eq('id',true).single()),
    setOpen:async value=>unwrap(await db.from(SETTINGS).update({is_open:value}).eq('id',true).select('is_open').single()),
    limit:async(bucket,max)=>unwrap(await db.rpc('spm370_labor_v3_limit',{p_bucket:bucket,p_max:max})),
    byToken:async value=>unwrap(await db.from(ATTEMPTS).select('*').eq('token_hash',value).maybeSingle()),
    byEmail:async(email,version)=>unwrap(await db.from(ATTEMPTS).select('id').eq('email',email).eq('assessment_version',version).maybeSingle()),
    byId:async id=>unwrap(await db.from(ATTEMPTS).select('*').eq('id',id).maybeSingle()),
    insert:async row=>unwrap(await db.from(ATTEMPTS).insert(row).select('*').single()),
    change:async(id,revision,action,patch)=>unwrap(await db.rpc('spm370_labor_v3_change',{p_id:id,p_revision:revision,p_action:action,p_patch:patch})),
    list:async()=>{const rows=[];for(let start=0;;start+=500){const batch=unwrap(await db.from(ATTEMPTS).select('id,full_name,email,assessment_version,role,assessment_snapshot,created_at,revision,answers,explanation,gameplay,submitted_at,receipt,mc_score,writing_score,grader_notes,reviewer_type,reviewed_at').order('full_name').order('id').range(start,start+499));rows.push(...batch);if(batch.length<500)return rows;}}
  };
}
