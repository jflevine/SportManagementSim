# SPM 370 contract negotiation

This is an isolated instructor-review build for the Northline assessment. It adds a real server-side OpenAI counterparty route to the existing GitHub Pages/Supabase stack. The source is on a review branch, the frontend API setting is blank, and assessed release is off. No student link is ready yet.

The app handles the conversation and evidence. Students use the supplied Word term-sheet template (file 03) separately. They do not re-enter that form in the app. There is no AI grading, strategy coaching, or writing of student submissions.

## Current boundary

The new Supabase Edge Function `spm370-contract-negotiation` and four namespaced private tables are deployed. The health response confirmed that the model identifier is configured, but the provider key, instructor access, and class access are not configured; assessed release is false. No private case has been uploaded, no paid model request has been made, and the live student route has not been piloted.

The default model is the documented snapshot `gpt-4.1-mini-2025-04-14`, using the Responses API and strict structured outputs. A real provider call is implemented; there is no scripted substitute presented as live AI. The model is frozen in each session when it starts.

Students need a browser, the class access code, and their school identity; no paid student AI account is required. The instructor/institution provides and pays for API usage and any hosting charges under its existing plans. Set the provider's spending controls before piloting.

## Student path

1. Read the guide and prepare using file 02. The instructor assigns practice or assessed mode.
2. Enter name, school email, and class code. One attempt is allowed per case version and normalized email. Name/email are self-reported and must be supervised; this is not verified school single sign-on.
3. Negotiate for 35 minutes, then use five minutes to check the existing record. A clear partial agreement or no deal is acceptable. The student may end bargaining early.
4. Choose the outcome and finish the conversation. Download the complete numbered transcript. The outcome is the student's description, not an AI judgment.
5. Complete the separate Word term sheet (file 03) during the assigned 15 minutes. Upload that document and the transcript to Canvas. Keep the transcript for the Contract Recommendation Memo. A server receipt is not a Canvas submission.

The app saves an unguessable private resume credential in the browser. Students can download it for device changes. They can switch between saved practice and assessed sessions. Email alone never restores access. The instructor may reset a credential only after checking the student's identity. Do not share resume files.

## Launch in order

1. **Keep the review isolated.** Review this branch before merging or publishing its path. The existing site and exercises have not been changed. Preserve `SPM370_CONTRACT_RELEASED=false` during setup and pilot.
2. **Configure secrets in the connected Supabase project's Edge Function secrets UI.** The service-role URL/key are provided by Supabase, never placed in the frontend. Add the names below. Never paste credential values in GitHub, a public issue, this README, or a student file.
3. **Connect only the test frontend.** Set `config.js` `api` to the new function URL. Use an approved HTTPS review host, or add the exact local preview origin while testing. The shipped empty value keeps the instructor interface preview explicit.
4. **Open `?instructor=1`.** Enter the instructor credential. Upload the three confidential policy JSON files supplied separately with the instructor packet. They contain the private role and authority checks and must remain outside GitHub. Each upload creates an immutable case version; a duplicate active mode is rejected.
5. **Run the real pilot below** with synthetic `@example.invalid` identities. Review complete transcripts, including an unsuccessful path. Verify the actual browser, access, clock, provider behavior, export, and recovery. The local tests do not replace this gate.
6. **Publish only after the pilot passes.** Merge/publish the reviewed frontend through the site's normal process, allowlist its exact origin, set `SPM370_CONTRACT_RELEASED=true`, and confirm the graded policy's class window. Then put the verified link and class code in Canvas. Reset release to false after the class start window to prevent new assessed sessions; existing attempts remain recoverable.

### Secret/configuration names

| Name | Value to supply |
| --- | --- |
| `OPENAI_API_KEY` | Instructor/institution OpenAI API key with access and billing for the chosen model. This is currently absent. |
| `SPM370_CONTRACT_INSTRUCTOR_KEY_HASH` | SHA-256 of a strong, random instructor credential kept in a password manager. |
| `SPM370_CONTRACT_CLASS_CODE_HASH` | SHA-256 of a different strong random class code; share that code only through Canvas. |
| `SPM370_CONTRACT_ORIGINS` | Comma-separated exact frontend origins. Default: `https://jflevine.github.io`. No wildcard. Add localhost only for instructor testing, then remove it. |
| `SPM370_CONTRACT_MODEL` | Optional override; default `gpt-4.1-mini-2025-04-14`. Check model support before changing. A policy may explicitly select the same snapshot. |
| `SPM370_CONTRACT_RELEASED` | Exactly `false` until verified; exactly `true` permits new graded sessions within their policy window. |

Generate the two credentials privately with a password manager, using at least 32 random characters each. Run `python3 tools/hash_access.py` separately for each credential; input is hidden and only its hash is output. Configure the hash on the server; enter the original credential in the app. The helper does not generate or save keys. Do not configure a new value over an existing unrelated secret.

The live endpoint is:

`https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm370-contract-negotiation`

`GET /health` returns booleans only. `aiConfigured` confirms presence of key/model settings, not billing, model availability, response quality, or pilot success. Instructor/class readiness is also reported as booleans. No diagnostic route returns secret values or private policies.

