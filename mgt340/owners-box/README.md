# Owner's Box: Franchise Finance Tycoon

Static browser simulation for **MGT 340: Introduction to Sport Management — Week 4: “How does the money work?”**

## Learning purpose
Students manage a fictional professional sport franchise for five seasons and balance:
- major revenue streams;
- operating expenses;
- roster spending and competitive performance;
- facility capital spending and debt;
- liquidity versus operating profit;
- fan/brand equity; and
- revenue diversification.

The model is deliberately simplified. Dollar values are instructional, not estimates of any real team or league.

## Recommended classroom use
**Time:** 15–20 minutes plus a 5–8 minute debrief.

1. Put students in pods of 4–6 or allow solo play.
2. Give every pod the same class seed, such as `MGT340-SEP24`. Same seed = same five market shocks.
3. Require a one-sentence board rationale before each season is locked.
4. Compare board scores **and** strategies. The highest score is not the only defensible answer; focus on tradeoffs.
5. Debrief revenue, expenses, operating profit, cash, debt, facility investment, revenue sharing, and market size.

## Facilitation prompts
- “You increased revenue. Did you increase profit?”
- “You earned a profit. Why did cash still fall?”
- “What was the marginal return on additional roster spending?”
- “Which revenue stream was most resilient to shocks?”
- “How did shared national revenue change the economics of a small-market franchise?”
- “When did a facility investment improve the asset but worsen short-run liquidity?”

## Architecture
- `index.html` — interface
- `styles.css` — visual system and responsive layout
- `app.js` — UI controller
- `model.js` — deterministic simulation model and scoring

No build step or external dependency is required for GitHub Pages.
