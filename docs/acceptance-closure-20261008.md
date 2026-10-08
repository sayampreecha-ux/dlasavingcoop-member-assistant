# Acceptance closure — AI ผู้ช่วยสมาชิก สอ.อปท. (2569-10-08)

> Evidence-based checklist. No release should be labelled 3,378/3,378 PASS unless the original anonymized 3,378 labelled records have actually been evaluated and their outcomes recorded. Never expose raw member data publicly.

## Gate 1 — Mass regression
Target: original corpus approx. 4,030, main gate 3,378 (standalone 1,832; personal/live 1,546).
Current automated release gate checks the repo's synthetic and fixed-record suites, **not** every one of the original 3,378. Mass gate remains **NOT VERIFIED** until the source rows with expected outcomes are recovered and run.
Required evidence: exact input dataset version/hash, validated count of the two partitions, anonymization report, PASS/PARTIAL/FAIL with ID-only discrepancy output, no edits to test expectations for green status.
For personal/live: pass only if verified routing/identity/privacy controls are observed; the engine must not hallucinate private balances or claim an approval.

## Gate 2 — Answer quality
Check intent routing, direct substantive answer (not only menu/index), colloquial/misspelled input, contextual follow-up, explanations and steps, official source provenance, evidence locks, private data handoff, latency on phone.
Current check: `tests/share-member-acceptance.mjs` plus `scripts/verify-release.mjs`. No unsupported default monetary amounts.
Never remove or water down existing tests to get a pass.

## Gate 3 — Source verification
2026 source snapshots: `data/share-rules-2569.review.json` (REVIEW_ONLY) and official registry. Check currentness, original direct PDF, effective date, approval authority, conflicting rules and source link accessibility for members outside the owner's Google account.
Open verification items:
- exact income 15,000 baht excluded by published rate bands;
- share maximum rule in units of shares versus the 50,000 baht in form;
- approval delegation instrument;
- submission channel, processing time, effective month.
Stop answering rather than infer these facts.

## Gate 4 — Human pilot (30 participants)
Human pilot is not replaceable by an automated test. Invite the 30 testers to use production from separate iPhone/iPad/Android/desktop sessions.
Assign groups of six: shares; loan; welfare; funeral/benefits; forms/news/private questions. Each person asks at least five genuine questions plus a follow-up, taps the direct source/form and records: question (redacted), expected, actual, result PASS/PARTIAL/FAIL, source URL works Y/N, usability, device, date, evidence. Never collect identity/card/member number/OTP.
Release acceptance requires observed results, all blocker defects remediated, and a named human sign-off.

## Operational acceptance
- `main` is the only development source; `gh-pages` is a deployed mirror;
- preserve versioned production backup before sync;
- all required GitHub Actions jobs green;
- verify `index.html` blob SHA matches `main` and `gh-pages`;
- verify real public production URL through independent browser/device;
- record commit, test run IDs and sign-off.

**Status is deliberately NOT FULLY ACCEPTED until Mass Gate and human pilot are evidenced.** 
