# MGT 340 — PRO SPORT TYCOON
## Multi-Agent Game Design Constitution & Orchestration Pack
### Phase 1 — Architecture Before Code

**Course:** MGT 340 — Introduction to Sport Management  
**Module:** Week 4 — Financial & Economic Principles Applied to Sport Management  
**Primary classroom use:** Introductory undergraduate students; solo or pods of 4–6  
**Core design principle:** **You cannot maximize everything at once.**  
**Core learning loop:** **Read → Compare → Choose → Fund → Explain → Reveal**

---

# I. Why the Current Game Needs a Structural Rebuild

The existing PRO SPORT TYCOON has a useful foundation: market archetypes, projected P&L, separate profit/cash logic, shocks, financing, and a five-season structure. The next version should preserve those ideas while replacing the mechanics that make the experience repetitive or shallow.

## Current mechanics that should be reconsidered

### 1. Too many broad sliders
Current controls such as roster investment, marketing, and fan experience change formulas, but they do not force students to make sufficiently specific management decisions.

**VNext principle:** Retain continuous sliders only when the variable is genuinely continuous and analytically meaningful (for example, financing mix or perhaps ticket price). Replace broad spending sliders with choices among concrete uses of capital.

### 2. Generic commercial focus choices
“Tickets,” “sponsorship,” “digital,” and “premium” currently operate mostly as one-season multipliers.

**VNext principle:** Turn commercial strategy into actual resource allocation, contracts, projects, staffing, or inventory decisions.

### 3. Capital projects are too abstract
Current facility packages change capex, debt, and facility scores but do not behave like persistent assets with development periods, operating costs, useful lives, or uncertain returns.

**VNext principle:** Capital assets persist across seasons and have construction, opening, operating, maintenance, and financing consequences.

### 4. Board decisions are shallow and mostly temporary
Current board choices mostly create one-season modifiers.

**VNext principle:** Major strategic decisions should create multi-year contractual or organizational consequences.

### 5. Debt is not sufficiently persistent
Debt should behave like debt: a financing decision today creates future principal and interest claims.

**VNext principle:** Track debt tranches, annual debt service, maturity/amortization, and borrowing capacity across the simulation.

### 6. Players are not investments
“Roster spend” is currently a scalar.

**VNext principle:** Students should evaluate specific fictional player opportunities with contract length, age, expected contribution, injury risk, star/brand effects, roster flexibility, and alternatives.

### 7. Information is too centralized
Students currently see the answer-like projection directly on the decision screen.

**VNext principle:** Make the student gather and interpret evidence from a front-office decision center: CFO workbook, scouting report, fan research, commercial forecast, facility memo, etc.

### 8. Too little organizational disagreement
The current game largely speaks with one voice.

**VNext principle:** Competent executives should disagree because they optimize different objectives, use different assumptions, and see different risks.

### 9. Outcomes matter more than reasoning
Students can currently focus on the final score.

**VNext principle:** Capture the student’s rationale before outcomes are known and use it in the post-decision review. Distinguish **decision quality** from **outcome quality**.

---

# II. Game Design Constitution — V1

## 1. North Star

Students operate a professional sport franchise over multiple seasons and must build a financially sustainable, competitively credible, growing organization while managing uncertainty, scarce resources, competing stakeholder demands, and imperfect information.

The game is not about maximizing one number.

A student can:
- win while managing the business badly;
- generate short-term profit while damaging future flexibility;
- make a rational investment that produces a poor outcome;
- make a weak decision and get lucky;
- create franchise value while weakening liquidity;
- improve fan experience while reducing near-term profit.

That tension is the point.

---

## 2. Player Role

The student or pod serves as:

# PRESIDENT / MANAGING PARTNER

They chair the franchise’s internal capital committee and are responsible for integrating recommendations from:
- Chief Financial Officer;
- General Manager;
- Chief Revenue Officer;
- Chief Marketing Officer;
- Chief Operating / Facilities Officer;
- Analytics Director;
- Fan Insights / Consumer Strategy Director;
- Board / Ownership representative.

The student has final decision authority.

---

## 3. Primary Objective

Finish the simulation with a franchise that can:

**COMPETE + GROW + SURVIVE**

The organization should maintain acceptable performance across five dimensions:

