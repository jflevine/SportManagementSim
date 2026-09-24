// Presentation-only views of a recorded result. Never rerun the simulation.
export const replayMoney = v => `${v<0?'−':''}$${Math.abs(v).toFixed(1)}M`;
const money=replayMoney;
export function leagueSensitivity(record,cut=0){
  if(!Number.isFinite(cut)||cut<0||cut>1)throw Error('Choose a reduction between zero and one.');
  const lost=record.revenue.shared*cut;
  return {cut,lost,shared:record.revenue.shared-lost,profit:record.profit-lost,cash:record.cash-lost,
    share:record.revenue.shared/record.revTotal,local:record.revTotal-record.revenue.shared};
}
export function replayFrames(record){
  const frames=[{kind:'funding',title:'Your capital moves',focus:'funding',
    text:record.realized.length?`${money(record.upfrontCash)} of club cash and ${money(record.newDebt)} of new borrowing fund ${record.realized.length===1?'your investment':'your investments'}. Borrowing adds a liability; it does not create revenue.`:'You held cash this cycle. Existing contracts, operating costs and debt payments still continue.',
    figures:[['Club cash invested',money(record.upfrontCash)],['New borrowing',money(record.newDebt)]]}];
  for(const p of record.realized){
    let mechanism=p.type==='player'?'The roster commitment supports competitive capacity. The whole-team result also depends on existing investments and the external event.':p.type==='capital'?'The asset enters service in this simplified annual model. It adds capacity or capability and continuing operating costs.':'The commercial program begins serving customers. Actual receipts depend on the proposal’s realization and any applicable market effect.';
    frames.push({kind:'investment',focus:p.id,title:p.name,proposal:p,
      text:`${mechanism} ${money(p.realizedRevenue)} direct revenue, less ${money(p.actualCost??p.annualCost??0)} recurring cost${p.debtService?` and ${money(p.debtService)} first-year debt payments`:''}, yields ${money(p.actualNet)} direct cash contribution.`,
      figures:[['Base direct net',money(p.forecastNet)],['Actual direct net',money(p.actualNet)],['Operating commitment',`${p.term} years`]]});
  }
  frames.push({kind:'season',focus:'season',title:record.event.title,
    text:`${record.event.desc} Your club finishes with a ${(record.wins*100).toFixed(1)}% win rate and average attendance of ${Math.round(record.attendance).toLocaleString('en-US')}. These are whole-club outcomes, not the isolated return on one investment.`,
    figures:[['Win rate',`${(record.wins*100).toFixed(1)}%`],['Average attendance',Math.round(record.attendance).toLocaleString('en-US')]]});
  const league=leagueSensitivity(record);
  frames.push({kind:'league',focus:'league',title:'Your club is part of a league',
    text:`${money(record.revenue.shared)} comes from the shared league distribution, the same modeled amount for every market under this event. Your club earns another ${money(league.local)} locally and from investments. Sharing supports resources; it does not require reinvestment in talent or guarantee competitive balance.`,
    figures:[['Shared distribution',money(record.revenue.shared)],['Share of club revenue',`${(league.share*100).toFixed(0)}%`]]});
  frames.push({kind:'cash',focus:'cash',title:'Profit becomes cash available',
    text:`Opening cash ${money(record.openingCash)} + operating profit ${money(record.profit)} − interest ${money(record.expenses.interest)} − club cash invested ${money(record.upfrontCash)} − principal repaid ${money(record.principalPaid)} = ending cash ${money(record.cash)}.`,
    figures:[['Ending cash',money(record.cash)],['Debt still owed',money(record.debt)],['Commitments continuing',String(record.commitments.filter(x=>x.remaining>1).length)]]});
  return frames;
}
