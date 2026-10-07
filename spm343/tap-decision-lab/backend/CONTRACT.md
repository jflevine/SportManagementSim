# TAP Decision Lab 2 pilot API (v1.0.0)

Base: `https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm343-tap-lab2`
Production browser origin: `https://jflevine.github.io`.
All responses `Cache-Control: no-store`; all POST bodies JSON. Existing instructor key travels only in `x-instructor-key`, never a URL, disk, localStorage, logs, or public bundle.

## Student walkthrough
The published pilot is browser-local. Label saving “Practice saved on this device”; label its finish “Practice complete — not submitted for a grade.” Do not send typed names, emails, or responses. The server returns 403 `LIVE_DISABLED` for every student action (`start`, `resume`, `save`, `lockPlan`, `submit`) regardless of client flags. There is no configuration flag a client can set to enable them.

GET base (or `?view=status`):
`{ok:true,version:'1.0.0',mode:'pilot',liveEnabled:false,studentStorage:'browser-local',grading:'instructor-only',maxScore:10}`

## Private instructor controls
POST base with existing `x-instructor-key`.

- `{action:'instructorList'}` → `{ok:true,mode:'pilot',liveEnabled:false,submissions:[...],maxScore:10}`. Each private submission has `attemptId`, `firstName`, `lastName`, `email`, `format` (`guided` or `tournament`), `responses` (4 strings), `initialPlan` (`{format,responses:[3 strings],lockedAt}`), `status`, `version`, `receipt`, `submittedAt`, `review` (`null` or `{scores:[2/3/3/2 bounded integers],total,notes,reviewedAt}`), `guest` (`{published,summary}`), `synthetic:true`.
- `{action:'instructorTest',fixture:'guided'}` (or `'tournament'`) → `{ok:true,mode:'pilot',synthetic:true,submission:<private record>}`. Runs fixed server-selected synthetic identity and four responses through start/save/lock/submit. Repeated clicks reuse the same fixture record and receipt, rather than creating new rows. Never sends form values. No email is sent.
- `{action:'instructorReview',attemptId:<from list>,requestId:<fresh UUID>,expectedVersion:<from list>,scores:[2,3,3,2]}` → `{ok:true,mode:'pilot',submission:<private record>}`. Only integer criteria within 2,3,3,2. No AI grade, free-text feedback, or client total. Fixed note records “Synthetic instructor review.” Local feedback previews may remain on device.
- `{action:'instructorPublish',attemptId,requestId,expectedVersion,published:true}` (or false) → same private record envelope. Only the server-selected pre-redacted synthetic summary can publish. Real publication cannot be enabled. The instructor UI should preview `guest.summary`, then explicitly release/hide it. No raw response is ever copied to publication.

Stable fixed fixtures: guided `d1b1c5f0-0000-4000-8000-000000000001`; tournament `d1b1c5f0-0000-4000-8000-000000000002`. They are identifiers of synthetic examples, not secrets.

## Guest view
GET `?view=guest` →
`{ok:true,mode:'pilot',synthetic:true,liveEnabled:false,sharing:'synthetic-only',aggregate:{started:0,initialPlans:0,completedRevisions:0,formats:{guided:0,tournament:0}},proposals:[]}`
Counts reflect only instructor-created fixed synthetic records. `proposals` contains only `{label:'Synthetic proposal A',format:'guided',summary:'...fixed redacted summary...'}` for explicitly released synthetic fixtures. No IDs, identity, email, raw answers, grades, notes, timestamps, or unfinished free text. Instructor release defaults false. Empty guest screen should say no synthetic examples have been released yet, with an optional separately labeled built-in local preview.

## Failures
`{ok:false,error:{code,message}}`: 400 `INVALID_INPUT`, 401 `UNAUTHORIZED`, 403 `LIVE_DISABLED` or `ORIGIN_DENIED`, 404 `NOT_FOUND`, 409 `VERSION_CONFLICT` / `REQUEST_CONFLICT` / `STATE_CONFLICT`, 413 `BODY_TOO_LARGE`, 415 `UNSUPPORTED_MEDIA`, 503 `STORAGE_UNAVAILABLE`.
After an uncertain POST, retry the exact body and requestId; after 409 refresh the instructor list. Never silently overwrite a newer version. Receipt displays only after a confirmed durable write; synthetic receipts start `TAP2-PILOT-` and confer no grade credit.

## Shared real-time pilot demonstration (added before implementation)
Public POST `{action:'pilotProgress',format:'guided'|'tournament',stage:'draft'|'plan_locked'|'submitted'}` sends only these three enum fields. All additional fields are rejected. It updates ONE shared synthetic record; this is not a classroom count and other pilot testers may overwrite it. It cannot store a name, email, response, ID, grade, or any free text. Repeating the same enum state returns the same `updatedAt`.

Response: `{ok:true,mode:'pilot',synthetic:true,demo:{label:'Shared synthetic pilot',format,stage,summary:<fixed server synthetic summary>,updatedAt:<server time>}}`.

Guest response now additionally has `demo:null` initially or that same demo projection. The summary is fixed hypothetical sample copy, NOT a paraphrase of browser-local typed work. Aggregate includes this one shared demo plus up to two instructor fixtures. `initialPlans` means stage at least locked; `completedRevisions` means submitted. Label every count synthetic. Poll guest every 10 seconds while visible and allow manual refresh. Debounce the public progress update; do not auto-send typed fields.