1. **Operating performance**  
   Can the core business generate sufficient revenue relative to recurring operating costs?

2. **Liquidity and solvency**  
   Does the franchise have adequate cash, manageable debt, and the capacity to meet obligations?

3. **Competitive credibility**  
   Is the team good enough to sustain demand and justify investment without making winning the only objective?

4. **Fan and brand strength**  
   Has management built durable demand rather than merely extracting revenue from current fans?

5. **Long-term asset and enterprise value**  
   Are the roster, facility, commercial platform, and franchise more valuable and flexible than when management began?

---

## 4. Board Mandates

Every run begins with a strategic mandate. The mandate changes how the board evaluates the same underlying franchise.

Possible mandates:

### THE TURNAROUND
The franchise has lost money for three seasons. Restore financial health without destroying demand.

### THE CONTENDER
The competitive window is open. Increase championship probability without creating an unsustainable future cost structure.

### THE GROWTH STORY
The franchise is healthy but commercially underdeveloped. Diversify revenue and grow enterprise value.

### THE SMALL-MARKET SURVIVOR
You cannot consistently outspend larger markets. Build a resilient business model capable of competing efficiently.

### THE NEW OWNER
Ownership paid a premium acquisition price and added leverage. Improve performance and asset value while protecting debt-service capacity.

### THE FACILITY CROSSROADS
The team’s building is aging. Solve the facility problem while preserving long-term financial flexibility.

**Design rule:** No mandate should have one obvious dominant strategy.

---

# III. Learning Objectives

By the end of gameplay, students should be able to:

1. Trace major revenue and expense flows through a sport organization.
2. Distinguish revenue, operating profit, net income, and cash.
3. Make resource-allocation decisions under scarcity.
4. Explain how assets, liabilities, debt, and owner equity affect organizational flexibility.
5. Evaluate investments using expected return, downside risk, and assumptions.
6. Recognize that projected ROI is uncertain rather than guaranteed.
7. Compare revenue streams based on predictability, margin, control, growth potential, and performance sensitivity.
8. Explain why debt can accelerate growth while creating future fixed claims.
9. Evaluate player contracts as investments in human capital rather than merely “roster spending.”
10. Explain why a good managerial decision can generate a bad outcome under uncertainty.
11. Identify path dependence: how prior decisions constrain later options.
12. Reconstruct a causal chain from decision → organizational effect → revenue/expense → profit → cash/debt → future flexibility.

---

# IV. Non-Negotiable Design Principles

## 1. Scarcity is real
Students cannot fund every attractive investment.

## 2. Every meaningful choice has an opportunity cost
Choosing one initiative should reduce the ability to choose another.

## 3. Every major choice affects at least two systems
Example: a star player may affect wins, sponsorship, merchandise, payroll flexibility, injury risk, and cash.

## 4. Choices persist
Contracts, debt, capital assets, fan reactions, and facility changes do not disappear after one turn.

## 5. Projections are not outcomes
Students see forecasts and confidence ranges before they commit. Actual results arrive afterward.

## 6. Experts can disagree without one being “wrong”
Different departments use different lenses and assumptions.

## 7. Information has to matter
If a spreadsheet, memo, or report does not change the decision calculus, remove it.

## 8. Decision quality and outcome quality are separate
The game should explicitly evaluate whether the reasoning was defensible at the time of the decision.

## 9. Complexity must remain teachable
Every mechanic must map to a learning objective.

## 10. No simple rule should dominate
“Max payroll,” “always borrow,” “never borrow,” “always choose safest ROI,” etc. must not reliably solve the game.

---

# V. Core Game Loop

Each strategic cycle follows:

## 1. BOARD BRIEFING
Students receive:
- mandate status;
- franchise financial health;
- competitive position;
- market environment;
- available cash;
- borrowing capacity;
- current commitments.

## 2. OPPORTUNITY PIPELINE
Several proposals request the same finite resources.

Examples:
- star player acquisition;
- emerging-player contract;
- premium club renovation;
- training center;
- fan technology platform;
- sponsorship expansion;
- ticketing/sales staffing;
- venue district;
- debt refinancing.

## 3. DECISION CENTER
Students can open:
- CFO workbook;
- GM/scouting report;
- commercial forecast;
- fan insights;
- facility memo;
- analytics scenario model;
- board memo.

