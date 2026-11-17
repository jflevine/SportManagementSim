// Fictional classroom case. Exact policies come from Jeff's revised November 17 worksheets.
const flag = (s,k) => s.flags[k]?.value;
const text = (v,n=1200) => String(v??'').trim().slice(0,n);
const required = (p,keys) => { for (const k of keys) if (!text(p[k])) { const e=new Error(`Complete ${k} before continuing.`); e.public=true;e.status=400;throw e; } };
const choice = p => { if (!['A','B','C'].includes(p.choice)) {const e=new Error('Choose A, B or C.');e.public=true;e.status=400;throw e;} };
const clean = (p,keys) => Object.fromEntries(keys.map(k=>[k,text(p[k])]));
export const OPTIONS={A:'Youth groups: 7 p.m., $12 seats through youth teams',B:'Earlier tipoff: 4 p.m., $20 seats',C:'Player photo: 7 p.m., $20 seat with a postgame player photo'};
export const POLICIES=[
'1 · Club ticket policy: The ticket director may approve group rates and reserve blocks. Two adjacent sections are on hold until noon. Youth coaches will take 180 seats at $12 if the group can sit together.',
'2 · League schedule policy: A new tipoff time requires approval from the league and its broadcast partner. Neither can confirm a change before noon.',
'3 · Club appearance policy: The player representative must secure each participating player’s agreement. Two players could participate and together accommodate at most 60 photos; neither player has agreed yet. Basketball operations can staff one line.'
];
export const FIELDS=['choice','offer','evidence','approver','delivery','fallback','returnMeasure'];
const labels={choice:'Revised choice',offer:'Exact offer',evidence:'Policy evidence',approver:'Required approval',delivery:'Delivery checks',fallback:'Fallback at noon',returnMeasure:'Repeat-attendance measure'};
const draft=s=>flag(s,'draft');
const sampleMemo=(choice,offer)=>({choice,offer,evidence:choice==='A'?'Policy 1':'Policy 3',approver:choice==='A'?'Ticket director approves rate and block':'Player representative obtains both players’ agreement',delivery:choice==='A'?'Ticketing confirms contiguous seats and coach booking':'Basketball operations confirms one staffed line and photo allocation',fallback:'Remove the unconfirmed promise; postpone if no authorized alternative exists.',returnMeasure:'Use a group-specific code to track a second purchase.',peer:'A neighboring pod asked whether the advertised promise was already approved.',changed:'Clarified that the offer remains conditional.'});
const samples=[
{team:'Maple (fictional)',steps:[{type:'act',act:'initial',params:{choice:'B',assumption:'Families prefer an earlier game.',approval:'League and broadcaster'}},{type:'act',act:'reveal',params:{}},{type:'open',doc:'policies'},{type:'act',act:'draft',params:sampleMemo('A','Offer 180 $12 seats together only after approval and confirmation.')} ,{type:'submit',memo:sampleMemo('A','Offer 180 $12 seats together only after approval and confirmation.')} ]},
{team:'Cedar (fictional)',steps:[{type:'act',act:'initial',params:{choice:'C',assumption:'Players will agree to photos.',approval:'Player representative'}},{type:'act',act:'reveal',params:{}},{type:'open',doc:'policies'},{type:'act',act:'draft',params:sampleMemo('C','A limited photo offer, subject to both players agreeing and a clearly stated allocation.')} ,{type:'submit',memo:sampleMemo('C','A limited photo offer, subject to both players agreeing and a clearly stated allocation.')} ]},
{team:'Birch (fictional)',steps:[{type:'act',act:'initial',params:{choice:'A',assumption:'A youth-team booking will lead to repeat visits.',approval:'Ticket director'}},{type:'act',act:'reveal',params:{}},{type:'open',doc:'policies'},{type:'act',act:'draft',params:sampleMemo('A','Postpone the offer until seating and booking are confirmed.')} ,{type:'submit',memo:sampleMemo('A','Postpone the offer until seating and booking are confirmed.')} ]},
];
export default {
id:'mgt340-front-office',version:1,title:'The Front Office: Game-Day Decisions',course:'MGT 340 · Professional Sport',role:'Ticketing, game operations and basketball operations team',
clock:{start:690,end:1440,days:['Today']}, costs:{act:0,open:0,message:0},
actors:{ticket:{name:'Ticket director',role:'Approves rates and blocks',reachable:false},league:{name:'League and broadcast partner',role:'Approve schedule changes',reachable:false},players:{name:'Player representative',role:'Secures each player’s agreement',reachable:false}},
facts:{ticket:{text:POLICIES[0],initial:['ticket']},schedule:{text:POLICIES[1],initial:['league']},appearance:{text:POLICIES[2],initial:['players']}},
documents:{policies:{title:'Staff update and numbered policies',kind:'Fictional policy sheet',body:POLICIES,reveals:['ticket','schedule','appearance'],available:s=>!!flag(s,'revealed')}},
speechActs:{},detect:()=>[],rules:[],timers:{},timerWhy:{},opening:()=>[{note:'Your fictional professional basketball club has 300 unsold seats for Saturday’s 7 p.m. game. One family offer can open for sale at noon today. The owner wants first-time families to return for a second game.'}],
acts:{
initial:{label:'Lock initial decision',cost:0,fields:[],available:s=>!s.commitments.initial,clean:p=>{required(p,['choice','assumption','approval']);choice(p);return clean(p,['choice','assumption','approval']);},effect:(s,p)=>[{commit:{id:'initial',to:'ticket',label:`Initial choice ${p.choice}`,quote:p.assumption,choice:p.choice,approval:p.approval}},{note:'Initial decision recorded. Wait for your instructor before opening the staff update.'}]},
reveal:{label:'Open staff update on instructor cue',cost:0,fields:[],available:s=>!!s.commitments.initial&&!flag(s,'revealed'),clean:()=>({}),effect:()=>[{flag:{key:'revealed'}},{note:'Read all three policies. They add information, not an approved booking, player agreement or permission to advertise.'}]},
draft:{label:'Save offer for peer review',cost:0,fields:[],available:s=>!!s.docs.policies,clean:p=>{required(p,FIELDS);choice(p);return clean(p,[...FIELDS,...('peer' in p?['peer']:[]),...('changed' in p?['changed']:[])]);},effect:(s,p)=>[{flag:{key:'draft',value:p}},{note:'Draft saved. Show this offer to a neighboring pod. Ask what a parent would expect and which promise needs support.'}]}
},
cleanMemo:p=>clean(p,[...FIELDS,'peer','changed']),
checkSubmit:(s,p)=>{if(!draft(s))return 'Save a draft and complete the peer check first.';try{required(p,[...FIELDS,'peer','changed']);choice(p);}catch(e){return e.message;}return null;},
afterSubmit:s=>[{resolve:{id:'initial',status:s.commitments.initial.choice===s.submitted.memo.choice?'kept':'revised'}},{note:'Recommendation recorded, not approved. The instructor will evaluate the words and conditions; the app does not award a score or certify the offer.'}],
outcome(s){const m=s.submitted?.memo;return {initial:s.commitments.initial,final:m,checks:m? (m.choice==='A'?['Policy 1: confirm rate approval, contiguous seating and booking.','180 × $12 = $2,160 potential gross ticket revenue, not profit or guaranteed sales.']:m.choice==='B'?['Policy 2: the 4 p.m. change cannot be confirmed by noon. Remove or postpone that promise.']:['Policy 3: neither player has agreed. Confirm consent, staffing and a clear limit of 60 photos.','60 photos does not imply 60 buyers or a photo for all 300 ticket buyers.']):[]};},
signals:s=>[{label:s.commitments.initial?`Initial ${s.commitments.initial.choice}`:'Not started',tone:'ok'},{label:s.submitted?`Final ${s.submitted.memo.choice}`:draft(s)?'Peer review':'Working',tone:'ok'}],
cardLine:s=>s.submitted?`${s.commitments.initial.choice} → ${s.submitted.memo.choice}`:'Decision in progress',
projectorQuote:s=>s.submitted?.memo.offer||draft(s)?.offer||s.commitments.initial?.quote||'',
lenses:[{id:'initial',label:'Initial choice',value:s=>s.commitments.initial?.choice||'—',question:'Which assumption changed when you read the staff policies?'},{id:'final',label:'Final choice',value:s=>s.submitted?.memo.choice||'—',question:'Which offer could the club carry out, and what still needs approval?'},...['offer','approver','delivery','fallback','returnMeasure'].map(k=>({id:k,label:labels[k],value:s=>s.submitted?.memo[k]||'—',question:'What does the policy establish, and what must someone still confirm before this promise is advertised?'}))],samples,
};
