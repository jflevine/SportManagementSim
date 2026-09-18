// Owner's Box: Franchise Finance Tycoon
// Educational simulation model. All league/team figures are fictional and simplified.

export const SCENARIOS = {
  small: {
    id: 'small', name: 'Small-Market Builder', market: 0.84, fans: 58, brand: 50,
    facility: 62, cash: 78, debt: 115, nationalShare: 145, localMedia: 28,
    baseValue: 1.15, capacity: 44000, elasticity: 0.33, description: 'Lower local revenue, loyal fans, and less room for pricing mistakes.'
  },
  growth: {
    id: 'growth', name: 'Growth-Market Challenger', market: 1.00, fans: 62, brand: 60,
    facility: 70, cash: 102, debt: 155, nationalShare: 145, localMedia: 46,
    baseValue: 1.75, capacity: 51000, elasticity: 0.28, description: 'Balanced economics with upside if you invest intelligently.'
  },
  large: {
    id: 'large', name: 'Big-Market Powerhouse', market: 1.20, fans: 66, brand: 72,
    facility: 66, cash: 128, debt: 225, nationalShare: 145, localMedia: 78,
    baseValue: 2.65, capacity: 59000, elasticity: 0.22, description: 'Strong commercial base, high expectations, and expensive mistakes.'
  }
};

export const FACILITY_OPTIONS = {
  maintain: { id: 'maintain', name: 'Maintain', capex: 5, debtShare: 0.0, facilityGain: 0, fanGain: 0, description: '$5M routine capital work.' },
  refresh: { id: 'refresh', name: 'Fan-experience refresh', capex: 28, debtShare: 0.35, facilityGain: 7, fanGain: 2, description: '$28M refresh; 35% financed with debt.' },
  major: { id: 'major', name: 'Major renovation', capex: 82, debtShare: 0.70, facilityGain: 17, fanGain: 4, description: '$82M renovation; 70% financed with debt.' }
};

export const FOCUS_OPTIONS = {
  balanced: { id: 'balanced', name: 'Balanced portfolio', ticket: 1, sponsor: 1, digital: 1, premium: 1, description: 'No single revenue stream gets special emphasis.' },
  premium: { id: 'premium', name: 'Premium & hospitality', ticket: 0.98, sponsor: 1.03, digital: 0.96, premium: 1.20, description: 'More premium inventory; greater facility dependence.' },
  sponsor: { id: 'sponsor', name: 'Sponsorship growth', ticket: 0.98, sponsor: 1.18, digital: 1.00, premium: 1.02, description: 'Commercial staff concentrate on partners and activation.' },
  digital: { id: 'digital', name: 'Digital & licensing', ticket: 0.96, sponsor: 1.02, digital: 1.24, premium: 0.98, description: 'Invest in content, commerce, data, and licensing.' },
  volume: { id: 'volume', name: 'Fill the building', ticket: 1.08, sponsor: 1.04, digital: 0.98, premium: 0.94, description: 'Lower pricing and bigger crowds; margin depends on demand.' }
};

export const EVENT_DECK = [
  { id:'media_bump', title:'League media rights bump', text:'A new national package adds shared revenue across the league.', national: 14, brand: 1 },
  { id:'injury', title:'Star injury', text:'Your best player misses a large part of the season.', win: -0.09, fans: -2, medical: 6 },
  { id:'sponsor_exit', title:'Sponsor exits category', text:'A major partner declines to renew after a corporate restructuring.', sponsor: -16, brand: -2 },
  { id:'streaming', title:'Streaming breakthrough', text:'A local streaming package outperforms expectations.', media: 16, brand: 2 },
  { id:'slowdown', title:'Consumer spending slowdown', text:'Fans become more price sensitive and corporate buyers trim budgets.', demand: -0.07, sponsor: -8 },
  { id:'naming', title:'Naming-rights opportunity', text:'A regional company wants a long-term facility partnership.', sponsor: 14, brand: 1, facilityMin: 66 },
  { id:'repair', title:'Unexpected facility repair', text:'Mechanical systems require immediate capital work.', forcedCapex: 16, facility: -2 },
  { id:'viral', title:'Viral breakout season', text:'A player and team story catches national attention.', fans: 5, brand: 5, merch: 10 },
  { id:'rival', title:'New rival, new demand', text:'A regional rivalry boosts interest and secondary-market attention.', demand: 0.05, sponsor: 5, brand: 2 },
  { id:'cost_spike', title:'Game-day cost spike', text:'Security, labor, and vendor costs rise faster than planned.', expense: 11 },
  { id:'community', title:'Community trust dividend', text:'A well-received community initiative strengthens local affinity.', fans: 4, brand: 2, expense: 3 },
  { id:'quiet', title:'Stable operating environment', text:'No major external shock this season. Execution matters most.' }
];