## 4. EXECUTIVE ADVICE
Each executive gives a recommendation, projection, assumptions, and warning.

## 5. PORTFOLIO / FINANCING DECISION
Students:
- approve;
- reject;
- defer;
- partially fund when appropriate;
- choose cash / debt / equity / public contribution when relevant.

## 6. BOARD RATIONALE
Before outcomes are revealed, students record:

> We chose ___ because ___, and we are accepting the risk that ___.

## 7. UNCERTAINTY RESOLVES
Performance, market conditions, injuries, construction costs, sponsor renewals, and other variables resolve.

## 8. FINANCIAL CLOSE
Students receive:
- operating statement;
- cash bridge;
- debt schedule;
- franchise health changes;
- actual vs forecast results.

## 9. AFTER-ACTION REVIEW
The game shows:
- what management expected;
- what happened;
- why it differed;
- whether the original logic was defensible;
- how the decision affects future flexibility.

## 10. NEXT CYCLE
Persistent consequences carry forward.

---

# VI. Core Systems

## System 1 — Financial Operating Model

Track:
- league/shared revenue;
- tickets;
- premium/hospitality;
- sponsorship;
- merchandise/licensing;
- digital/membership;
- ancillary/non-game events;
- player payroll;
- coaching/front office;
- venue operations;
- sales/marketing;
- fan experience;
- debt interest;
- other recurring operating costs.

Outputs:
- revenue;
- operating expenses;
- operating profit;
- operating margin.

---

## System 2 — Cash and Capital Structure

Track separately:
- beginning cash;
- operating cash contribution;
- capex;
- new debt proceeds;
- new equity contributions;
- principal repayment;
- interest;
- ending cash;
- borrowing capacity.

Debt should exist as persistent tranches, not a single generic number.

Each tranche should have:
- original principal;
- current principal;
- interest rate;
- annual debt service;
- remaining term;
- purpose.

---

## System 3 — Revenue Portfolio and Demand

Each revenue stream receives attributes:

- predictability;
- margin;
- management control;
- growth potential;
- performance sensitivity;
- concentration risk.

Example:
Shared national media may be highly predictable but less controllable.
Playoff ticket revenue may have high upside and high performance sensitivity.

---

## System 4 — Player / Human Capital Investment

Replace generic roster spending with fictional personnel decisions.

Each player opportunity includes:
- age;
- position/archetype;
- contract term;
- annual salary;
- signing / acquisition cost;
- expected contribution range;
- injury / availability risk;
- development trajectory;
- star / brand effect;
- sponsorship and merchandise potential;
- trade / exit flexibility;
- comparable alternative.

The student may also invest in:
- depth;
- scouting;
- analytics;
- player development;
- sports performance.

---

## System 5 — Capital Assets and Facilities

Possible assets:
- premium club;
- suites expansion;
- training center;
- scoreboard / video system;
- fan-tech infrastructure;
- venue renovation;
- non-game event conversion;
- entertainment district;
- new venue.

Every asset includes:
- initial cost;
- construction/development period;
- financing requirement;
- annual operating cost;
- expected revenue/cost savings;
- useful life;
- downside/base/upside scenarios;
- disruption during construction;
- impact on facility condition / capacity / premium inventory;
- salvage / residual value when appropriate.

Assets persist.

---

## System 6 — Competitive Performance

Competitive results depend on:
- player quality;
- depth;
- development;
- coaching / infrastructure;
- injuries;
- randomness;
- prior investments.

Use diminishing returns.

A higher payroll increases expected performance but never guarantees wins.

---

## System 7 — Fan / Brand / Market

Track:
- fan trust;
- demand;
- price tolerance;
- brand reach;
- market capacity;
- corporate demand;
- retention;
- accessibility/affordability perception.

Management can harvest goodwill in the short run and damage future demand.

---

## System 8 — Commercial Operations

Students allocate incremental commercial resources among:
- ticket sales;
- premium sales;
- sponsorship sales;
- retention/CRM;
- digital/membership;
- merchandise/licensing;
- non-game events.

Staffing decisions should model **marginal contribution**, not merely “more staff = more revenue.”

---

## System 9 — Organizational Intelligence

