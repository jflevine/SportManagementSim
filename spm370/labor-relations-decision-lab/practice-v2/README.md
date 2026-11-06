# Pixel Forge: Bargaining Room · two-sided individual edition

An individual 15–18 minute SPM 370 labor relations decision lab. Students choose management or union adviser, select a client priority, inspect two evidence files, make two four-option decisions with immediate feedback, and write a four-part adviser memo. The optional enforcement check adds feedback, not a grade.

Student URL: https://jflevine.github.io/SportManagementSim/spm370/labor-relations-decision-lab/

Instructor guide: append `#instructor`. This is a public teaching resource, not an authenticated grading dashboard.

## Teaching design

One workplace, one represented unit, one bargaining dispute, one financial complication. Covered U.S. employment, Pixel Forge's employer identity, the unit, and lawful recognition are stipulated. The employer has canceled three meetings, claimed it cannot afford raises, and refused relevant financial support. No CBA exists. Added documents and consequences are explicitly fictional extensions of the assigned chapter's Hypothetical 5 and lecture slides 23–24.

Management's path addresses operational viability, honest financial claims, relevant substantiation, confidentiality, genuine bargaining, and avoiding direct dealing or unsupported impasse. The union's path addresses targeted requests, bargaining strategy, fair representation of all unit employees including nonmembers, conditional enforcement, and honest advice about economic pressure. The union never automatically sees internal financial records. Duties are not presented as perfectly symmetrical.

The chosen priority provides an advice lens, not a hidden score. There is more than one defensible strategy. Good faith requires neither agreement nor concession. Legal feedback is conditional and does not adjudicate a violation. A proposed risky act is distinguished from conduct that already occurred.

## Student output and privacy

Four required short responses: a bargaining/information risk; a distinct risk for the chosen client; one missing fact and its source/value; a concrete 48-hour recommendation with a tradeoff. No name, email, login, automatic grade, analytics, submission endpoint, or browser persistence is used. Work remains only in the current page's memory and is lost on refresh or close. GitHub may retain ordinary hosting logs.

Students can download a plain-text memo or print/save as PDF. **Downloading is not submission.** The instructor must separately state how to share the file. There is no student record collection or grading dashboard for this activity.

## Navigation and access

Guide navigation preserves work. Revisiting an earlier stage preserves choices and writing. Changing an earlier recommendation after downstream work requires confirmation and clears dependent decisions and memo to prevent contradictory output. Start fresh also confirms before clearing an active run. Choosing another role begins a new run; save the first memo beforehand.

The responsive interface includes keyboard focus, labeled form controls, large targets, reduced-motion support, and accessible status text. `paper.html` is a complete no-JavaScript alternative for either role. `v1.html` preserves the original one-sided activity unchanged.

## Course alignment

The supplied 31-slide SPM 370 lecture and full assigned Chapter 9 were reviewed. Threshold employee/employer/jurisdiction issues and Section 7 come first in the reference guide, then representation, bargaining subjects and good faith, role-specific responsibilities, and enforcement. The core interaction concentrates on the slide 23–24 case rather than adding disconnected mini-cases. The public instructor guide includes a common 10-point optional rubric, debrief prompts, source mapping, and NLRB references. Student clicks are not automatically graded.

## Development and verification

Static HTML, CSS, and vanilla JavaScript; no dependencies or build step to run. `content.js` contains authored case/rule data; `app.js` handles page-memory state and rendering. Do not add private credentials, student records, or secret assessment keys.

- `node test.cjs`: exhaustive stub-DOM traversal of 576 role/priority/evidence/decision combinations; navigation gates; text escaping; plain-text export and print triggers; guide preservation; reset cancellation; downstream invalidation; fresh-page state; absence of network/storage calls. Not a substitute for browser QA.
- `node build-paper.cjs`: regenerates the standalone paper activity from current content.
- Real-browser and independent legal/source review are required before release.

