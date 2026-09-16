// TEMPORARY SAFETY HOTFIX — 2026-09-16
// The Phase 2 environment renderer is intentionally disabled while its canvas
// rendering path is optimized. The core game, Phase 1 human characters, HUD,
// audio, quests, saves, and progression continue to run normally.
//
// Keeping this file as a harmless module avoids a failed dynamic import from
// audio.js while immediately removing the heavy renderer from the live build.
export {};
