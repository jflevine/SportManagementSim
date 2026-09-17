# MGT 340 Sport Marketing Pod Draw

An in-class activity for MGT 340 (Introduction to Sport Management) at La Salle University. Pods of 4–6 students each draw a real sport business event from the past two weeks, a marketing role, and randomized constraints. They then apply the sport marketing process: understand the consumer, select the market, and set the marketing mix (product, price, place, promotion).

## Live links

- Instructor/projector: `https://jflevine.github.io/SportManagementSim/mgt340/sport-marketing-pod-draw/`
- Student join screen: `https://jflevine.github.io/SportManagementSim/mgt340/sport-marketing-pod-draw/#join=1`
- Specific pod example: `https://jflevine.github.io/SportManagementSim/mgt340/sport-marketing-pod-draw/#code=KX7Q&pod=B`

## How it works

- **Instructor view (projector):** Shows a four-character session code, one card per pod, a countdown timer, and a curveball button.
- **Student view (phones or laptops):** Students enter the session code and their pod letter to open their brief and worksheet.
- **Consistent draws:** A pod's draw depends only on the session code and pod letter, so the projector and every phone show the same scenario. There is no server or database.
- **Student answers:** Answers are saved only in each student's own browser (localStorage). Nothing is sent anywhere. "Copy our plan" puts a pod's answers on the clipboard for submission.

## Files

- `index.html`: the entire app. HTML, CSS, and JavaScript are in one file with no build step.
- `CHATGPT_CODEX_HANDOFF.md`: architecture and maintenance notes for future AI-assisted edits.

## Updating scenarios

All scenario content lives in the `EVENTS` array near the top of the `<script>` block in `index.html`. Each event has:

- `title`, `tag`
- `lens`: `"spectator"` or `"participant"`
- `facts`
- `roles` (each with `who` and `brief`)
- `segments`
- `curveballs`
- `sources`

To refresh the activity for a new week, replace or add events in the same shape. Keep `facts` limited to verified reporting, with links in `sources`.

## Content note

The scenario facts summarize reporting current as of September 16, 2026, and each event lists its sources. Values described as "reported" were not officially disclosed. Roles, budgets, and curveballs are fictional teaching prompts.