The front office provides imperfect but useful information through:
- financial models;
- scouting;
- consumer research;
- facilities analysis;
- revenue forecasts;
- scenario analysis.

Different experts may disagree.

---

## System 10 — Risk, Uncertainty, and External Environment

Sources of uncertainty:
- player performance;
- injuries;
- demand;
- local economy;
- sponsor renewal;
- media environment;
- construction costs;
- interest rates;
- event calendar;
- competitor entertainment;
- league policy changes.

A shock should modify an already-reasoned investment, not replace decision-making with randomness.

---

# VII. Front Office Executive Team

## CFO — Chief Financial Officer
Primary lens:
- cash;
- margin;
- debt;
- liquidity;
- downside protection;
- borrowing capacity.

Typical concern:
> Can we survive the downside case?

## General Manager
Primary lens:
- competitive window;
- player value;
- roster construction;
- contract flexibility.

Typical concern:
> What does waiting cost us competitively?

## Chief Revenue Officer
Primary lens:
- tickets;
- premium;
- sponsorship;
- commercial inventory;
- contracted revenue.

Typical concern:
> Which investment creates monetizable inventory?

## Chief Marketing Officer
Primary lens:
- brand;
- reach;
- fan acquisition;
- star power;
- partner visibility.

Typical concern:
> What does this do to demand beyond this season?

## COO / Facilities VP
Primary lens:
- facility capacity;
- operating efficiency;
- construction;
- maintenance;
- lifecycle cost.

Typical concern:
> What will this asset actually cost to own and operate?

## Analytics Director
Primary lens:
- expected value;
- ranges;
- scenario probabilities;
- sensitivity analysis.

Typical concern:
> Which assumption is doing the most work?

## Fan Insights Director
Primary lens:
- willingness to pay;
- loyalty;
- retention;
- experience;
- affordability;
- fan sentiment.

Typical concern:
> Are we monetizing demand or damaging it?

## Board / Ownership Representative
Primary lens varies by mandate:
- championship;
- cash distributions;
- growth;
- franchise value;
- risk tolerance.

---

# VIII. In-Game Documents / Files

## CFO Workbook
Tabs:
- P&L forecast;
- cash forecast;
- capital budget;
- debt schedule;
- scenario analysis;
- actual vs forecast.

## Revenue Forecast
Shows:
- attendance;
- price / yield;
- premium demand;
- sponsorship pipeline;
- merchandise;
- contract renewal assumptions.

## Player / Scouting Report
Shows:
- contract;
- performance projection;
- injury risk;
- age curve;
- comparable alternatives;
- brand/commercial effects.

## Fan Insights Report
Shows:
- price sensitivity;
- fan trust;
- demographic segments;
- satisfaction;
- premium demand;
- churn / retention.

## Facility Operations Memo
Shows:
- facility condition;
- deferred maintenance;
- construction estimate;
- capacity;
- premium inventory;
- lifecycle operating cost;
- development timeline.

## Analytics Scenario Brief
Shows:
- downside;
- base;
- upside;
- confidence;
- sensitivity.

## Board Memo
Shows:
- mandate;
- hard constraints;
- owner priorities;
- borrowing/equity tolerance;
- target metrics.

**Design rule:** Every document should contain at least one piece of information that can materially change a reasonable decision.

---

# IX. Investment Proposal Standard

Every major proposal must answer:

## WHAT DOES IT COST?
- initial cash;
- financing;
- recurring cost;
- opportunity cost.

## WHAT CREATES THE RETURN?
- new revenue;
- cost savings;
- wins;
- fan demand;
- sponsor inventory;
- franchise value;
- flexibility.

## HOW CERTAIN IS THE RETURN?
- downside;
- base;
- upside;
- confidence.

## WHAT DO WE GIVE UP?
- cash;
- borrowing capacity;
- another investment;
- control;
- roster flexibility;
- fan goodwill.

---

# X. Example Investment Set

Assume the franchise has **$75M of deployable capital** but proposals request more than $140M.

## Proposal A — Star Player Acquisition
Commitment: $58M current-year / multi-year contract  
Potential effects:
- wins ↑;
- attendance ↑;
- merchandise ↑;
- sponsor visibility ↑;
- payroll flexibility ↓;
- injury exposure ↑.