export function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rand) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
export function round1(v) { return Math.round(v * 10) / 10; }

export function createGame({scenarioId='growth', seed='MGT340', teamName='Explorer City FC'} = {}) {
  const s = SCENARIOS[scenarioId] || SCENARIOS.growth;
  const rand = mulberry32(hashString(`${seed}-${scenarioId}`));
  const eventDeck = shuffle(EVENT_DECK, rand).slice(0, 5);
  return {
    seed, scenarioId: s.id, teamName, season: 1, maxSeasons: 5,
    market: s.market, fans: s.fans, brand: s.brand, facility: s.facility,
    cash: s.cash, debt: s.debt, nationalShare: s.nationalShare, localMediaBase: s.localMedia,
    baseValue: s.baseValue, capacity: s.capacity, elasticity: s.elasticity,
    cumulativeProfit: 0, cumulativeRevenue: 0, cumulativeExpenses: 0,
    avgWinPctSum: 0, value: s.baseValue, history: [], eventDeck,
    alive: true, facilityAgePenalty: 0,
  };
}

export function defaultDecisions(scenarioId='growth') {
  const base = scenarioId === 'small' ? 88 : scenarioId === 'large' ? 118 : 102;
  return {
    ticketPrice: base,
    rosterSpend: scenarioId === 'large' ? 188 : scenarioId === 'small' ? 154 : 168,
    fanExperience: 16,
    marketing: 14,
    facilityOption: 'maintain',
    focus: 'balanced'
  };
}

export function projectSeason(state, decisions) {
  return calculateSeason(state, decisions, null, true);
}

export function runSeason(state, decisions) {
  if (!state.alive || state.season > state.maxSeasons) return { state, result: null };
  const event = state.eventDeck[state.season - 1] || EVENT_DECK[EVENT_DECK.length-1];
  const calc = calculateSeason(state, decisions, event, false);
  const next = applyResult(state, calc, decisions, event);
  return { state: next, result: calc };
}

