# AD decision chat backend

Endpoint: `https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/ad-decision-chat`

The isolated function uses the project's existing server-only `OPENAI_API_KEY`. It does not modify the Eagles simulation. It uses the Responses API with `store:false`, a pinned model, and no tools. No names, email addresses, or pod labels are requested by this API. Student messages should not contain personal information.

Send `Content-Type: application/json` and `x-session-token` containing a browser-generated 32-byte random token encoded as 64 lowercase hexadecimal characters. Store that token only in the student's browser; the database stores its SHA-256 hash. CORS permits `https://jflevine.github.io` and HTTP localhost/127.0.0.1 development ports. CORS is not an authentication control; token ownership and server limits are enforced independently.

- `GET` or `POST {"action":"health"}` returns health metadata without a model call.
- `POST {"action":"start"}` creates or resumes the token's anonymous session.
- `POST {"action":"resume","id":"session UUID"}` returns that session.
- `POST {"action":"message","id":"session UUID","requestId":"unique UUID","role":"coach|business|athlete","phase":"initial|revised","planId":"financial|experience|balanced or null","provisionalPlanId":"initial preset or null","adjustment":null,"message":"..."}` sends one turn.

`adjustment` may be `{ "from":"payments", "to":"support" }` for one $25,000 transfer relative to a selected revised preset. Categories: `payments`, `aid`, `support`, `facilities`, `reserve`. No adjustment in initial phase. Optional/empty plan IDs mean undecided. The server derives dollar amounts and ignores any client-supplied budgets or facts.

Success returns `{session}`; message also returns `{reply,requestId}`. `session` contains `id`, `createdAt`, `expiresAt`, `turns`, `maxTurns`, `transcripts`, `lastReply`. Each transcript is `{role,phase,messages:[{role,content,at,...}]}`; user turns also record plan context. Threads are keyed by stakeholder and phase, so changing presets preserves the dialogue. `lastReply` is `{requestId,role,phase,reply}` or null. Duplicate request IDs replay the saved reply without another model call. Errors return `{error}` with an appropriate HTTP status.

Controls: 24-hour sessions; 36 turns/session; 12 turns/stakeholder/phase; 1,200-character user messages; 100-word responses; 2-second attempt spacing; 75-second exclusive processing leases; 100 new sessions/IP bucket/10 minutes; 120 new sessions/day; 1,800 model attempts/day. Anonymous access is deliberately bounded, not proof of enrollment. Expired sessions are removed on subsequent starts after a seven-day cleanup interval. Database tables have RLS enabled and no client grants; RPCs are executable only by `service_role`.

Normal dialogue uses live AI stakeholder responses. Explicit override attempts and obvious fabricated funding or guaranteed outcomes receive a short server-generated boundary correction. This guard reduces known failure modes; it is not a guarantee against every possible misleading model response. These responses are not evidence or professional advice. The fixed fictional evidence and plans are defined in `core.mjs`. If the endpoint fails, label any scripted alternative explicitly as offline rather than presenting it as a live response.

Local validation: `node core.test.mjs`. Deployment files: `index.ts`, `core.mjs`; migration: `schema.sql`. Production uses `verify_jwt:false` because the function implements its own anonymous capability-token authentication.
