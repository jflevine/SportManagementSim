# The Arena Deal

A self-contained browser discussion game for MGT 340: Introduction to Sport Management. It applies facility funding and revenue concepts without a staffing simulation or a multiseason finance model.

- Student route: `mgt340/arena-deal/`
- Instructor view: add `?guide=1`
- Target: 12–15 minutes, self-selected pods of 2–3, one device per pod
- Ungraded, no accounts, no student names, no backend or automatic submission

## Classroom route

1. **0–2 minutes:** introduce the fictional $120M Harbor Arena project. Students choose a deal they can defend; there is no winning score. Assign an operator and a challenger; a third student can lead the report-out.
2. **2–5:** choose a one-time public/private construction contribution: $20M/$100M, $60M/$60M, or $90M/$30M. A hypothetical $100M public capital allocation leaves $80M, $40M, or $10M for other capital priorities.
3. **5–8:** choose an annual operating package. The package combines revenue forecasts and reserved community dates.
4. **8–11:** a touring-event series cancels. All packages lose the same $1.5M rental revenue. Pods keep their operating plan or revise it.
5. **11–15:** hear two contrasting 60-second pitches. Ask who pays, who benefits, what was traded away, and which facts or deal terms still need verification. Downloading the final proposal is optional.

Rotate the operator each decision. The time budget is a facilitation target, not a measured student completion time. No real-time countdown is used.

## Model

All figures, offers, and scenarios are original classroom assumptions, not a forecast about a real facility.

| Annual package | Rentals | Sponsors/premium | Food/drink/parking | Total revenue | Costs | Original operating result | Result after loss | Community dates |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Commercial-first | $4.5M | $4M | $2M | $10.5M | $9M | $1.5M surplus | Break-even | 6 |
| Mixed calendar | $4M | $3M | $2M | $9M | $9M | Break-even | $1.5M gap | 16 |
| Community-first | $3M | $2.5M | $2M | $7.5M | $9M | $1.5M gap | $3M gap | 30 |

- The $120M construction budget is **one time**. The $100M public capital allocation is a fictional opportunity-cost device, not operating support.
- Each funding offer has a separately negotiated calendar condition: private-heavy requires commercial-first; shared permits commercial-first or mixed; public-heavy gives the city discretion across all three. These are explicit fictional offer terms, not effects of funding share.
- Every package stays selectable for discussion. A conflicting plan is labeled before selection, after the shock, in final results, and in the download as requiring renegotiation. The quoted private contribution cannot be assumed available; construction funding is not secured.
- If accepted, capital contributions are treated as upfront funds. No bonds, interest, borrowing, debt service, or investment returns are computed.
- **Funding share does not determine ownership, control, revenue rights, or responsibility for a gap.** The calendar conditions above are specified separately. Ownership, revenue rights, and responsibility for a gap remain open for negotiation. A private contribution is not represented as a gift. The result explicitly asks students what each side would expect.
- Annual numbers describe the **whole venue**. They are not partner payouts, total profit, or city economic impact.
- Annual cost is fixed at $9M and includes staffing, upkeep, services, and subsidized community dates. Financing costs, capital replacement, taxes, and other items are excluded. This is not a full financial model.
- Each package included the same touring series; losing it removes $1.5M of rentals. No cost reduction is modeled. A revised package still faces the loss, and remains an uncertain forecast.
- Community dates are reserved dates, not attendance or capacity estimates. Their public value is not converted to an arbitrary numerical score.
- A gap is not silently assigned to the city. The proposal needs an agreed source of support or further revision before approval.

## Why no score?

Commercial-first provides a stronger operating forecast and fewer reserved community dates. Community-first provides more reserved access and a larger funding requirement. Students must articulate and defend the trade-off rather than optimize a moral or composite score. A higher public contribution comes with broader negotiated calendar discretion in this scenario. A lower-public offer cannot be combined freely with community-first use while retaining an unconditional private pledge; such proposals require renegotiation.

## Access, privacy, and fallback

- All choices use labeled buttons with visible focus and selected states.
- Keyboard and touch operation; responsive layout; no dragging, timed actions, or required animation.
- No external libraries, assets, fonts, APIs, tracking, browser storage, cookies, or network calls.
- Choices and an optional short reflection live only in tab memory. Refreshing or closing clears them. Start-over asks before clearing the in-tab proposal.
- Downloads are plain text, created in the browser. They include the public/private split, original and final annual forecasts, community dates, and optional argument. Nothing is centrally submitted or available for the instructor to retrieve.
- Paper fallback: use the reference table, funding splits, and their calendar conditions, then announce the rental loss and ask pods to keep or revise.

## Local use and tests

Open `index.html` directly or serve this directory with `python3 -m http.server 8000`. No build or package installation is needed.

Run `node tests.mjs`. The suite extracts the actual embedded model, checks all 27 funding/initial/final combinations, validates reference outcomes and the common shock, distinguishes construction from operations, checks incomplete inputs and deterministic behavior, parses scripts, and checks self-contained packaging. Browser smoke tests cover the controls, Back, keep/revise, download, reset, and instructor route separately.
