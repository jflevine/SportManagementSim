# Signal Leak

A 20–25 minute SPM 370 incident exercise. Each student directs the response team at a fictional volunteer-run college tournament. No esports knowledge, login or outside research is needed.

## Launch this revision

Distribute the classroom file **Signal-Leak.html**. Students download it, open it in a current desktop browser, choose a fictional alias and select **Start incident**. A file preview may show the page without running JavaScript. Open the actual file in the browser. The public Pages link follows main and may show a different revision.

From a checkout of this branch, build the portable file with Node:

```sh
node spm370/signal-leak/make-portable.mjs Signal-Leak.html
```

Alternatively run `python3 -m http.server 8000 --bind 127.0.0.1` from the checkout and open `http://localhost:8000/spm370/signal-leak/` on that computer. Both entry points use the same case, engine and export code.

## Run the room

- **Minutes 0–3.** A clip in the tournament Discord shows Ari’s home address. Tell students that the player, captain and producer are waiting on the director. The address is withheld. Invite them to consult the authority map or ask Ari a private question before choosing an instruction.
- **Minutes 3–13.** Let the directors act. A neutral break screen takes players off camera but creates a need for a schedule update. A feed with chat disabled preserves coverage but leaves players visible. Both block new chat on the feed. Neither removes a saved clip. The clip crosses platforms, and a separate residence report warrants assessment. Its connection to the posts remains unknown. A prior referral changes what safety staff can do with the report. Students revisit play after the last update.
- **Minutes 13–25.** Students write about 200–300 words in three paragraphs and save one **incident handoff and chronological decision log**. Ask them to open the TXT. The final paragraph rehearses one Portfolio judgment: who controls the risk, what prevention is feasible, what to record, and when to review. How does the other stakeholder depend on that action? The event protocol supplies authority inside this fiction. Students may name a legal basis they would need to verify.
- **Debrief.** Ask two students who made different feed choices what they would hand the next director. Ask what evidence would justify changing the match decision. Assess their reasons, the owner and the remaining uncertainty.
- **No devices.** Read the opening and role map aloud. Students log time, instruction, owner and reason on paper. Reveal the external reposts, then the unverified visitor report, one at a time. Ask for a match decision after the second update. Use the same three paragraphs and decision log on one sheet. An equivalent alternative topic is available through the instructor.

## Recovery and privacy

New runs use session storage, including drafts of the handoff, a question and the current instruction. Refresh in the same tab. Closing the tab can lose work; duplicating or restoring a tab may reproduce its contents. When storage fails the page warns the student to keep a separate copy. An active run from the merged release can be moved into this tab on request when using the same origin. The original tab credential and only that run’s old record/draft are removed after the copy succeeds. Unrelated practice records are left alone.

After saving the file elsewhere, choose **Erase this run from this tab** on a shared device. Cancel keeps working. Confirm removes this run, its draft and the tab credential. Downloads are separate: remove any copy left in the shared Downloads folder. The instructor page points to the tab’s own workspace. There is no cross-device review, backend collection, identity verification, grade, or submission workflow. The backend remains closed.

## Browser checks

From the repository root, with Playwright and Chromium installed, run `node spm370/signal-leak/browser-qa.cjs`. It plays two fictional paths, including the downloaded HTML opened directly as a file, checks refresh and parsed reports, and verifies the shared-device cleanup. Local artifacts are written to `signal-qa-results/`.
