# MGT 340 — Field Audit: site-selection checkpoint

Student page: https://jflevine.github.io/SportManagementSim/mgt340/field-audit-site/

No-save instructor preview: https://jflevine.github.io/SportManagementSim/mgt340/field-audit-site/?preview=1 — exercises the form and generates an unmistakably simulated confirmation without making a database request.

This is an **ungraded planning checkpoint** for the Fall 2026 *Philadelphia Sport Management Field Audit*, not a new assessment. It preserves the assignment/syllabus's separate graded checkpoints.

| Date | Requirement | Submission location |
| --- | --- | --- |
| Sun., Oct. 18 | Confirm an approved site/event and intended observation date | This GitHub Pages form (ungraded) |
| Sun., Nov. 8 | Contemporaneous raw field notes + at least two pieces of original evidence | Canvas (25 field-audit points; 5% of course grade) |
| Sun., Nov. 15, 11:59 p.m. | Final 2–3 page report + evidence appendix | Canvas (75 field-audit points; 15% of course grade) |

## What students submit

1. First name, last name, **@lasalle.edu** email (identity is self-reported, not authenticated).
2. Choose either **propose a site** or **request help identifying a site**.
3. For a site: event category, name, observation date (Sept. 1–Nov. 8), optional start time, venue/location, and one brief sentence about management activity they expect to observe.
4. Acknowledgment of planning/observation expectations. No notes, photographs, venue purchase, or completed analysis is required for this form.

La Salle varsity athletics events are eligible preapproved settings; other proposals are recorded as **pending review** until the instructor approves. This tracks categories in Section 1 of the field-audit assignment. If event timing or other constraints make a site unusual, the instructor should review it individually. For students who already received an individual approval by email, the form provides a course record. An assistance request saves a flag, and students are directed to email the instructor without disclosing personal circumstances on a public platform.

## Architecture and data protection

- GitHub Pages serves only the public HTML/CSS/JavaScript; **no student records are committed to GitHub**.
- The form submits using a browser-safe legacy Supabase anon JWT to the Edge Function `submit-mgt340-field-audit-site`, deployed to project `havsvkhddvdbzbsmhqbr` with **JWT verification enabled**. This key is public and **is not** the service-role key.
- The Edge Function validates student inputs, accepts requests only from `https://jflevine.github.io` as a browser-origin safeguard, and writes with its **private runtime service-role credential** to `public.mgt340_field_audit_sites`.
- Private table: RLS enabled and forced, no browser-role grants or policies. **Neither the anon nor authenticated browser role can read or write student rows directly.**
- A unique normalized email prevents multiple official submissions for the same email. A random attempt UUID enables idempotent retries of exactly the same payload if an acknowledgment is lost; neither a duplicate-email request nor an altered retry reveals another student's record.
- On successful submission, an individualized receipt confirms whether the site is approved, pending review, or assistance is requested. The receipt is not a grade and cannot approve a non-varsity site.
- Uncertain saves retain only a tab-level `sessionStorage` retry copy. Clear on success. No tracking cookies, external assets, or public gradebook.
- The deadline is October 18, 11:59 p.m. **Philadelphia time**; late submissions remain possible for instructor discretion and are marked late in the receipt and query.
- This is **not a University authentication system**. A student could type someone else's name/email. For higher-stakes or verified identity, use an institution-authenticated alternative.

### Known limitations

No Canvas grade sync or automatic faculty/student approval emails. Students with proposed sites requiring review should contact Professor Levine if the event is imminent. The site-category automatic approval depends on self-reported classification; the instructor may reclassify/review questionable submissions. GitHub Pages cannot be the private database by itself.

## Instructor review: private SQL

Authorized review requires connecting to the same Supabase project; **do not embed these queries or results in the student page**.

```sql
-- All submissions, alphabetical (student data: keep private)
select last_name, first_name, email, request_kind, site_name, site_category,
       event_date, event_time, venue_location, observation_focus,
       approval_status, instructor_notes,
       submitted_at at time zone 'America/New_York' as submitted_philadelphia,
       submitted_at > timestamptz '2026-10-18 23:59:59.999-04' as late,
       receipt_id
from public.mgt340_field_audit_sites
order by lower(last_name), lower(first_name);
```

```sql
-- Sites needing action first
select last_name, first_name, email, site_name, event_date,
       approval_status, observation_focus
from public.mgt340_field_audit_sites
where approval_status <> 'approved'
order by event_date nulls first, lower(last_name);
```

```sql
-- Example: approve after reviewing a submission and then email the student.
-- Replace the email and note with the correct values.
update public.mgt340_field_audit_sites
set approval_status = 'approved',
    reviewed_at = now(),
    instructor_notes = 'Reviewed and approved by instructor'
where lower(email) = lower('student@lasalle.edu')
  and approval_status in ('pending_review','needs_revision')
returning first_name,last_name,email,site_name,approval_status;
```

Do not use the example UPDATE with placeholder email unchanged. To mark a site `needs_revision`, update that status and contact the student privately. Students must contact the instructor to change a submitted site; no anonymous edit endpoint is exposed.

### QA checklist before assigning

- Verify the page and both radio branches load on a desktop and mobile device.
- Verify site/date fields are required only on the site-selection branch; assistance branch asks only identity.
- Confirm the form accepts a legitimate La Salle email and rejects others.
- Confirm a real submission returns a **matching saved confirmation ID** before telling a student their submission is recorded.
- Confirm instructor-only queries show records and browser roles cannot read them.
- Test lost-network retry and duplicate-attempt handling with *synthetic/test-only* data; avoid submitting fake student identities into the live class roster.

The repo contains the Edge Function's source under `backend/index.ts` for auditability. Its deployed service role credential is supplied only by Supabase environment variables and must never appear in this public repository.
