# Ecosystem Architect: Season One — Instructor Guide

## Recommended classroom use

**Standard Class** is the default run mode and is designed for approximately 18–22 minutes of group play plus debrief.

Suggested sequence:

1. **2 minutes — Opening / mission framing**
   - Let the cold open run.
   - Ask students to listen for the four recurring tensions: power, money, law, legitimacy.

2. **4 minutes — Stakeholders and board priorities**
   - Students review stakeholder cards.
   - Each pod chooses three priority constituencies.
   - Quick prompt: *Which stakeholder did you intentionally leave outside the top three, and why?*

3. **3 minutes — Competitive architecture**
   - Students choose Closed / Partnered, Open Circuit, or Hybrid.
   - Require one-sentence defense before advancing.

4. **3 minutes — Money engine**
   - Students allocate 100 operating-revenue points.
   - Ask them to distinguish **stable** revenue from **independent** revenue.

5. **3 minutes — Legal loadout**
   - Students choose five protections.
   - Prompt: *Which omitted protection worries you most?*

6. **5–7 minutes — Crisis arc**
   - Students decide before reading the legal concept explanation.
   - After each crisis, call attention to stakeholder salience movement.

7. **3 minutes — Final Board Meeting**
   - Students choose Approve / Approve with Restructuring / Do Not Renew.
   - Require a 2–4 sentence defense.

8. **5–10 minutes — Whole-class debrief**
   - Compare different architectures and accepted tradeoffs.

## Debrief questions

Use the following prompts after play:

- Which stakeholder became more important than you expected?
- Did your most powerful stakeholder also have the greatest legitimacy?
- Which crisis changed your view of the ecosystem most?
- Which legal protection created the greatest strategic value?
- Which omitted protection created the most uncomfortable exposure?
- Was your most stable revenue source also your safest strategic source?
- Did publisher control create stability, dependency, or both?
- Would a different competitive architecture have absorbed your crises differently?
- What would you renegotiate before Year Two?

## Instructor console

Use the normal live URL and click **Instructor**, or append `?instructor=1` to open the instructor console automatically.

The instructor console currently controls only the local projector/demo browser.

Available controls:

- change run mode
- force the next crisis
- reveal all concepts
- copy a compact debrief
- jump to the final board meeting

## Run modes

### Sprint — 10–12 minutes
Use when the simulation is one component of a lecture or when students already know the concepts. Two crises.

### Standard Class — 18–22 minutes
Recommended first use. Three crises and the clearest balance between pacing and reflection.

### Deep Dive — 25–30 minutes
Use for extended activity periods, review sessions, or a more formal decision exercise. Four crises.

## What the scores mean

The numerical ecosystem indicators are **instructional diagnostics, not legal conclusions and not grades**.

Legal Decision Lab 1 is graded from the student's individual written analysis using the 10-point rubric below. Every group receives the same three crises in the same order: **The Pathway Disappears**, **The Sponsor Walks**, and **The Unlicensed Major**. This standardization keeps the legal fact patterns comparable across students while preserving different group architectures and strategic choices.

## Legal Decision Lab 1: graded use

The activity now includes an **individual Legal Decision Lab check-out** after the group simulation. This is the scorable artifact for the syllabus category.

The simulation itself supplies the small-group deliberation and shared factual record. Each student then chooses one crisis from the group's run and independently completes four prompts:

1. **Issue spotting** — identify the legally significant issue or issues.
2. **Legal principle + application** — state the relevant doctrine, contractual principle, rule, or legal concept and apply it to the facts.
3. **Stakeholder analysis** — explain whose rights, power, risks, or interests matter most.
4. **Recommended course of action** — give a specific management recommendation and defend it.

### Recommended scoring: 10 points per lab

- **Issue spotting — 0–2 points**
  - 2: identifies the material legal issue(s) accurately and specifically.
  - 1: identifies a relevant issue but incompletely or too generally.
  - 0: misses the material legal issue.

- **Legal principle + application — 0–3 points**
  - 3: states an appropriate legal principle and applies it accurately to the scenario facts.
  - 2: generally correct principle/application with a meaningful omission or imprecision.
  - 1: names a relevant concept but offers little or flawed application.
  - 0: no meaningful legal application.

- **Stakeholder analysis — 0–2 points**
  - 2: identifies the key stakeholders and explains the competing rights, leverage, risks, or interests.
  - 1: identifies relevant stakeholders with limited analysis.
  - 0: no meaningful stakeholder analysis.

- **Recommended course of action — 0–3 points**
  - 3: gives a specific, feasible recommendation tied to law, facts, and tradeoffs.
  - 2: defensible recommendation with incomplete support.
  - 1: recommendation is generic, weakly supported, or disconnected from the analysis.
  - 0: no actionable recommendation.

For the course's five Legal Decision Labs, record each lab out of 10. Drop the lowest score and average the best four. That percentage becomes the student's score for the **20% Legal Decision Labs** course category.

Example: 8, 9, 7, 10, 6 → drop the 6 → best-four average = 8.5/10 = 85% → 17/20 course percentage points.

### Collection workflow

The GitHub Pages site now sends the completed **individual** Legal Decision Lab submission to the course's secure assessment backend. Students enter first name, last name, and a La Salle email address. The official record includes the group simulation evidence plus the student's four individual analysis responses.

Because the GitHub repository is public, **student names, email addresses, and responses are not committed to GitHub**. They are stored in the private Supabase assessment table `spm370_ldl1_submissions`, using the same backend pattern as the course knowledge checks. The public repository contains only the application code.

The backend records four nullable grading fields—issue spotting (0–2), legal application (0–3), stakeholder analysis (0–2), and recommendation (0–3)—and automatically calculates the total once all four scores are entered. A private grading view, `spm370_ldl1_grading_queue`, presents the submission text and rubric columns for instructor review.

Students receive a unique receipt after successful submission. No LMS upload is required. A backup text download remains available in case of a connection problem. If one group shares a device, students can submit one at a time and use **Clear for Next Student** without resetting the group simulation.

The ecosystem-health indicators remain **instructional diagnostics, not grades**. They are stored with the submission as evidence the student may use in the legal analysis.

## Privacy guidance

Group gameplay progress remains local to the browser until the individual student submits the lab. The official submission sends only the information needed for assessment: student name, La Salle email, the group simulation record, and the student's individual legal analysis.

Identifiable student records are stored in the private assessment backend and are **not** written to the public GitHub repository. The submission table has row-level security enabled and no public read policy. The public Edge Function accepts submissions only from the approved course site origin and validates La Salle email addresses.

Do not ask students to place student ID numbers or other sensitive information in the team-name field.

## Troubleshooting

If a student closes or refreshes the tab, the browser should resume the saved run.

If the app displays the red runtime-error notice:

1. reload the page;
2. confirm that progress resumes;
3. if necessary, reset and start a new session.

For classroom use, opening the live application in a fresh browser tab before class is recommended.
