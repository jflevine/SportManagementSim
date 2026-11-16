// Where this simulation's server lives. Leave `endpoint` empty to run the offline preview
// (the whole simulation in the browser, prepared voices, nothing sent anywhere).
// Add ?local=1 to any page URL to force the offline preview.
const q = new URLSearchParams(location.search);
export const endpoint = q.has('local') ? '' : q.has('dev') ? '/simkit-api' :
  'https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/simkit';
