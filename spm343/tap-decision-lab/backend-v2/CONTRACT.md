# TAP Decision Lab2 live v2 API

Endpoint: https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm343-tap-lab2-v2

Existing spm343-tap-lab2 pilot endpoint is unchanged. This new endpoint's default mode is live. All replies have no-store cache headers. Allowed browser origin: https://jflevine.github.io. No Supabase client key is needed; private actions implement custom scoped session authorization.

## Student session

Generate attemptId and requestId with crypto.randomUUID(). Generate a 32-byte random token with crypto.getRandomValues, base64url encode without padding (43 characters). Store attempt ID, mode, token and pending exact request locally before the first request. Send token only in x-attempt-token; never place it in a URL. Only its mode/class-scoped SHA-256 digest is stored server-side. This session resumes the single attempt and is not an institutional login. Identity is explicitly self-reported. Losing this browser data loses self-service access; contact the instructor. Do not put the token in telemetry, console or exports.

POST JSON requests:

- start: {action:'start',mode:'live',attemptId,requestId,expectedVersion:0,identity:{firstName,lastName,email,individualWork:true}}
- resume: {action:'resume',mode,attemptId}
- save: {action:'save',mode,attemptId,requestId,expectedVersion,answers:{initialChoice,initialPosition,finalChoice,adjustment,priority,finalReason,runnerUp,tradeoff,guestConsent}}
- lockPlan: {action:'lockPlan',mode,attemptId,requestId,expectedVersion}. Save the initial answer first. The returned initialPlan permanently captures the pre-update choice/position. Only then reveal new information.
- submit: {action:'submit',mode,attemptId,requestId,expectedVersion}. Save final answers first. Display the receipt only after this confirmed durable reply.

Initial/final/runner-up choices: cup, open, showcase. Adjustments: orientation, extra_host, rotations. Priority: newcomers, club, operator. All fields should be included in each save. Empty strings are valid for drafts. guestConsent defaults false and must be boolean. Three response strings are initialPosition, finalReason, tradeoff, each capped at 1800 characters. InitialPosition must have at least 40 characters to lock; all three must have at least 40 characters to submit. Final choices and explanations cannot be saved before locking. Initial fields cannot change after locking. Final proposal must differ from runnerUp. Costs cup280/open180/showcase240 plus75 for extra_host; total must not exceed300. Other adjustments cost0. No automatic grade or fabricated outcome score.

Every successful student mutation/resume returns {ok:true,mode,submission:{attemptId,mode,classRun:'tap-events-2026-10',synthetic,firstName,lastName,email,identityVerified:false,answers,initialPlan:null|{initialChoice,initialPosition,lockedAt},status:'draft'|'plan_locked'|'submitted',version,receipt:null|string,createdAt,submittedAt:null|string,review:null|{scores,total,notes,reviewedAt},finalGrade:null|number,guest:{consent,published,template:'decision',summary}}}.

A missing grade is null, not zero. A real zero review is finalGrade:0. A student's resume exposes only their own review and comments. Submitted answers and receipt never change through instructor review/publication.

Use the returned version. Queue operations one at a time. On uncertain transport or 503, retry the EXACT request body and requestId. Identical idempotency replay returns the original response even after later changes. A changed body reusing the requestId yields REQUEST_CONFLICT. A stale version yields VERSION_CONFLICT; resume, surface the conflict, do not silently overwrite. After receiving an older replay, resume for current state before further edits.

## Instructor

Existing x-instructor-key in memory only; never URL, localStorage, exports or public source. Default mode live. Test rows only when explicitly mode:'test'.

- {action:'instructorList',mode:'live'} returns {ok:true,mode,classRun,submissions:[same private submission shape],maxScore:10}
- {action:'instructorDetail',mode,attemptId} returns standard submission
- {action:'instructorReview',mode,attemptId,requestId,expectedVersion,scores:[2,3,3,2],notes:'...'} uses integer scores within maxima2/3/3/2, notes max4000; server computes total
- {action:'instructorPublish',mode,attemptId,requestId,expectedVersion,template:'decision',published:true|false} explicitly releases/hides a safe structured template. Release requires submitted status AND student opt-in. No freeform publication summary accepted. UI must preview guest.summary and require an explicit release click. The structured template reflects actual final choices and contains no response text

CSV is generated from the authorized list in the instructor browser; neutralize spreadsheet formula prefixes in all free text. Never include tokens. Hold key in memory only.

## Guest

GET ?view=guest returns {ok:true,mode:'live',classRun,aggregate:{started,initialPlans,completedRevisions,initialChoices:{cup,open,showcase},finalChoices:{cup,open,showcase}},proposals:[{label:'Anonymous proposal 1',initialChoice,finalChoice,adjustment,priority,runnerUp}],sharing:'structured-opt-in-instructor-released'}.

The guest RPC reads only a dedicated structured projection table, never the raw answer records or operations. Guest response has no name, email, attemptID, receipt, raw text, grade, notes or timestamp. Counts and proposals exclude mode:test. Initial-choice count uses only locked snapshots; final-choice count only submitted work. Unreleased optional summaries never appear. Poll only while visible.

## Isolated tests

mode:'test' uses separate records table and test-scoped session digest. It accepts exactly {firstName:'Synthetic',lastName:'Fixture',email:'tap-v2@example.invalid',individualWork:true}, rejecting real names/emails. Student actions use the same production handler/state machine/storage RPC. Test receipts start TAP2-TEST. No test record enters live gradebook or guest counts. Test frontend must never transmit real identity. No deletion API exists.

Errors: {ok:false,error:{code,message}}. Codes INVALID_INPUT/BUDGET_EXCEEDED400, UNAUTHORIZED401, ORIGIN_DENIED403, NOT_FOUND404, STATE_CONFLICT/REQUEST_CONFLICT/VERSION_CONFLICT409, BODY_TOO_LARGE413, UNSUPPORTED_MEDIA415, STORAGE_UNAVAILABLE503.
