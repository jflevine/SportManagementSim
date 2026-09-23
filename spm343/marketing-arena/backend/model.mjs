// Classroom model v1.0. Fictional, deterministic indices; not empirical forecasts.
export const METRICS = ['Reach','Engagement','Conversion','Authenticity','Brand Fit'];
export const PHASES = ['Lobby','Individual position','Team briefing','Campaign build','Market reveal','Adaptation','Final reveal','Individual defense','Complete'];
// Thirty-minute facilitated schedule; timers guide pacing without auto-submission.
export const ROUND_MINUTES = [2,2,2,8,2,5,1,3,5];
export const MARKETING_TYPES = {of:'Marketing of esports',through:'Marketing through esports',both:'Both of and through esports'};
export const ROLES = ['Brand Director','Audience Strategist','Activation Director','Community & Risk Lead','Budget Director'];
export const AUDIENCES = {players:'Players · competition & social play',spectators:'Spectators · learning & entertainment',fans:'Fans · belonging & team attachment',creators:'Creator communities · personality & interaction'};
export const OBJECTIVES = {awareness:'Build awareness',trial:'Drive trial / acquisition',culture:'Earn cultural relevance',loyalty:'Build repeat engagement'};
export const BRANDS = [
{id:'pulse',name:'PULSE',category:'Energy & refreshment',color:'#f0bc45',objective:'awareness',weights:[.3,.25,.1,.2,.15],audiences:['players','spectators'],products:['competition','experience'],places:['retail','event'],tone:'bold',description:'A challenger refreshment brand looking for its first memorable esports campaign.',strength:'Competition and shared viewing naturally fit the brand.',risk:'A crowded category makes another logo placement easy to ignore.',mandate:'Be remembered for adding excitement. Do not imply that a drink improves competitive performance.',opportunity:'Make a shared gaming moment people want to participate in.'},
{id:'clearwave',name:'CLEARWAVE',category:'Internet & connectivity',color:'#66c8f0',objective:'trial',weights:[.15,.15,.3,.2,.2],audiences:['players','spectators'],products:['clinic','competition'],places:['app','website'],tone:'useful',description:'A regional internet provider entering gaming with a service-trial offer.',strength:'Reliable connectivity solves a recognizable player problem.',risk:'Technical promises are easy to make and difficult to prove.',mandate:'Generate qualified service trials. Never promise zero lag.',opportunity:'Help players understand and improve their connection.'},
{id:'northline',name:'NORTHLINE',category:'Independent streetwear',color:'#beadff',objective:'culture',weights:[.1,.2,.15,.3,.25],audiences:['fans','creators'],products:['drop','content'],places:['website','event'],tone:'collaborative',description:'A small streetwear label commissioning its first gaming collection.',strength:'Creative expression and limited releases fit its identity.',risk:'Borrowing gaming imagery without involving the community can feel extractive.',mandate:'Build a credible collaboration that people would wear beyond a tournament.',opportunity:'Invite fans to help shape a collection and its story.'},
{id:'pacepay',name:'PACEPAY',category:'Everyday payment app',color:'#9adeaa',objective:'trial',weights:[.15,.15,.3,.2,.2],audiences:['creators','fans'],products:['clinic','experience'],places:['app','website'],tone:'useful',description:'A payment app trying to earn consideration from adult gaming consumers.',strength:'Can remove friction in everyday shared purchases.',risk:'Weak esports heritage; aggressive sign-up rewards can look opportunistic.',mandate:'Earn qualified adult sign-ups through clear everyday value. No gambling or credit offers.',opportunity:'Help communities organize shared purchases without overselling finance.'},
{id:'metrobite',name:'METROBITE',category:'Food delivery',color:'#ff9471',objective:'trial',weights:[.15,.2,.3,.2,.15],audiences:['spectators','fans'],products:['experience','content'],places:['app','retail'],tone:'bold',description:'A delivery service competing to become part of match-day routines.',strength:'Food naturally fits watch parties and shared viewing.',risk:'One-off discounts may buy orders without creating loyalty.',mandate:'Drive first orders while giving people a reason to return after the event.',opportunity:'Connect a viewing ritual with a useful, repeatable offer.'},
{id:'vela',name:'VELA',category:'Everyday personal care',color:'#edb4d2',objective:'awareness',weights:[.25,.2,.1,.25,.2],audiences:['creators','players'],products:['content','clinic'],places:['website','retail'],tone:'collaborative',description:'An inclusive personal-care brand entering gaming for the first time.',strength:'Creator-led everyday stories can make an unfamiliar category relevant.',risk:'Stereotypes about gamers or appearance can damage trust.',mandate:'Expand awareness through useful, inclusive stories. Avoid assumptions about gender or appearance.',opportunity:'Work with creators on routines their audience actually values.'}
];
// metrics are [reach, engagement, conversion, authenticity, fit]; context adds further effects.
const o=(id,label,cost,desc,caution,m,audiences=[],tags=[])=>({id,label,cost,desc,caution,m,audiences,tags});
export const OPTIONS={
product:[o('competition','Branded competition',22,'Make participation the offering.','Needs a clear link to what your brand sells.',[8,12,1,5,0],['players'],['participation']),o('content','Creator content series',16,'Offer useful or entertaining episodes.','Attention does not guarantee purchase.',[12,7,2,2,0],['spectators','creators'],['story']),o('drop','Co-designed limited drop',20,'Offer a collectible product collaboration.','Scarcity without demand can alienate people.',[5,6,12,3,0],['fans','creators'],['commerce']),o('experience','Watch-party experience',18,'Build a shared event around viewing.','A one-night experience can fade quickly.',[7,12,5,4,0],['spectators','fans'],['participation']),o('clinic','Practical learning clinic',14,'Solve a specific audience problem.','A narrow promise limits broad reach.',[3,9,7,7,0],['players','creators'],['useful'])],
price:[o('free','Free participation / free trial',10,'Remove the initial access barrier.','Cost is subsidized; free users may not convert.',[5,8,3,3,0],[],['access']),o('discount','Introductory discount',12,'Reduce the cost of first purchase.','Can train customers to wait for deals.',[4,2,12,-2,0],[],['commerce']),o('bundle','Value bundle',8,'Combine relevant value at a clear price.','Unwanted extras weaken perceived value.',[2,4,9,2,0],[],['commerce']),o('premium','Premium limited price',4,'Position the offer as scarce and distinctive.','Higher entry cost narrows the audience.',[-2,0,8,-1,0],['fans'],['premium'])],
place:[o('website','Brand website / online store',7,'Customers register, buy or redeem on your site.','Adds a step after a social interaction.',[3,1,8,0,0],[],['direct']),o('app','Brand app',9,'Customers redeem or use the offer in the app.','An install requirement creates friction.',[1,2,11,-1,0],[],['direct']),o('event','Event / venue',12,'Deliver and redeem the offering on site.','Travel and capacity constrain access.',[1,8,5,5,0],['fans','players'],['live']),o('retail','Retail / local pickup',8,'Make the product available in everyday locations.','Local availability limits access.',[4,1,7,2,0],[],['physical'])],
promotion:[o('story','Co-created branded storytelling',11,'Explain the offer through a creator-led story.','Requires room for the creator’s own voice.',[8,6,3,4,0],['creators','fans'],['story']),o('paid','Paid digital reach',15,'Buy targeted exposure for a clear offer.','Repeated exposure can become intrusive.',[16,1,5,-2,0],[],['paid']),o('giveaway','Giveaway / drop',12,'Offer an immediate reason to interact.','Prize seekers may leave after the reward.',[12,5,4,-4,0],[],['transaction']),o('code','Trackable referral offer',7,'Give people a clear action and referral route.','Sales pressure can crowd out community value.',[4,3,11,-2,0],[],['commerce']),o('challenge','Participatory fan challenge',10,'Invite audience contribution.','Asking for effort without value can backfire.',[6,12,2,4,0],['players','fans'],['participation'])],
pr:[o('listen','Listening session + published response',10,'Ask the community, then explain what you changed.','Consultation without follow-through damages trust.',[1,5,2,12,0],[],['participation']),o('transparent','Transparent creator partnership',6,'Explain payment, purpose, limits and responsibilities.','Transparency alone does not make an offer valuable.',[2,3,3,9,0],[],['disclosure']),o('support','Amateur community support',14,'Resource a community activity and share its outcomes.','A weak brand connection can feel performative.',[3,7,2,10,0],['players','fans'],['participation']),o('broadcast','Launch statement + press briefing',4,'Communicate a clear position at scale.','One-way communication leaves little room to listen.',[8,1,1,1,0],[],['broadcast'])],
channel:[o('twitch','Twitch',10,'Live interaction around gaming and esports.','Attention is concentrated around busy broadcasts.',[10,7,1,1,0],['players','spectators']),o('youtube','YouTube',9,'Searchable stories and explainers with a longer life.','Useful content takes time to develop.',[9,5,4,2,0],['spectators','creators']),o('short','Short-form video',8,'Discoverable clips and creator-led moments.','Fast exposure may produce shallow engagement.',[13,4,1,0,0],['creators']),o('discord','Discord',7,'Ongoing interaction in a defined community.','Low discovery; requires moderation and permission.',[2,11,4,5,0],['players','fans']),o('hybrid','Live + digital',14,'Connect in-person participation with remote access.','More complex delivery and higher cost.',[8,9,3,3,0],['fans','spectators'])],
creator:[o('mega','Mega streamer',27,'Largest audience in the creator market.','High fee and a reputation signal that needs checking.',[19,3,4,0,0],['spectators','creators']),o('pro','Competitive pro',17,'Performance expertise and player credibility.','Expertise may not transfer to your product category.',[10,6,5,5,0],['players']),o('community','Community creator',11,'Close interaction and deep audience trust.','Smaller reach and limited production capacity.',[3,10,4,8,0],['fans','players']),o('lifestyle','Lifestyle gaming creator',15,'Connect gaming with everyday interests.','Audience overlap must be justified.',[10,7,6,4,0],['creators','fans']),o('analyst','Analyst / educator',12,'Explain benefits and build informed consideration.','A narrow audience may limit awareness.',[4,7,8,7,0],['spectators','players']),o('emerging','Emerging creator',7,'Affordable experimentation with a developing voice.','Less proven reach and delivery.',[3,6,3,5,0],['creators'])]
};
export const LABELS={product:'Product',price:'Price',place:'Place · where people obtain it',promotion:'Promotion',pr:'Public relations',channel:'Digital channel · where you reach them',creator:'Creator partner'};
export const JOURNEY={before:{preview:'Creator preview',invite:'Community invitation',offer:'Offer announcement'},during:{participate:'Participate / co-create',watch:'Watch useful content',redeem:'Try / redeem the offer'},after:{return:'Follow-up community program',learn:'Useful recap / learning series',repeat:'Repeat-use benefit'}};
export const TONES={bold:'Energetic, specific invitation',useful:'Useful, evidence-based explanation',collaborative:'Community-led creative voice',stereotype:'“All gamers are the same” shortcut'};
export const SHOCK='48 HOURS TO LAUNCH: Community groups are challenging campaigns that buy attention without providing value. Separately, the mega streamer has missed a sponsor disclosure and dismissed audience questions. Other creator partners are unaffected. Your board wants a response without abandoning its original business objective.';
export const INTEL=[
'BOARD NOTE: Your mandate remains the benchmark after a crisis. A big audience is not a substitute for the consumer action your board needs. Ask which metric could mislead you.',
'AUDIENCE RESEARCH: Players may seek social play or competition; spectators may seek learning or entertainment; fans may seek belonging. These motivations overlap. Demographics alone are not a strategy.',
'PARTNER BRIEF: Mega-streamer reach is strong, but an unresolved disclosure complaint has surfaced. It is a risk signal, not proof of wrongdoing. Ask what due diligence and contingency you need.',
'COMMUNITY INTERVIEWS: Participants distinguish useful brand contributions from borrowed gamer imagery. Transparent sponsorship is acceptable; stereotyping and promises without follow-through reduce trust.',
'FINANCE NOTE: The 100 credits cover the entire campaign. Later pivots cost 5 credits per changed category, at most two categories. A targeted extra investment costs 10. Reserve has option value.'
];
export const RUBRIC=[
{id:'initial',label:'Initial individual position',max:10,level:'individual',evidence:'Independent recommendation: clear audience, objective and reasoned strategic direction.'},
{id:'audience',label:'Audience & objective fit',max:15,level:'group',evidence:'Audience motivation, desired behavior and board objective are connected with a specific explanation in the strategy and desired behavior.'},
{id:'mix',label:'Five Ps integration',max:20,level:'group',evidence:'Product, Price, Place, Promotion and Public relations form a coherent offering; costs and distribution are addressed.'},
{id:'activation',label:'Digital, creator & activation strategy',max:15,level:'group',evidence:'Creator and channel choices fit the audience; before/during/after activity builds a relationship.'},
{id:'authenticity',label:'Authenticity & brand fit',max:10,level:'group',evidence:'Explains concrete value, credible voice and stakeholder concerns without stereotypes.'},
{id:'risk',label:'Tradeoff & risk analysis',max:5,level:'group',evidence:'Names a sacrificed benefit, meaningful risk, stakeholder tension and feasible mitigation in the combined credibility and risk memo (or earlier separate risk response).'},
{id:'adaptation',label:'Adaptation to new information',max:10,level:'group',evidence:'Uses the shock and market evidence to defend changing or preserving the plan under its budget.'},
{id:'defense',label:'Final individual defense',max:15,level:'individual',evidence:'Independently evaluates one decision to keep and one to change using module concepts and the results.'}
];
export const clone=x=>JSON.parse(JSON.stringify(x));
export const choice=(k,id)=>OPTIONS[k]?.find(o=>o.id===id);
export const brand=id=>BRANDS.find(b=>b.id===id);
export const budget=c=>Object.keys(OPTIONS).reduce((a,k)=>a+(choice(k,c?.[k])?.cost||0),0);
export function campaignCost(c,initial,mode){
 let changes=initial?Object.keys(OPTIONS).filter(k=>c[k]!==initial[k]).length:0;
 return {base:budget(c),changes,total:budget(c)+(mode==='pivot'?changes*5:mode==='double'?10:0)};
}
export function validateCampaign(c,initial=null){
 if(!c||typeof c!=='object')throw Error('Complete your campaign first.');
 for(const k of Object.keys(OPTIONS))if(!choice(k,c[k]))throw Error('Choose '+LABELS[k]+'.');
 if(!AUDIENCES[c.audience]||!OBJECTIVES[c.objective]||!TONES[c.tone])throw Error('Choose your audience, objective and voice.');
 for(const k of Object.keys(JOURNEY))if(!JOURNEY[k][c[k]])throw Error('Complete the before, during and after plan.');
 for(const [k,min] of [['strategy',40],['behavior',10],['mixReason',40],['activationReason',40],['authReason',typeof c.riskReason==='string'&&c.riskReason.trim().length>=40?40:60]])if(typeof c[k]!=='string'||c[k].trim().length<min||c[k].length>2500)throw Error('Add a substantive answer for '+k+' (at least '+min+' characters).');
 if(!MARKETING_TYPES[c.marketingType] && !(typeof c.marketingType==='string'&&c.marketingType.trim().length>=25))throw Error('Identify marketing of esports, through esports, or both.');
 if(initial){
  if(!['stay','pivot','double'].includes(c.response))throw Error('Choose your response to the shock.');
  if(typeof c.adaptationReason!=='string'||c.adaptationReason.trim().length<80||c.adaptationReason.length>2500)throw Error('Explain your response, the new information, tradeoff and metric (at least 80 characters).');
  const cost=campaignCost(c,initial,c.response);
  if(c.response==='pivot'&&(cost.changes<1||cost.changes>2))throw Error('A pivot changes one or two paid categories.');
  if(c.response!=='pivot'&&cost.changes)throw Error('Stay or double down keeps all paid categories. Choose pivot to change them.');
  if(c.response==='double'&&!['Reach','Engagement','Conversion','Authenticity'].includes(c.protect))throw Error('Choose a metric for the extra investment.');
  if(cost.total>100)throw Error('Your revised campaign, including change costs, exceeds 100 credits.');
 }else if(budget(c)>100)throw Error('Your campaign exceeds 100 credits.');
 return true;
}
const clamp=n=>Math.max(0,Math.min(100,Math.round(n)));
export function scoreCampaign(c,b,market=[],shock=false){
 let m=[22,22,22,26,42],reasons=[];
 const add=(i,v,msg)=>{m[i]+=v;if(msg)reasons.push({metric:METRICS[i],delta:v,reason:msg});};
 for(const k of Object.keys(OPTIONS)){const x=choice(k,c[k]);if(x)x.m.forEach((v,i)=>m[i]+=v);}
 const matched=['product','channel','creator'].filter(k=>choice(k,c[k])?.audiences.includes(c.audience)).length;
 add(4,matched*5,'Audience alignment across offering, channel and creator');add(1,matched*2);
 if(b.audiences.includes(c.audience)){add(4,6,'Audience fits the brand growth opportunity');add(3,3);}
 if(b.products.includes(c.product)){add(4,9,'Offering fits the brand’s category and mandate');add(3,3,'Category fit supports a credible contribution');}else add(4,-5,'Offering needs a stronger connection to the brand');
 if(b.places.includes(c.place))add(2,5,'Distribution fits the brand’s consumer action');
 if(b.objective===c.objective)add(4,5,'Campaign objective supports the board mandate');else add(4,-5,'Chosen objective departs from the board mandate');
 if(c.tone===b.tone)add(3,5,'Voice fits the brand identity');
 if(c.tone==='stereotype'){add(3,-22,'Stereotyping erodes credibility');add(4,-8);}
 if(c.product==='drop'&&['premium','bundle'].includes(c.price)){add(2,7,'Product and price support a distinctive offer');add(4,5);}
 if(['competition','clinic'].includes(c.product)&&c.price==='premium'){add(1,-7,'Premium entry price restricts participation');add(3,-3);}
 if(['competition','experience'].includes(c.product)&&c.price==='free'){add(1,5,'Free access supports participatory value');add(3,3);}
 if(c.product==='clinic'&&['analyst','pro'].includes(c.creator)){add(2,5,'Expert creator supports informed trial');add(3,4);}
 if(c.product==='drop'&&c.creator==='lifestyle'){add(2,5,'Creator identity supports the collaboration');add(3,4);}
 if(c.channel==='discord'&&c.pr==='broadcast')add(3,-8,'A one-way statement clashes with a participatory channel');
 if(c.promotion==='giveaway'&&c.pr==='broadcast'){add(3,-7,'Transactional reward has little relationship support');add(1,-3);}
 if(c.pr==='support'&&!b.audiences.includes(c.audience))add(3,-4,'Community support lacks a clear audience connection');
 if(c.before==='invite'&&['competition','experience'].includes(c.product))add(1,3,'Pre-event invitation supports participation');
 if(c.before==='preview'&&['content','drop'].includes(c.product))add(0,3,'Creator preview makes the offering discoverable');
 if(c.before==='offer'&&c.during==='redeem')add(2,3,'Pre-event offer leads to a clear redemption moment');
 if(c.during==='participate'&&['competition','experience'].includes(c.product))add(1,4,'Live participation supports the offering');
 if(c.during==='redeem'&&['code','paid'].includes(c.promotion))add(2,4,'Promotion links to a clear consumer action');
 if(c.after==='return'&&['listen','support'].includes(c.pr)){add(1,4,'Follow-through sustains the relationship');add(3,3);}
 if(c.after==='repeat'&&['trial','loyalty'].includes(c.objective))add(2,4,'Post-event activity supports repeat use');
 if(c.after==='learn'&&['content','clinic'].includes(c.product))add(1,4,'Content retains usefulness beyond launch');
 const rivals=market.filter(x=>x&&x!==c);
 const same=k=>rivals.filter(x=>x[k]===c[k]).length;
 const saturation=Math.min(8,same('channel')*2)+Math.min(3,same('audience'));
 if(saturation)add(0,-saturation,'Shared attention: channel and audience crowding');
 if(same('creator')>0)add(1,-Math.min(4,same('creator')),'Creator-market crowding');
 if(c.promotion==='giveaway'&&same('promotion'))add(3,-Math.min(4,same('promotion')*2),'Repeated giveaways create fatigue');
 if(!same('channel')&&matched>=2&&market.length>1)add(0,3,'Differentiation with a coherent audience fit');
 // Trust changes response quality even before the shock.
 add(1,Math.round((m[3]-65)*.14),'Credibility affects meaningful engagement');
 if(shock){
  if(c.creator==='mega'){add(0,-6,'Mega-streamer disclosure controversy');add(3,c.pr==='transparent'?-7:-15,'Creator risk: transparent terms soften but do not remove reputational damage');}
  if(['broadcast'].includes(c.pr)){add(3,-9,'Community backlash exposes one-way communication');add(1,-4);}
  else if(['listen','support'].includes(c.pr))add(3,4,'Existing community relationships provide resilience');
  if(c.response==='double'){let i=METRICS.indexOf(c.protect);if(i>=0)add(i,8,'Ten-credit targeted investment; other objectives receive no extra resources');}
 }
 m=m.map(clamp);
 return {metrics:Object.fromEntries(METRICS.map((x,i)=>[x,m[i]])),power:clamp(m.reduce((v,x,i)=>v+x*b.weights[i],0)),cost:budget(c),reasons,saturation};
}
export function marketResults(teams,shock=false){
 const active=teams.filter(t=>t.initial),market=active.map(t=>shock?(t.final||t.initial):t.initial);
 const results=active.map((t,i)=>({team:t.id,brand:t.brand,...scoreCampaign(market[i],brand(t.brand),market,shock)})).sort((a,b)=>b.power-a.power||a.brand.localeCompare(b.brand));
 results.forEach((r,i)=>r.rank=i&&r.power===results[i-1].power?results[i-1].rank:i+1);return results;
}
export function marketSignals(teams,shock=false){
 const c=teams.filter(t=>t.initial).map(t=>shock?(t.final||t.initial):t.initial);let out=[];
 for(const k of ['channel','audience','creator','promotion']){let counts={};c.forEach(x=>counts[x[k]]=(counts[x[k]]||0)+1);let top=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];if(top)out.push({type:{channel:'CHANNEL WATCH',audience:'AUDIENCE WATCH',creator:'CREATOR MARKET',promotion:'ACTIVATION WATCH'}[k],text:`${top[1]} of ${c.length} locked campaigns chose ${k==='audience'?AUDIENCES[top[0]]:choice(k,top[0]).label}.`});}
 return out;
}
export function makeRoom(code,label,makeup=false){return {code,label,lab:'SPM 343 · Decision Lab 1',phase:0,paused:false,makeup,createdAt:new Date().toISOString(),teams:(makeup?BRANDS.slice(2,3):BRANDS).map(b=>({id:b.id,brand:b.id,initial:null,final:null,draft:null,draftVersion:0,grades:{}})),students:[],timer:null,events:[],initialResults:null,finalResults:null,revealChoices:false};}
export function roleFor(room,student,round=0){const peers=room.students.filter(s=>s.team===student.team);const idx=peers.findIndex(s=>s.id===student.id);return ROLES[(idx+round)%ROLES.length];}
export function roleIntel(room,student){const round=room.phase>=5?1:0;const peers=room.students.filter(s=>s.team===student.team),idx=peers.findIndex(s=>s.id===student.id),assigned=[];for(let i=idx;i<ROLES.length;i+=peers.length)assigned.push({role:ROLES[(i+round)%5],note:INTEL[(i+round)%5]});if(!assigned.length)assigned.push({role:ROLES[(idx+round)%5],note:INTEL[(idx+round)%5]});return assigned;}
export function totalGrade(room,s){const t=room.teams.find(t=>t.id===s.team);const vals=RUBRIC.map(r=>(r.level==='individual'?s.grades:t.grades)?.[r.id]);return vals.every(x=>typeof x==='number')?vals.reduce((a,b)=>a+b,0):null;}
