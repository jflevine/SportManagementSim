# MGT 340 Knowledge Check 3

Legal and Ethical Issues in Sport. Ten scenario-based, single-best-answer questions; 10 points (5 legal + 5 ethics); suggested 12–15 minutes, with no timer or speed-based scoring.

Student page: https://jflevine.github.io/SportManagementSim/mgt340/knowledge-check-3/

Instructor preview: https://jflevine.github.io/SportManagementSim/mgt340/knowledge-check-3/?pilot=1

Preview collects no identity, sends no answers, and issues no grade. The answer key and explanatory rationales are held in the private scoring function and separate instructor guide, not in these public files. After a successful official submission, the student receives their score, item explanations, and a downloadable receipt.

## Course alignment

Aligned with the supplied MGT 340 legal and ethics slide decks, Chapters 5–6, and the syllabus CLO 4: analyze sport-management decisions using legal/risk-management principles, ethical frameworks, stakeholder perspectives, and reasoned judgment.

| Item | Focus | Slide alignment |
| --- | --- | --- |
| 1 | D.I.M. risk management | Legal 7–9 |
| 2 | Causation within negligence | Legal 20–23 |
| 3 | Agency and fiduciary loyalty | Legal 25–27 |
| 4 | Waivers and hazard control | Legal 7–9, 28–29 |
| 5 | Private-association review and injunctive relief | Legal 15–18, 31–32 |
| 6 | Legal compliance and ethical responsibilities | Ethics 4–6, 16–18 |
| 7 | Moral intention in Rest’s model | Ethics 7 |
| 8 | Evaluation in Malloy’s model | Ethics 8–9 |
| 9 | Usable and fairly enforced conduct rules | Ethics 11, 13–14, 26–29 |
| 10 | Stakeholder burdens and character-based criteria | Ethics 4, 11, 31 |

This short check samples core concepts. It does not purport to test every legal field or all ethical theories. Hypothetical scenarios avoid grading recall of changing news claims. Items 6 and 10 assess the quality of ethical analysis rather than requiring a predetermined sponsorship or fee policy.

## Submission behavior

- First and last name plus a La Salle email are required. Identity is self-reported; there is no university sign-in.
- One accepted attempt per normalized email and assessment version. This is not a proctored examination or identity-verification system.
- Students may revise answers and identity before submission. No feedback is revealed before a successful save.
- Server computes all scores from submitted answers. Client scores are ignored.
- Answers are retained in sessionStorage for refresh recovery. A pending attempt is locked; retries use the exact same attempt ID and answers.
- A saved receipt confirms the official record. A local download without a confirmed receipt is a backup only.
- Clearing the browser copy does not delete the private record. Students on shared devices should download their receipt and clear the browser copy or close the tab.
- No student records, answer key, or server credentials are committed here. The client API key is public and cannot read the submissions table.

## Instructor administration

State resource rules before starting. Allow roughly 15 minutes and any required accommodations. Use the preview URL for demonstrations. Enter grades as points out of 10 in Canvas; there is no Canvas upload or automatic Canvas sync.

Private Supabase project: `havsvkhddvdbzbsmhqbr`
Function: `submit-mgt340-kc3` (JWT verification enabled)
Table: `public.mgt340_kc3_submissions`
Assessment version: `mgt340-kc3-v1`

Authorized instructor result query:

```sql
select last_name, first_name, email, score, legal_score, ethics_score,
       submitted_at, receipt->'receipt'->>'receiptId' as receipt_id
from public.mgt340_kc3_submissions
where assessment_version = 'mgt340-kc3-v1'
order by lower(last_name), lower(first_name);
```

The table has RLS enabled and forced, with no browser-role grants or policies. Only the server role can insert/read, and responses are restricted to the submitting attempt. An advisory about RLS with no policies is intentional for this server-only table.

For content changes after students have submitted, preserve the existing assessment/rubric version and use a new version for a substantively different check. The complete private function source is available through authorized Supabase management access.
