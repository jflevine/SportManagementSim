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

## Version 1 scope

The first prototype includes:

1. Publisher / ecosystem-designer role
2. Competition-level selection
3. Closed / Open / Hybrid architecture selection
4. Seven-stream revenue allocator totaling 100 points
5. Live revenue-stability and publisher-dependency feedback
6. Five-slot contract-card builder
7. Six-axis legal-risk board
8. Ten crisis cards, with three randomized per playthrough
9. Five live ecosystem metrics:
   - Financial Sustainability
   - Competitive Access
   - Publisher Control
   - Legal Resilience
   - Fan Legitimacy
10. Final Ecosystem DNA / Board Report
11. Three reflection prompts
12. Local browser saving, reset/replay, copy report, and print/PDF support
13. Responsive mobile layout

## Crisis library

The initial crisis bank includes:

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

## Pedagogical design principle

The application intentionally avoids a single "correct" ecosystem. Each architecture produces tradeoffs among access, control, revenue stability, legal resilience, and legitimacy. Scores are teaching prompts rather than legal conclusions.

## Technical design

Version 1 is intentionally dependency-free: one HTML file with inline CSS, JavaScript, and SVG. This makes it easy to host through the existing `SportManagementSim` GitHub Pages workflow and reduces technical friction for students.

Student state is stored in `localStorage`; no login or database is required for Version 1.

## Future versions

Potential Version 2 additions:

- instructor dashboard;
- class codes and Supabase persistence;
- Professor Chaos Mode with instructor-triggered class-wide events;
- comparative class analytics;
- Team Owner, Tournament Organizer, Collegiate Program, and Creator roles;
- historical challenge scenarios based on OWL, VCT, Riot, and Valve structures;
- classroom leaderboard focused on resilience and tradeoff quality rather than a single score;
- exportable submission receipts; and
- instructor-configurable crisis decks.

## Status

**Prototype branch:** `spm370-ecosystem-architect-v1`

The next step is visual and classroom playtesting before merging into `main`.