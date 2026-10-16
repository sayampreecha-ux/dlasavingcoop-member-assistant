# Debt-specific loan release, 16 October 2026

Scope: only ordinary debt restructuring and ordinary guarantor-debt assistance, their routing, menu/context, evidence gates and tests. Preserve all other products, PR #137 share-backed loan work, and current-events feed.

## Baseline and reproduced defects

Fresh Main: `0d279a87df3680b5e777b75adc7d8154fa51d868` (includes current-event update after PR #137). No open PR exclusively fixes these two products; one new scoped PR.

The four supplied screenshots were inspected. They show the evidence lock and generic guarantor-center response on release 4.10.0. Baseline VM independently reproduced `กู้ปรับโครงสร้างหนี้` → generic debt-help/type clarification and `เงินกู้ในฐานะผู้ค้ำประกัน` → generic guarantor-center/type clarification. These are OLD results, not new acceptance evidence.

## Primary evidence reviewed

Official publication index re-read: https://www.dlasavingcoop.com/show.php?No=774 . Financial values come from signed criteria, not infographics or legacy forms.

| Document | Reviewed pages | SHA-256 |
|---|---|---|
| [Restructuring criteria](https://drive.google.com/file/d/1M2ofeoulfojGqyi254wOWE-F-5wpSSNm/view) | All 4 | `3d80be1dff1129ab6c27f907c2a7a95d7e4b874a16b6c5f5474b948b5b018f41` |
| [Guarantor debt criteria](https://drive.google.com/file/d/1q61Ub_I6AafeRXs0t65_3oVyh28N5r0K/view) | All 4 | `7c8e57e3534282dfae302277ff54adb65dcfd3e933552bb8bded2ce4c49228d8` |
| [Restructuring legacy form](https://drive.google.com/file/d/1cxhpuEP_Tfa4dNp0kwVPOSrr5KoAV-dY/view) | Checklist p.1 of 19 only | `be97469743ec29f4e9eeee1b015cc045d55f0e036794c571e25428bf512023a6` |
| [Guarantor debt legacy form](https://drive.google.com/file/d/1ZjfxQntcenz5DfpWSd4owcM6zOwEHfW8/view) | Checklist p.1 of 20 only | `12a351bca0142f611b6e2ea666277bd255fd627b51fb44abc627a9f8eeb6aa6b` |
| [Interest announcement](https://drive.google.com/file/d/1ow2w4RsRBE-Kd2n6uX3_kWSLUFoJVQMw/view) | Exact product rows p.1, signed/effective dates p.2 already reviewed in preceding release; current official link rechecked | `6ad92e49fbd4e5a52a5cf09f495e239b95736f9d9cb727e5b5633b27ebca027a` |

Both criteria signed 11 September 2569, effective 1 October 2569 (§2 p.1; signature p.4). Registered as separate reviewed versions with exact hash, source, date and clause/page evidence. Form lists are explicitly legacy preparation lists and require current applicability confirmation. They never override 2569 financial rules.

| Rule | Restructuring | Guarantor debt assistance |
|---|---|---|
| Eligibility §4 pp.1–2 | Debt exceeds ordinary monthly repayment capacity; ordinary loan paid ≥6 installments; second and subsequent restructuring paid ≥12 installments since prior contract; no serious disciplinary/asset receivership proceeding | Membership ≥6 continuous months; monthly shares ≥6 continuous installments; replacing debt of borrower deceased, dismissed from government/permanent employment, under absolute receivership or final bankruptcy judgment and unable to repay |
| Income §4 | Both ≥15% AND ≥6,000 baht throughout term after specified deductions; revolving credit / credit-card / cash-card exclusions exactly scoped in source | Same income tests and exclusions |
| Other eligibility §4 | Payroll deduction or individually agreed method; named funeral association | Same |
| Amount §5(1) p.2 | At most combined outstanding principal, interest, litigation expenses and life insurance amount specified in the source; no substitution of general ordinary cap | Amount actually owed as guarantor; combined with other ordinary loan contracts ≤2,000,000 baht |
| Term §5 p.2 | ≤240 installments, within age75 | Same |
| Insurance §5 p.2 | Required; beneficiary/cooperative and annual-premium process; full real-estate collateral annual-payment alternative; cancellation/surrender governed by source, no invented premium/refund amount | Same |
| Collateral §6 pp.2–3 | Persons, unencumbered real estate, specified government securities, cooperative deposits; personal tiers 1/2/3; >2m also ≥3; real estate ≤90% appraisal | Same types; personal tiers 1/2/3; real-estate appraisal or last official auction value per §6(2) |
| Guarantors §6 | Not spouse; shares paid ≥6months; ≤3 concurrent borrowers; civil servant probation passed; cooperative staff appointed ≥3years; replacement within180days in specified cases | Same |
| Interest §7 / separate rate notice | Notice §2.6(4):7.50% with patronage refund, effective11Nov2567, subject to actual contract/current notice | Notice §2.6(2):2.00% without patronage refund, same effective date limitation |
| Submission/certification §8 p.3 | In person, post to ordinary-loan office, cooperative mobile/web application or designated channel; all documents certified; false documents have source-stated consequences | Same |
| Supersession §3 p.1 | Replaces17Jul2567 and17Nov2568 | Replaces1Nov2567 and17Nov2568 |
| Governance §§9–11 pp.3–4 | Exception vote ≥2/3 of all existing directors; prior lawful actions recognized under transitional §10; chairman interpretation under§11 | Same, §10 p.4 |

Legacy checklist differences preserved: restructuring salary evidence1month; guarantor-debt salary evidence3months plus debt acknowledgment and stated original-borrower event evidence. Checklist1page reviewed only; no claim the full contract forms were audited. No guessed interest, amortization formula, premium, individual eligibility/approval or account balance.

## New verification and release gates

`tests/debt-specific-loans-2569.mjs`: aliases, menu, context, numeric source contracts, exact source/version parity, criteria/form/rate changes, conflicts, removed links, historical boundary, privacy and unrelated controls. Existing assertions remain intact.

`browser-debt-specific-loans-smoke.mjs`: actual typed input and buttons at390/1365px, links, reading history, answer geometry, exact screenshot phrase, unchanged controls; local slow/failed/changed monitor fixtures labelled separately. Integrated additively in PR CI and pre/post-deployment Pages gates. Existing browser suites retained.

Local Chromium is unavailable in this executor; browser execution must be evidenced by successful GitHub CI and Production checks, not inferred from VM tests. Final immutable commit, CI runs, artifacts, merge and deployment results will be recorded in the PR body after completion. This document is authored before those gates and does not claim they passed.

Rollback: before merging record fresh Main SHA and last successful Pages run. If necessary revert only this PR merge, preserving newer Main/current-events changes, then run the same gates and deploy to the original URL. Never reset unrelated Main commits.
