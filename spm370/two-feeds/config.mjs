// Where this simulation's server lives.
//   ?dev    -> the local dev server (node simkit/dev-server.mjs)
//   ?live   -> the deployed simkit Edge Function. Use this ONLY after the function has been
//              re-pinned to a commit that contains this simulation (simkit/supabase/README.md).
//              Until then the live function answers "Unknown simulation".
//   default -> offline: the whole simulation runs in this browser with prepared voices.
// When Jeff releases this activity, change the default below to the live endpoint.
const q = new URLSearchParams(location.search);
export const endpoint = q.has('dev') ? '/simkit-api' : q.has('live') ? 'https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/simkit' : '';
