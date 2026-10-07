import {transition,FIXTURES,canonical,sha256,privateProjection} from './model.mjs';
import {writeFile} from 'node:fs/promises';
const fixture=FIXTURES.guided;
const cmds=[{action:'start',fixture:'guided'},{action:'save',format:'guided',responses:[...fixture.responses.slice(0,3),'']},{action:'lockPlan'},{action:'save',format:'guided',responses:fixture.responses},{action:'submit'},{action:'instructorReview',scores:[2,3,3,2]},{action:'instructorPublish',published:true}];
let s=null;
const sqlQuote=x=>"'"+String(x).replaceAll("'","''")+"'";
const json=x=>sqlQuote(JSON.stringify(x))+'::jsonb';
const calls=[];
for(let i=0;i<cmds.length;i++){
 const cmd={...cmds[i],attemptId:fixture.attemptId,requestId:`d1b1c5f0-0009-4000-8000-00000000000${i+1}`,expectedVersion:i};
 s=transition(s,cmd,{now:'2026-10-07T13:00:00.000Z',receiptId:'e81134fd-714b-4d86-ab67-8a0966f4b206'});
 const result={ok:true,mode:'pilot',synthetic:true,submission:privateProjection(s)};
 const pub={label:fixture.label,format:fixture.format,summary:fixture.summary,published:s.guest.published};
 calls.push(`public.spm343_tap_lab2_apply(${sqlQuote(fixture.attemptId)}::uuid,${sqlQuote(cmd.requestId)}::uuid,${sqlQuote(await sha256(canonical(cmd)))},${i},${json(s)},${json(result)},${json(pub)})`);
}
let text=`-- Controlled synthetic transaction; rolled back after verification.\nbegin;\nset local role service_role;\ndo $verification$\ndeclare r jsonb; prior jsonb; snapshot jsonb;\nbegin\n`;
for(let i=0;i<calls.length;i++){
 text+=`r := ${calls[i]};\nif r->>'ok' <> 'true' or (r->'submission'->>'version')::int <> ${i+1} then raise exception 'Synthetic state transition ${i+1} failed'; end if;\n`;
 if(i===2)text+=`snapshot := r->'submission'->'initialPlan';\n`;
 if(i===4)text+=`prior := r;\nif snapshot is distinct from r->'submission'->'initialPlan' then raise exception 'Original plan was overwritten'; end if;\n`;
}
text+=`r := ${calls[4]};\nif r is distinct from prior then raise exception 'Durable receipt replay failed'; end if;\n`;
text+=`r := public.spm343_tap_lab2_guest();\nif jsonb_array_length(r->'publications') <> 1 then raise exception 'Separate synthetic publication failed'; end if;\nif r::text like '%example.invalid%' or r::text like '%responses%' or r::text like '%scores%' then raise exception 'Guest projection leaked private state'; end if;\nend;\n$verification$;\nrollback;\nselect 'Synthetic SQL transitions, snapshot preservation, replay, grade and separate guest publication passed; all fixture mutations rolled back.' as result;\n`;
await writeFile(new URL('./sql-verification.sql',import.meta.url),text);
