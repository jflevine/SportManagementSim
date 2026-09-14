# SPM 370 — Ecosystem Architect

## Purpose

**Ecosystem Architect: Build an Esports Business Model** is an interactive Chapter 3 simulation for SPM 370: *Esports, Video Games, and the Law*.

The simulation turns the chapter's central concepts into a sequence of applied decisions. Students design a fictional competitive ecosystem, allocate revenue, choose limited legal tools, inspect a legal-risk dashboard, respond to crisis events, and generate a final business-model report.

## Learning alignment

The prototype is designed to help students:

- distinguish grassroots, scholastic/amateur, and professional competitive contexts;
- compare closed/partnered, open-circuit, and hybrid access structures;
- identify and evaluate major esports revenue streams;
- analyze publisher dependency and IP gatekeeping;
- prioritize contractual protections and recognize cross-contract dependencies;
- identify labor, antitrust, governance, privacy, safeguarding, and consumer-protection risks;
- distinguish issues management can address from issues that should be escalated to counsel; and
- explain how legal architecture changes the resilience of a business model.

## Playtest v2 flow

1. Publisher / ecosystem-designer role
2. Competition-level selection
3. Closed / Open / Hybrid architecture selection
4. Seven-stream revenue allocator totaling 100 points
5. Live revenue-stability and publisher-dependency feedback
6. Five-slot contract-card builder
7. Six-axis legal-risk board
8. Animated season launch
9. Ten-crisis library, with three randomized per playthrough
10. Five live ecosystem metrics:
   - Financial Sustainability
   - Competitive Access
   - Publisher Control
   - Legal Resilience
   - Fan Legitimacy
11. Final Ecosystem DNA / Board Report
12. Three reflection prompts
13. 30-second classroom debrief screen
14. Local browser saving, reset/replay, copy report, and print/PDF support
15. Responsive mobile layout

## Playtest v2 presentation / feedback upgrades

The second pass adds the classroom-facing polish needed for a more game-like experience:

- animated launch countdown between build and crisis phases;
- full-screen Breaking News crisis alerts;
- animated metric deltas showing the consequence of each decision;
- a live publisher-dependency meter;
- a stakeholder network that lights up the publisher, league, organizer, team, player, sponsor, and platform relationships implicated by contracts and crises;
- clearer post-decision explanations of why a choice changed the model;
- an explicit **Escalation Lens** identifying when management can act and when counsel or institutional review is appropriate;
- stronger Ecosystem DNA presentation with an archetype and resilience ring; and
- a large-format **30-Second Classroom Debrief** view so groups can compare models quickly in discussion.

## Crisis library

The crisis bank includes:

- Publisher Shock / competitive-format redesign
- Sponsor Collision
- Star Player Banned
- Labor Classification Challenge
- Antitrust Alert
- Consumer Protection / COPPA Crisis
- Tournament License Dispute
- Scholastic Data Incident
- Investor Exit Pressure
- Integrity Breakdown

Each crisis identifies the stakeholders affected, changes the live dashboard, explains the legal/business consequence, and provides an escalation cue.

## Pedagogical design principle

The application intentionally avoids a single "correct" ecosystem. Each architecture produces tradeoffs among access, control, revenue stability, legal resilience, and legitimacy. Scores are diagnostic teaching prompts rather than legal conclusions.

The main classroom question is not "Who got the highest score?" It is: **What tradeoff did your group intentionally accept, and what would you renegotiate before Year 2?**

## Technical design

The prototype remains intentionally dependency-free: one HTML file with inline CSS, JavaScript, and SVG. This makes it easy to host through the existing `SportManagementSim` GitHub Pages workflow and reduces technical friction for students.

Student state is stored in `localStorage`; no login or database is required for the playtest.

## Validation completed in this pass

- JavaScript syntax check completed successfully with Node.
- Duplicate DOM ID check completed successfully.
- Resume-state handling was corrected so a saved crisis decision can continue to the next crisis.
- The application preserves the Chapter 3 distinction between diagnostic teaching scores and legal conclusions.

A full browser/device playtest is still recommended before merging to `main`.

## Next development phase

After classroom playtesting, the strongest candidates for the next release are:

- Supabase class codes and saved student/group sessions;
- instructor dashboard and class analytics;
- Professor Chaos Mode with instructor-triggered class-wide events;
- Team Owner, Tournament Organizer, Collegiate Program, and Creator roles;
- historical challenge scenarios based on OWL, VCT, Riot, and Valve structures;
- instructor-configurable crisis decks;
- comparative group results / leaderboard focused on resilience and tradeoff quality rather than a single score; and
- exportable submission receipts.

## Status

**Prototype branch:** `spm370-ecosystem-architect-v1`

**Current build:** Playtest v2 (gameplay, presentation, stakeholder-network, and pedagogical-feedback pass)

The next step is browser/device playtesting and scoring-balance review before merging into `main`.