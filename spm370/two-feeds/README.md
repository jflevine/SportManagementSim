# Two Feeds — SPM 370 (Esports, Video Games, and the Law)

Pods advise a tournament organizer's CEO after two partners each claim the right to
broadcast Saturday's Grand Final. About 20 minutes of play. Design reasoning and assumptions
are in `DESIGN_NOTE.md`; what transferred from the method and what did not is in
`TRANSFER_ASSESSMENT.md`.

## Run it locally

```
node simkit/dev-server.mjs
```

- Student: http://localhost:8787/spm370/two-feeds/?dev
- Instructor: http://localhost:8787/spm370/two-feeds/instructor.html?dev (key: `dev`)
- Offline, no server: open either page without `?dev`. Prepared voices, browser storage only.
- `?live` points at the deployed function. **Do not use it yet:** the function is pinned to a
  commit that does not contain this simulation. See `simkit/supabase/README.md`.

## Sample teams (fictional; they seed the offline instructor room)

| Team | What they do | Where it ends |
|---|---|---|
| Anchor | Read both agreements; enforce exclusivity; ask no one | Parallax ends its sponsorship: down $30,000 |
| Beacon | Ask Mateo what he plans; find Lumen 2.3; advise notice, Spanish only, CEO signs | Both partners kept; nothing lost |
| Current | Reassure Mateo first; advise both as signed | English pre-show airs; Lumen cuts $48,000 |
| Drift | Reassure Grace; learn the cast is Spanish; advise coexistence without notice | Lumen cuts $48,000 and quotes the reassurance back |

## Checks

- `node --test simkit/checks/*.test.mjs` — 56 pass (8 generic for this casefile, 8 of its own in `two-feeds.test.mjs`).
- `python3 simkit/checks/two_feeds_browser_check.py` — real Chrome through the dev server.

## Verified, and not

Verified locally: both paths and an off-sequence action in a browser; refresh; a retried
request applied once; submission confirmation and refusal of empty advice; a second device
joining by team code on a phone-sized screen and its action reaching the first device; the
instructor room from a separate browser session, wrong key refused; the offline entry point.

Not verified: AI voices and AI recognition of what students write (production untouched);
the deployed function and database; real phones; a classroom.
