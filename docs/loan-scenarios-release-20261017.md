# Member loan scenarios — 17 October 2026

Baseline: `43961ee8e2473f3187ba1aa9ea4b7dd889d48beb` (PR #142 assessment menu retained).

## Observed defect

Cloud Browser reproduced the exact question `กู้พัฒนาคุณภาพแล้วส่งมา1งวดสามารถกู้ฉุกเฉินได้เลยไหม`: Production returned a generic emergency-loan menu and asked which subject the member wanted. The canonical rules already contain the three-installment condition. Missing shorthand normalization and contract direction caused the answer failure.

## Evidence

The official emergency-loan index still links the 2569 primary criteria:
https://www.dlasavingcoop.com/show.php?No=773
https://drive.google.com/file/d/1XZYfuXWgzqWp6K_Ld0aosuO58pxKXU5p/view

Read all three primary pages. Clause 5(4), page 2: other loan contracts require at least three paid installments. Clause 4(5), page 1: restructured ordinary contracts require at least twelve. Effective 1 October 2026. Downloaded primary and repository evidence have identical SHA-256 `15b72b5357333ef95e9a5f259f7b5effefb40b8369ccfe374346bfe202f72a08`.

## Change

Normalize quality-of-life shorthand, emergency shorthand and Thai numerals. Resolve existing contracts separately from the requested loan, in either sentence order. Read thresholds, effective dates and sources from the existing Rule Master. Evaluate all named existing contracts, distinguish arrears from payments, ask for one missing installment fact, and replace corrected facts rather than append stale numbers. Check the target evidence gate as well as the original query. Keep unsupported contract-pair decisions locked; preserve existing dedicated refinancing, debt-product, repeat-loan and historical routes. Limit loan action buttons through the existing expandable document layout. No new form, menu, transaction or calculator.

Expected exact answer: not yet eligible under the installment condition; paid one, minimum three, two more required; clause 5(4), page 2; other eligibility and actual approval remain separate.

## Validation

Local `node scripts/verify-release.mjs`: 57 suites PASS, none skipped, including 303 additional scenario checks. Existing assertions retained. Coverage includes 0/1/2/3/4 payments, twelve-payment restructuring boundaries, reversed sentence order, eleven existing loan labels and all 132 directional pairs among twelve labels, multiple contracts, correction, missing facts, pending primary bytes, unknown pairs and unchanged services.

Cloud Browser baseline: FAIL, exact user wording reproduced.
New browser script: 32 UI cases, mobile 390px and desktop 1365px; wired into PR E2E and Pages before/after deployment. CI/runtime/Production results must be read from their actual completed runs before release signoff. Local browser launch unavailable because the installed Playwright browser executable is missing; no local browser PASS claimed.

## Boundaries

A passed installment check is not a full eligibility result, approval or immediate disbursement. Unverified concurrent-contract pairs remain evidence-locked. Live contract balances and outcomes remain in the official member system. Future or historical criteria still use the existing dated evidence gate. No rule values changed in this patch.
