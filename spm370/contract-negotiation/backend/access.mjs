// Authentication hashes only. Raw credentials stay outside source and the database.
const HASH = /^[0-9a-f]{64}$/i;
const normalize = value => typeof value === 'string' && HASH.test(value) ? value.toLowerCase() : undefined;
const present = value => value !== undefined && value !== null && value !== '';
export async function loadAccess({store, instructorEnv, classEnv}) {
  const hasInstructorEnv = present(instructorEnv), hasClassEnv = present(classEnv);
  let fallback = null;
  if (!hasInstructorEnv || !hasClassEnv) {
    try { fallback = await store.access(); } catch { /* Fail closed; no credentials or database details are logged. */ }
  }
  return {
    instructorHash: normalize(hasInstructorEnv ? instructorEnv : fallback?.instructor_key_hash),
    classHash: normalize(hasClassEnv ? classEnv : fallback?.class_code_hash)
  };
}
