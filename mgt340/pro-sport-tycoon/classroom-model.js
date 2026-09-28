import {createState,getProposalById,estimateProposalImpact,runCycle,getDebtSummary} from './model.js?v=20260928c';
export const VERSION='2026-09-28-classroom';
export const ROUNDS=[
 {title:'Build your relationship with fans',theme:'Revenue comes with costs',brief:'The club needs dependable local revenue. Will you reach more customers, improve service for existing fans, or preserve cash?',options:[
  {id:'r_events',label:'Host more non-game events',benefit:'Earn revenue from concerts, meetings and other event dates.',risk:'Bookings may miss the forecast; staffing costs continue.',icon:'events'},
  {id:'r_retention',label:'Improve fan service',benefit:'Support renewals and improve fan confidence.',risk:'A service team costs money even when renewals disappoint.',icon:'fans'}]},
 {title:'Invest in the venue',theme:'An asset needs a funding plan',brief:'Choose one venue improvement—or keep your cash. If you invest, decide whether to pay with club cash or borrow half.',options:[
  {id:'c_premium',label:'Build a premium club',benefit:'Add hospitality revenue and improve the venue.',risk:'Premium demand is uncertain; operating and debt payments continue.',icon:'venue'},
  {id:'c_video',label:'Upgrade the video boards',benefit:'Improve the fan experience and add sponsor inventory.',risk:'Sponsor sales may fall short; maintenance still costs money.',icon:'screen'}]},
 {title:'Decide how to compete',theme:'Winning has an opportunity cost',brief:'Earlier commitments still affect your finances. Choose a roster investment—or protect your flexibility.',options:[
  {id:'p_star',label:'Sign a star player',benefit:'A larger expected competitive lift and stronger fan interest.',risk:'A $38M annual contract continues if performance disappoints.',icon:'star'},
  {id:'p_vet',label:'Add veteran depth',benefit:'A modest competitive lift with a shorter, cheaper commitment.',risk:'Less competitive upside; the $9M annual cost still continues.',icon:'team'}]}
];
export const newGame=()=>createState('growth','growth','MGT340','class');
export function optionsFor(state){return ROUNDS[state.cycle-1].options.map(o=>({...o,proposal:{...getProposalById(o.id),name:o.label}}));}
export function selectionFor(state,id,debtPct=0){
 if(!Number.isInteger(state.cycle)||state.cycle<1||state.cycle>3)throw Error('This franchise has completed its three cycles.');
 if(id==='hold'){if(debtPct!==0)throw Error('Holding cash does not create a new loan.');return [];}
 const option=optionsFor(state).find(o=>o.id===id);
 if(!option)throw Error('Choose one of this cycle’s options.');
 if(![0,.5].includes(debtPct)||(!option.proposal.debtEligible&&debtPct!==0))throw Error('Choose club cash or eligible 50% borrowing.');
 const impact=estimateProposalImpact(state,option.proposal,debtPct);
 if(impact.cashNeed>state.cash)throw Error('You do not have enough cash for this option. Choose another option or hold cash.');
 return [{proposal:option.proposal,debtPct}];
}
export function closeClassroomCycle(state,id,debtPct,text){
 if(!text||text.trim().length<12)throw Error('Add a short sentence explaining the benefit and risk you accept.');
 const selected=selectionFor(state,id,debtPct);
 const option=id==='hold'?{label:'Preserve cash'}:optionsFor(state).find(o=>o.id===id);
 const result=runCycle(state,selected,{text:text.trim(),risk:'See pre-decision explanation',portfolio:[option.label]});
 result.record.classroomChoice={id,label:option.label,debtPct};
 return result;
}
export function financialView(r){
 const local=r.revTotal-r.revenue.shared;
 return {local,shared:r.revenue.shared,revenue:r.revTotal,operatingCosts:r.operatingExpenses,operatingResult:r.profit,interest:r.expenses.interest,profit:r.afterInterest,
 openingCash:r.openingCash,investment:r.upfrontCash,principal:r.principalPaid,endingCash:r.cash,debt:r.debt};
}
export function fanReaction(r){
 const change=r.fan-r.openingFan;
 const mood=change>=.5?'cheer':change<=-.5?'boo':'mixed';
 const d=r.fanDrivers;
 const factors=[];
 if(d.investments>.1)factors.push(`current and continuing investments supported fan confidence (+${d.investments.toFixed(1)} points)`);
 if(Math.abs(d.performance)>.05)factors.push(`the season’s win rate ${d.performance>0?'helped':'hurt'} confidence (${d.performance>0?'+':''}${d.performance.toFixed(1)} points)`);
 if(d.environment)factors.push(`${r.event.title.toLowerCase()} affected fans (${d.environment>0?'+':''}${d.environment.toFixed(1)} points)`);
 factors.push('ongoing fan expectations reduced confidence by 0.5 points');
 return {mood,change,title:mood==='cheer'?'The crowd cheers':mood==='boo'?'The crowd boos':'The crowd is divided',
 explanation:`Fan confidence ${change>=0?'rose':'fell'} ${Math.abs(change).toFixed(1)} points. ${factors.join('; ')}.`,
 note:'A reaction to the recorded season—not a grade of your decision. Fan approval and financial health can move differently.'};
}
export function leagueComparison(r){const loss=r.revenue.shared*.2;return {loss,shared:r.revenue.shared-loss,profit:r.afterInterest-loss,cash:r.cash-loss};}
export function reportText(session){
 const {state,profile,reflection}=session;
 const money=v=>`${v<0?'-':''}$${Math.abs(v).toFixed(1)}M`;
 const last=state.history.at(-1);
 return ['PRO SPORT TYCOON — MGT 340','Classroom edition: 28 September 2026',`Participants: ${profile.names}`,`Format: ${profile.mode==='pair'?'Partners':'Individual'}`,`Franchise: ${profile.club}`,
 'Three annual cycles. Common market and seed: Growth-Market Challenger / MGT340.','Fictional simplified model; not audited financial statements or an automatic grade.',
 ...state.history.flatMap(r=>{const f=financialView(r);return ['',`CYCLE ${r.cycle}: ${r.classroomChoice.label}`,`Funding: ${r.classroomChoice.debtPct?'50% borrowing / 50% club cash':'Club cash / no new borrowing'}`,`Reason recorded before outcome: ${r.rationale.text}`,`External event: ${r.event.title} — ${r.event.desc}`,`Revenue ${money(f.revenue)} (shared ${money(f.shared)}; other ${money(f.local)})`,
 `Operating expenses ${money(f.operatingCosts)}; operating result ${money(f.operatingResult)}; interest ${money(f.interest)}; simplified profit ${money(f.profit)}`,
 `Cash: opening ${money(f.openingCash)} + simplified profit ${money(f.profit)} - cash invested ${money(f.investment)} - principal repaid ${money(f.principal)} = ending ${money(f.endingCash)}`,
 `Debt still owed: ${money(f.debt)}; win rate ${(r.wins*100).toFixed(1)}%; fan confidence ${r.fan.toFixed(1)}/100`,
 ...r.realized.map(p=>`Investment direct annual contribution: forecast ${money(p.forecastNet)}; actual ${money(p.actualNet)} after recurring costs and first-year project debt service. Benefits to wins/brand/fans are separate.`),
 fanReaction(r).explanation];}),
 '',`Final reflection: ${reflection||'(Not entered)'}`,`Ongoing debt: ${money(getDebtSummary(state).principal)}`,
 ...state.activeInvestments.map(p=>`${p.name}: ${p.remaining} modeled years remaining; base annual operating cost ${money(p.annualCost)} (before future cost shocks).`),
 '',last?`Day 2 comparison: a 20% reduction in the last cycle’s shared distribution would reduce that cycle’s simplified profit and ending cash by ${money(leagueComparison(last).loss)}, holding all other inputs fixed.`:'',
 'Model boundaries: no taxes, depreciation, working-capital timing or terminal asset values. Upfront program costs are treated as investment cash outflows. Financial position is not a formal balance sheet. Amounts displayed to one decimal; calculations retain precision.',
 'Submit this report through the channel your instructor specifies. This game does not send it automatically.'
 ].join('\n');
}
