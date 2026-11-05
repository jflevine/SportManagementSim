# Pixel Forge: Bargaining Room

A self-contained, 15–18 minute SPM 370 labor relations legal decision lab.

Live: https://jflevine.github.io/SportManagementSim/spm370/labor-relations-decision-lab/
Instructor guide: append `#instructor` to the live URL.

## Classroom use

Use at lecture slide 23. Teams of 3–4 share one device, or the instructor projects the activity and gathers votes. The stipulated employment and union-representation facts are preserved. Evidence files, operational consequences, and the CFO twist are clearly labeled fictional extensions.

1. Brief and assign roles (2 minutes).
2. Inspect two of four evidence files (3 minutes).
3. Choose a response and examine legal and operational feedback (3 minutes).
4. Respond to the CFO twist (3 minutes).
5. Write two risks, one missing fact, and a recommendation with a tradeoff (4 minutes).
6. Debrief (up to 3 minutes).

No grades, countdown locks, accounts, analytics, network submissions, or browser persistence. Written work is held only in current page memory and lost on reload/close. Teams can download or print their memo. No names or personal information should be entered. GitHub may retain ordinary hosting access logs.

The instructor guide is public teaching content, not a protected dashboard. A printable paper activity is available through Print fallback.

## Legal framing

Good faith does not require agreement or concession. Cancellations are examined in context and the totality of conduct. An actual inability-to-pay claim may call for substantiation after a relevant request; unwillingness is distinct. Relevance, scope, time period, confidentiality, and the actual statements matter. Feedback never makes a deterministic liability finding. Sources are linked in the instructor guide.

## Development

No build step, dependencies, images, external fonts, backend, or secrets. Open `index.html` in a current browser or serve the directory as static content.

Run the structural/logic tests:

    node test.cjs

Tests cover all 96 two-file/initial-response/twist-response combinations, repeated-click locks, the evidence limit, output escaping, and absence of network submission or persistence. These are stub-DOM tests, not a substitute for live browser QA.

Published page was manually tested through the complete student flow, memo generation, export action, instructor view, and return navigation. Responsive CSS supports single-column screens below 760px, visible focus, large touch targets, reduced motion, and printing. No automated legal grading or authoritative legal determination is made.