## Proposal B — Premium Club Renovation
Capex: $42M  
Potential effects:
- premium inventory ↑;
- contracted revenue ↑;
- sponsorship inventory ↑;
- construction risk;
- operating cost ↑.

## Proposal C — Training & Performance Center
Capex: $32M  
Potential effects:
- development ↑;
- availability ↑;
- recruiting ↑;
- roster efficiency ↑;
- weak near-term visible revenue.

## Proposal D — Fan Technology Platform
Capex: $18M  
Potential effects:
- CRM/data ↑;
- concessions efficiency ↑;
- sponsor inventory ↑;
- fan personalization ↑;
- attribution uncertainty.

The student cannot fund everything.

---

# XI. Forecasting and Uncertainty

Do not display fake precision.

Example:

| Investment | Base Return | Downside | Upside | Confidence |
|---|---:|---:|---:|---|
| Premium Club | 11% | 4% | 16% | High |
| Superstar | 9% | -8% | 28% | Low |
| Training Center | 7% | 3% | 12% | Medium |
| Fan Platform | 14% | -2% | 24% | Low |

The player chooses according to strategy, risk tolerance, and mandate.

---

# XII. Outcome Review

After uncertainty resolves, show:

## EXPECTED
- cost;
- revenue / benefit;
- ROI;
- performance contribution;
- downside case.

## ACTUAL
- final cost;
- actual contribution;
- performance;
- cash impact;
- debt impact.

## WHY THE GAP?
Name the causal driver.

## DECISION QUALITY
Return the student’s original rationale.

Prompt:
> Was this a weak decision, or a defensible decision that received an unfavorable outcome?

---

# XIII. Game Length / Classroom Modes

## CLASS MODE
3 strategic cycles  
Target: 18–25 minutes  
Enough to surface:
- one operating allocation decision;
- one player/human-capital decision;
- one capital/financing decision;
- persistent consequences.

## FULL MODE
5 strategic cycles  
Target: 30–45 minutes  
For homework, extended class use, or replay.

## COMPARISON MODE
All pods use the same seed and same mandate but can choose different strategies.

This allows discussion of decision quality rather than luck.

---

# XIV. Variety Engine

Variation should come from multiple independent dimensions:

- market archetype;
- board mandate;
- competitive starting point;
- facility condition;
- debt level;
- opportunity pipeline;
- available player pool;
- macro environment;
- expert assumptions;
- external shocks;
- prior decisions.

This creates replayability without relying on arbitrary randomness.

---

# XV. Mechanics to Retain, Rebuild, or Remove

## RETAIN
- market archetypes;
- same-seed classroom comparison;
- separate profit and cash;
- projected vs actual results;
- multi-season structure;
- financing as a distinct learning problem;
- external uncertainty;
- final debrief.

## REBUILD
- roster spending → player/human-capital investments;
- marketing/fan-experience sliders → marginal budget allocation and specific programs;
- commercial focus → staffing, contracts, inventory, and portfolio decisions;
- facility packages → persistent capital assets;
- board interruptions → multi-year strategic decisions;
- debt model → persistent debt tranches;
- final score → mandate-relative board evaluation;
- shocks → uncertainty that modifies reasoned decisions.

## REMOVE OR MINIMIZE
- broad buttons that create only hidden multipliers;
- controls with no visible causal explanation;
- one-season choices with no path dependence;
- decorative files/data that do not affect decisions;
- scoring systems that encourage optimization without reasoning.

---

# XVI. Agent Organization

## LEVEL 0 — EXECUTIVE GAME DIRECTOR

### Mission
Own the Game Design Constitution and integrate all workstreams.

### Prompt
> You are the Executive Game Director for MGT 340 PRO SPORT TYCOON. Your first responsibility is learning architecture, not code. Treat the Game Design Constitution as binding unless a specialist identifies a pedagogical, financial, or usability defect. Require every mechanic to map to at least one learning objective. Require every major decision to create a tradeoff, opportunity cost, and persistent consequence. Route defects to the owning supervisor. Do not let implementation convenience override learning design. Maximum recursive depth is three levels.

### Exit gates
- game purpose is explicit;
- core loop is coherent;
- systems interact causally;
- decisions are consequential;
- documents contain decision-relevant evidence;
- experts have differentiated lenses;
- persistence rules are defined;
- uncertainty is meaningful rather than arbitrary;
- classroom mode is playable in ~25 minutes;
- no coding begins until Phase 1 is approved.