function calculateSeason(state, decisions, event, projection) {
  const s = SCENARIOS[state.scenarioId];
  const focus = FOCUS_OPTIONS[decisions.focus] || FOCUS_OPTIONS.balanced;
  const facilityOpt = FACILITY_OPTIONS[decisions.facilityOption] || FACILITY_OPTIONS.maintain;
  const seasonGrowth = 1 + (state.season - 1) * 0.025;

  // Deterministic performance noise based on seed + season. Keeps scenarios comparable across pods.
  const perfRand = mulberry32(hashString(`${state.seed}-${state.scenarioId}-season-${state.season}-performance`));
  const perfNoise = (perfRand() - 0.5) * 0.14;
  // Competitive talent helps, but marginal wins become progressively more expensive.
  // This keeps a simple "spend to win" strategy from dominating the simulation.
  const effectiveRosterSpend = Math.min(decisions.rosterSpend, 190) + Math.max(0, decisions.rosterSpend - 190) * 0.30;
  let winPct = 0.32 + ((effectiveRosterSpend - 120) / 120) * 0.43 + perfNoise + (state.brand - 60) * 0.0008;
  if (event?.win) winPct += event.win;
  winPct = clamp(winPct, 0.18, 0.84);

  const fairPrice = 96 * s.market * (0.92 + state.brand / 500);
  const priceGap = (decisions.ticketPrice - fairPrice) / fairPrice;
  let demand = 0.58 + state.fans / 250 + (winPct - 0.5) * 0.34 + (state.facility - 65) * 0.0025;
  demand -= Math.max(-0.20, priceGap) * s.elasticity;
  demand += (decisions.fanExperience - 15) * 0.0030 + (decisions.marketing - 12) * 0.0018;
  if (focus.id === 'volume') demand += 0.045;
  if (event?.demand) demand += event.demand;
  const attendanceRate = clamp(demand, 0.46, 0.985);

  const homeDates = 16;
  const attendance = s.capacity * attendanceRate;
  const totalAttendance = attendance * homeDates;
  const ticketRevenue = totalAttendance * decisions.ticketPrice / 1e6 * focus.ticket;
  const concessions = totalAttendance * (24 + decisions.fanExperience * 0.22) / 1e6;
  const premium = (11 + state.facility * 0.28 + s.market * 8) * focus.premium * (0.88 + attendanceRate * 0.22);
  let sponsor = (24 + 27 * s.market) * (0.77 + state.brand / 220) * (0.90 + winPct * 0.22) * focus.sponsor;
  let localMedia = state.localMediaBase * seasonGrowth * (0.88 + state.brand / 300) * (0.94 + winPct * 0.10);
  const nationalMedia = state.nationalShare * seasonGrowth + (event?.national || 0);
  let merchDigital = (18 + state.fans * 0.23 + state.brand * 0.16) * (0.90 + winPct * 0.26) * focus.digital;
  if (event?.sponsor) sponsor += event.sponsor;
  if (event?.media) localMedia += event.media;
  if (event?.merch) merchDigital += event.merch;
  sponsor = Math.max(5, sponsor);
  localMedia = Math.max(10, localMedia);

  const revenue = ticketRevenue + concessions + premium + sponsor + localMedia + nationalMedia + merchDigital;

  const venueOps = 43 + (72 - state.facility) * 0.24 + decisions.fanExperience * 0.47;
  const salesMarketing = decisions.marketing + 9;
  const staffTravel = 31 + 3.5 * s.market;
  const leagueAssessments = 18;
  const gameDayVariable = (ticketRevenue + concessions + premium) * 0.115;
  const interest = state.debt * 0.052;
  // Fictional competitive-balance charge: high payroll creates a progressive league cost.
  // It functions like a simplified luxury-tax lesson without copying any one league's rules.
  const payrollSurcharge = Math.max(0, decisions.rosterSpend - 195) * 0.40 + Math.max(0, decisions.rosterSpend - 220) * 0.70;
  const medical = event?.medical || 0;
  const otherShockExpense = event?.expense || 0;
  const expenses = decisions.rosterSpend + payrollSurcharge + venueOps + salesMarketing + staffTravel + leagueAssessments + gameDayVariable + interest + medical + otherShockExpense;
  const operatingProfit = revenue - expenses;
  const margin = revenue ? operatingProfit / revenue : 0;

  const capex = facilityOpt.capex + (event?.forcedCapex || 0);
  const newDebt = facilityOpt.capex * facilityOpt.debtShare;
  const capexCash = facilityOpt.capex - newDebt + (event?.forcedCapex || 0);
  const principal = Math.min(state.debt + newDebt, Math.max(3, (state.debt + newDebt) * 0.025));
  const cashChange = operatingProfit - capexCash - principal;

  return {
    season: state.season, event: projection ? null : event,
    winPct, attendanceRate, attendance, totalAttendance,
    revenue: {
      tickets: ticketRevenue, concessions, premium, sponsorship: sponsor,
      localMedia, nationalMedia, merchDigital
    },
    totalRevenue: revenue,
    expenses: {
      roster: decisions.rosterSpend, payrollSurcharge, venueOps, salesMarketing, staffTravel,
      leagueAssessments, gameDayVariable, interest, medical, shock: otherShockExpense
    },
    totalExpenses: expenses, operatingProfit, margin,
    capex, newDebt, capexCash, principal, cashChange,
    facilityOpt, focus,
  };
}

