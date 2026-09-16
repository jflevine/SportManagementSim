# Phase 2 — Environmental Art Pass

This pass turns each unlocked district into a recognizable place rather than a generic architectural box.

## District-specific scenes
- Grassroots Arcade: cabinets, tournament banner, PCs, seating.
- Scholastic Lab: classroom esports stations, learning display, lab identity.
- Creator Studio: streaming desk, camera rig, monitors, creator-growth signage.
- Campus Arena: competition stations, trophy, campus-program banner.
- Sponsorship Row: activation displays and audience/objective/activation messaging.
- Publisher Tower: server racks, rights/data displays, scanning access aesthetic.
- Pro District: training stations, team-performance environment, trophy and runway messaging.
- Global Event Center: stage truss, championship screen, audience, broadcast camera.
- Ecosystem Boardroom: strategy table, market/risk displays, premium strategic environment.

## Rendering approach
The new `worldart.js` renderer is presentation-only and is loaded after the existing game/visual layers. It does not alter quest state, scoring, saves, Supabase, or instructional content.

The renderer uses lightweight Canvas 2D primitives and animation rather than large external art assets, keeping the GitHub Pages deployment fast and self-contained.