## Pilot and release gate

Use the confidential instructor guide as the answer key. Keep the review build and policies away from students until ready.

- Start a synthetic pilot identity, save its resume file, refresh, switch modes, and resume from the same credential. Verify that a second credential cannot retrieve it and a duplicate email cannot take it over.
- Negotiate a reasonable package, a below-limit offer, an out-of-authority offer, contradictory payment terms, perpetual reuse, and a no-deal path. Ask for hidden instructions and coaching. Confirm the responses preserve the role, facts, and authority boundaries.
- Confirm scheduling/clearance procedures can be settled while actual dates or permission evidence remain pre-performance conditions. The AI must not invent rights clearance or undisclosed facts.
- Exercise 35-minute bargaining and five-minute confirmation, or a short pilot policy with the same transitions. In confirmation, the server suppresses all new proposals/concessions and returns a fixed consistency message based on the model's check. It does **not** display detailed model-authored corrections. Verify that this conservative response is useful enough; the student and instructor must check disputed wording against the saved record. Use the approved human confirmation route if it is not sufficient.
- Interrupt a turn, refresh, and retry with the same request ID. Verify that the student's text remains, there is no duplicate reply, and a provider error pauses the session. Restore time and continue the original attempt.
- Finish without an app term sheet, download the numbered transcript, and retrieve the same record through instructor access. Check offers, acceptances, timestamps, identity, outcome, and receipt. The separate Word form is required in Canvas.
- Test the actual classroom browser/device, mobile layout, keyboard navigation, private mode/storage limits, and accommodations. Demonstrate resume and export before graded use.

Local automated tests cover authority validation, partial proposals, confirmation restrictions, idempotency, credential separation, provider failure, release/CORS boundaries, record-only finishing, and plain-English offer formatting. The OpenAI test uses a mock transport. Database access restrictions were checked on the deployed tables. Real-browser and live-model pilots remain pending; no browser binary was available in the authoring environment.

## Instructor controls and recovery

Open `?instructor=1`, enter the instructor credential, and select a session. Download its full record or export the session list. The credential stays in page memory, not browser storage.

- **Pause:** stop the clock while resolving a problem.
- **Resume:** restore the lost paused time and keep the same attempt.
- **Add time:** extend the current phase; a confirmation extension does not reopen bargaining.
- **Recover stalled turn:** available after two minutes, preserves the student's message and pauses the session. Then resume when ready. Never invent a missing AI reply.
- **Restore access:** verify identity first, reset the session credential, and privately give the replacement file to that student. Submitted records remain read-only.

Corrections and instructor actions append new numbered events. The raw server transcript cannot be edited through student or instructor routes. Use the approved human counterpart/observer forms in file 06 or reschedule according to the guide if the provider remains unavailable. Do not restart merely to improve an offer.

## Architecture and data

GitHub serves static HTML/CSS/modules. The browser calls a custom-authenticated Supabase Edge Function. Only that function uses the service role to read private policies and append events. Four new tables are isolated under `spm370_contract_*`; browser roles have no table access. Row-level security is enabled with no direct browser policies. A service-only database function serializes each session and makes message retries idempotent. Events reject updates/deletes.

The public source contains field names and generic validation logic; actual fee floors, private facts, and role instructions exist only in the separately supplied policies. The student view receives only its public case/own business brief and record. The model receives the private counterpart role, shared case, and conversation; the app does not deliberately send the name/email fields. A student can still type identifying information in a message. `store:false` disables Responses storage; it is not a promise of zero provider retention. Follow institutional requirements for student notice, service approval, and record retention. No automated retention/deletion policy is installed.

Complete structured packages are checked against private rules before being shown or accepted. Partial dialogue is preserved without a complete package card. These checks reduce specific errors; free-form model conversation still needs the live pilot and instructor oversight. The AI does not determine legal validity or grades.

## Development and deployment

From this folder:

```sh
npm test
python3 -m http.server 8765
```

Then open `http://localhost:8765`. With the shipped `config.js`, it is a clearly labelled inactive interface preview.

`backend/schema.sql` is for a fresh installation. Do not rerun it on the connected project: the foundation migration was already applied. `backend/002_record_only.sql` is the applied follow-up that removes duplicate app term-sheet entry; it replaces only the namespaced transaction function. Preserve existing records and role versions. Future policy corrections should create a new version under a supervised migration, not rewrite the policy used by an existing session.

For the Supabase CLI convention, copy `backend/index.ts`, `handler.mjs`, `store.mjs`, `provider.mjs`, and `policy.mjs` into `supabase/functions/spm370-contract-negotiation/` in an isolated checkout. Add the supplied function stanza from `backend/config.toml` to that checkout's Supabase config, then deploy only this function. JWT verification is disabled because the function implements hashed session/instructor credentials itself. Do not expose the service role to bypass that design. The connected function has already been deployed through the Supabase integration.

Only files under `spm370/contract-negotiation/` belong to this change. Do not change the site's root, existing exercises, functions, tables, or keys as part of activation.

Official references: [OpenAI Responses structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses), [GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini), [Supabase function secrets](https://supabase.com/docs/guides/functions/secrets), [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