function applyResult(state, result, decisions, event) {
  const facilityOpt = FACILITY_OPTIONS[decisions.facilityOption];
  const next = { ...state };

  // Fan/brand change is intentionally path-dependent: winning helps, but pricing and investment matter.
  const s = SCENARIOS[state.scenarioId];
  const fairPrice = 96 * s.market * (0.92 + state.brand / 500);
  const pricingPain = Math.max(0, (decisions.ticketPrice - fairPrice) / fairPrice) * 9;
  let fanDelta = (result.winPct - 0.5) * 13 + (decisions.fanExperience - 15) * 0.11 - pricingPain;
  let brandDelta = (result.winPct - 0.5) * 8 + (decisions.marketing - 12) * 0.08;
  fanDelta += event?.fans || 0;
  brandDelta += event?.brand || 0;
  if (facilityOpt.fanGain) fanDelta += facilityOpt.fanGain;

  next.fans = clamp(state.fans + fanDelta, 25, 95);
  next.brand = clamp(state.brand + brandDelta, 25, 95);
  next.facility = clamp(state.facility + facilityOpt.facilityGain + (event?.facility || 0) - 1.3, 35, 98);
  next.debt = Math.max(0, state.debt + result.newDebt - result.principal);
  next.cash = state.cash + result.cashChange;
  next.cumulativeProfit += result.operatingProfit;
  next.cumulativeRevenue += result.totalRevenue;
  next.cumulativeExpenses += result.totalExpenses;
  next.avgWinPctSum += result.winPct;

  const avgMargin = next.cumulativeRevenue ? next.cumulativeProfit / next.cumulativeRevenue : 0;
  const debtDrag = Math.max(0, next.debt - 180) * 0.0007;
  const performanceBoost = (result.winPct - 0.5) * 0.04;
  const brandBoost = (next.brand - 60) * 0.0017;
  const profitBoost = clamp(avgMargin, -0.15, 0.25) * 0.17;
  next.value = Math.max(0.55, state.value * (1.018 + performanceBoost + brandBoost + profitBoost - debtDrag));

  next.history = [...state.history, { ...result, decisions: { ...decisions }, endCash: next.cash, endDebt: next.debt, endFans: next.fans, endBrand: next.brand, endFacility: next.facility, endValue: next.value }];
  next.season = state.season + 1;
  if (next.cash < -30 || next.debt > 470) next.alive = false;
  return next;
}

export function finalScore(state) {
  const seasons = Math.max(1, state.history.length);
  const avgWin = state.avgWinPctSum / seasons;
  const margin = state.cumulativeRevenue ? state.cumulativeProfit / state.cumulativeRevenue : -0.2;
  const financial = clamp(50 + margin * 260 + state.cash * 0.20 - Math.max(0, state.debt - 180) * 0.09, 0, 100);
  const fan = clamp((state.fans + state.brand) / 2, 0, 100);
  const competitive = clamp(35 + avgWin * 90, 0, 100);
  const asset = clamp(45 + (state.value / state.baseValue - 1) * 135 + state.facility * 0.20, 0, 100);
  const diversification = diversificationScore(state.history[state.history.length - 1]?.revenue);
  const total = Math.round(financial * 0.32 + fan * 0.20 + competitive * 0.18 + asset * 0.18 + diversification * 0.12);
  return { total: state.alive ? total : Math.min(total, 45), financial, fan, competitive, asset, diversification, avgWin, margin };
}

function diversificationScore(rev) {
  if (!rev) return 50;
  const vals = Object.values(rev).filter(v => v > 0);
  const total = vals.reduce((a,b)=>a+b,0);
  if (!total) return 0;
  const hhi = vals.reduce((sum,v)=>sum + Math.pow(v/total,2),0);
  // lower HHI = more diversified. Typical range in this model roughly .16-.30.
  return clamp(100 - (hhi - 0.14) * 420, 0, 100);
}

export function gradeLabel(score, alive=true) {
  if (!alive) return 'Franchise distress';
  if (score >= 88) return 'Championship front office';
  if (score >= 76) return 'Sustainable contender';
  if (score >= 64) return 'Competitive but exposed';
  if (score >= 52) return 'Owner intervention required';
  return 'Franchise distress';
}

export function formatMoney(v) {
  const sign = v < 0 ? '-' : '';
  return `${sign}$${Math.abs(v).toFixed(1)}M`;
}
