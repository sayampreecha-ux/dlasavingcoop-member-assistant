# AI ผู้ช่วยสมาชิก สอ.อปท. — Four gate closure 8 Oct 2026

| Gate | Evidence completed | Acceptance status |
|---|---|---|
| 1. Mass Regression 3,378 | Strict script `scripts/run-mass-gate-3378.mjs` exists; checks standalone 1,832 / personal-live 1,546, explicit labels, outcomes, SHA-256 | **NOT VERIFIED**: original curated labelled 3,378 corpus not available in repository |
| 2. Direct answer quality | Existing CI suites + `tests/four-gates-evidence-regression.mjs` adds boundaries, privacy routing and sources | **AUTOMATED TESTS**, human language acceptance outstanding |
| 3. Evidence and links | Rules from original 2569 PDFs; `docs/ordinary-2569-infographic-audit.md`; rate gap at 15,000 preserved | **PARTIAL**: 15,000 ambiguity, maximum shares conflict, delegated approver, form process; outside-account PDF access unknown |
| 4. 30 tester pilot | 30-testers/150-question worksheet supplied separately | **NOT VERIFIED**: actual independent responses, device/link observations and human signoff absent |

## Decision
Do not describe the entire project as `3378/3378 PASS`, `30/30 participants PASS`, or `100% ready` without genuine evidence.
The production app remains in its existing GitHub Pages URL. No personal or raw LINE member data is to be committed publicly.
All additional failures must become reproducible tests; no disabling/removing existing tests or hard-coding to pass.

## Handover: testers
Each of 30 participants receives 5 varied questions and a follow-up. Use multiple devices and direct PDF links. Record result PASS/PARTIAL/FAIL, exact expected-vs-actual with anonymized wording, link accessibility and device. Assign one reviewer to sign off only after critical issues close.

## Handover: source owner
Request a written authoritative interpretation for exactly 15,000 baht salary band; confirm current cap rule and units; resolution of who approves change of contribution; submission procedure and effective date; verify Google Drive original PDFs accessible outside the document owner's account. Until resolved, evidence lock remains.

## Verification commands
`node scripts/verify-release.mjs`
`node scripts/run-mass-gate-3378.mjs /secure/local/labelled-anonymized-3378.jsonl`

## Deployment
Do not sync `gh-pages` merely to deploy QA reports or new tests. Production code changes require CI green, backup branch, `main` merge, then `gh-pages` sync and matching hash.