---

## LEVEL 1A — CURRICULUM & PEDAGOGY SUPERVISOR

### Mission
Protect Chapter 4 learning objectives and introductory-course cognitive load.

### Prompt
> Audit every proposed system, decision, report, and metric against the Week 4 learning objectives. Identify mechanics that are complex without teaching anything. Design scaffolding so introductory students can reason with realistic complexity without needing prior finance coursework. Create the debrief structure that converts gameplay into conceptual understanding.

### Level 2 subagents
**Chapter Alignment Agent**  
Maps every mechanic to Chapter 4 concepts.

**Novice Cognitive-Load Agent**  
Tests whether students know what to look for.

**Debrief & Assessment Agent**  
Designs causal-chain questions and decision-quality reflection.

---

## LEVEL 1B — FINANCE & ECONOMICS SUPERVISOR

### Mission
Own the financial model.

### Prompt
> Design a simplified but internally coherent sport-franchise financial model. Separate operating P&L, cash flow, capital spending, financing, and balance-sheet obligations. Make debt persistent. Ensure ROI is forecast rather than certainty. Model revenue streams according to predictability, control, margin, and performance sensitivity.

### Level 2 subagents
**P&L / Cash Agent**  
Revenue, expense, profit, capex, cash bridge.

**Debt / Equity Agent**  
Debt tranches, amortization, interest, equity contributions, borrowing capacity.

**ROI / Risk Agent**  
Downside/base/upside scenarios, confidence, expected value.

**League Economics Agent**  
Shared revenue, market size, competitive-balance context.

---

## LEVEL 1C — PLAYER & COMPETITIVE STRATEGY SUPERVISOR

### Mission
Turn roster investment into meaningful human-capital decisions.

### Prompt
> Build fictional player and roster investment opportunities with contracts, age, performance ranges, injury risk, development paths, commercial effects, and flexibility. Avoid creating one obviously superior player. Model diminishing returns and competitive windows.

### Level 2 subagents
**Player Contract Agent**  
Contracts, terms, exit flexibility.

**Performance / Injury Agent**  
Expected contribution and uncertainty.

**Competitive Window Agent**  
How current roster position changes investment value.

---

## LEVEL 1D — CAPITAL ASSETS & FACILITIES SUPERVISOR

### Mission
Build persistent physical-asset decisions.

### Prompt
> Design facility and technology investments as long-lived capital assets. Each project requires development time, financing, operating cost, revenue/cost effects, uncertainty, and persistent consequences. Include construction disruption and lifecycle cost where appropriate.

### Level 2 subagents
**Facility Underwriting Agent**  
Project economics and return.

**Construction Risk Agent**  
Cost, schedule, disruption.

**Operations Lifecycle Agent**  
Maintenance and recurring operating impact.

---

## LEVEL 1E — REVENUE / FAN / COMMERCIAL SUPERVISOR

### Mission
Make the revenue side granular and managerial.

### Prompt
> Replace generic commercial multipliers with ticketing, premium, sponsorship, retention, digital, merchandise, and event-business decisions. Build marginal-return logic so staffing and investments can saturate. Connect price decisions to fan demand and long-term trust.

### Level 2 subagents
**Ticketing & Pricing Agent**  
Demand, elasticity, retention.

**Premium & Sponsorship Agent**  
Inventory, pipeline, contracted revenue.

**Fan Insights Agent**  
Trust, willingness to pay, churn.

---

## LEVEL 1F — FRONT OFFICE INTELLIGENCE & ORGANIZATIONAL ADVICE SUPERVISOR

### Mission
Build the executive team and evidence system.

### Prompt
> Create recurring executives whose advice differs because their mandates, metrics, and assumptions differ. Build in-game documents that contain decision-relevant evidence. Experts should be competent, not caricatures. No file may exist solely for decoration.

### Level 2 subagents
**Executive Voice Agent**  
CFO, GM, CRO, CMO, COO, Analytics, Fan Insights, Board.

**Document / Workbook Agent**  
CFO workbook, scouting report, revenue forecast, fan research, facility memo.

**Forecast Disagreement Agent**  
Creates plausible differences in assumptions and confidence.

---
