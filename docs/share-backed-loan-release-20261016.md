# Share-backed ordinary loan 2569: scoped fix and acceptance

Baseline Main: `45c6a87e23f6b3c4e4739c8bd8f78ce8243cc402`. Production URL remains https://sayampreecha-ux.github.io/dlasavingcoop-member-assistant/ . Owner authorizes scoped changes, one PR, merge/deploy only after all gates pass. No open PR is scoped to this product; the older open general-version PR #35 and share-navigation PR #134 are independent and not reused or modified.

## Verified evidence

1. Criteria https://drive.google.com/file/d/1347L0hE1IddgM1ab6oheXQPgKpUTMasa/view — all three signed pages visually reviewed; signed 11 September 2569, effective 1 October 2569. SHA256 `b696723bb3485404448cbe2648fb0d33ed2abbfd9f299b8414dec7f747a661e5` matches existing monitor bytes. Clauses 4(1)-(8), 5, 6, 7, 8, 9, 10 are mapped in `rules.shareBackedLoanCurrent.clauseEvidence`. This is a new current criteria notice, not the old share/deposit amendment suggested by stale metadata.
2. Official index https://www.dlasavingcoop.com/show.php?No=774 was read 16 October 2026; its exact criteria link fingerprint is `0f8db084db6cf37d30a84adbd5ac54b5e6b642cec4bb7d966d3e8ad22218fbd6`. Both previously recorded and current link labels are bound to the reviewed exact PDF bytes. New unknown labels/bytes, removals and conflicting scoped documents still lock.
3. Official index-linked legacy form https://drive.google.com/file/d/1b9-zInSX-azm1lQPQnqJK5Es5eYmBaxe/view — 12-page 2024 form, page 1 checklist visually verified. SHA256 `d080274581cb530c281a303ae30e036cfd83d107d87da1485a834c31a8497301`. The checklist is preparation guidance only. Current form compatibility, deposit-based eligibility and guarantor count remain separately unresolved; deposit pledge is explicitly conditional legacy content. No claim that the 2024 financial terms override the signed 2569 notice.
4. Interest notice https://drive.google.com/file/d/1ow2w4RsRBE-Kd2n6uX3_kWSLUFoJVQMw/view — both signed pages visually reviewed, effective 11 November 2567, still linked by the current official index. Exact clause 2.6(5), page 1, lists 7.50% annually with patronage refund for the share/deposit-backed category. SHA256 `6ad92e49fbd4e5a52a5cf09f495e239b95736f9d9cb727e5b5633b27ebca027a`. This rate is not inferred from the general ordinary-loan category and is not promised fixed for a member's full contract.

## Change

One shared product matcher runs before general ordinary-loan, deposit and compound routing, with a dedicated versioned rule and scoped source domain. Match ordinary-loan share collateral, not guarantor share-payment requirements or general ordinary-loan share thresholds. Add the product to existing loan menus and retain context on follow-up questions. The response explains all verified conditions with the exact criteria source. Guarantor count, deposit basis, repayment formula and member approval stay explicitly limited. No live account data or AI API is introduced.

Monitor behaviour: the already-reviewed exact bytes/labels resolve the old pending state without changing unrelated documents. New criteria bytes/labels/removal/conflicts lock the product; changed interest locks interest queries; changed form locks document/procedure concerns. Baseline and delayed/failed-monitor paths cannot answer the general 2-million-baht cap as the share-backed cap. Historical dates before 1 October 2569 remain locked because the superseded original criteria have not been independently extracted; transitional clause 9 is explained without deciding an individual contract.

## Validation and expectation migration

Local `node scripts/verify-release.mjs`: 55 suites PASS, none skipped, including new 66-case share-backed acceptance. All 69 legacy records and all 306 question patterns retained. Only row 59 expected current source/domain/assertions changed to the newly verified notice; its original questions and legacy answer remain verbatim. Existing F07 and three PR136 browser scenarios now assert the verified 90% rule, exact primary evidence and unresolved guarantor limit instead of asserting that no verified source exists. Existing real-member and freshness gates exposed overly broad draft matching of guarantor questions; the matcher was narrowed and those original tests passed unchanged. Existing eight-choice browser geometry checks now require all nine choices; no original scenario removed.

Local Chromium runtime installation failed because the downloaded browser archive was incomplete. This is not a browser PASS. CI must run all existing browser suites and the new physical UI suite at 390px and 1365px. The new suite includes SC01-SC11, boundary arithmetic, exact evidence links, context, preserved reading history, privacy, negative controls and separate local delayed/failed/changed-monitor scenarios. Production run uses the real monitor and real UI, not injected fixtures.

## Release gates and rollback

- Before merge: verify final PR HEAD Regression, Share KB and E2E checks; inspect failed steps/artifacts, browser totals and screenshots. Recheck Main and required policy/reviews. Never remove a required check or lower branch protections.
- Preserve current Main `data/current-events.json` blob in the synthetic merge. No force push or direct push to Main.
- Authorized release: merge only the final tested PR HEAD; Pages predeploy runs unit and browser gates, deploys unchanged URL, then runs live browser checks including this product.
- Record premerge Main SHA, final merge SHA, Pages run/deployment and live version `4.10.0-share-backed-loan-2569`.
- If a postdeploy critical regression appears, stop further rollout and restore the last verified Pages artifact/deployment using the existing normal reviewed rollback process. Do not erase newer events or unrelated Main work.

Current disposition at authoring: local unit/contract PASS; browser CI and release pending. Do not present this draft evidence record as deployed acceptance.

## First CI correction

At `ec65986aa5eac59c0e3f0716f3ce5afc21d10765`, Regression 38884326083 and Share KB 38884326187 passed. E2E 38884326790 passed the original 42-case PR136 acceptance and 18/19 browser suites. The remaining Pilot test used an ambiguous `details.more summary` locator after a separate extra-links panel became visible; it now requires exactly one summary with the intended details label. New share-backed browser acceptance was 34/36: both failures were historical questions with a correct evidence lock but a generic source-index link. The handler now supplies the current signed notice as evidence of its effective-date boundary, explicitly not as authority for the prior period. Added assertions retain the historical lock and prohibit current financial values in that historical answer. All original scenarios remain; exact-head CI must rerun before merge.

Visual review of first-CI mobile/desktop screenshots also exposed the product's six follow-up chips floating over the answer under the inherited sticky style. Only this product now uses a static follow-up block. Added browser geometry assertions require the block after the answer and all its buttons inside the block, with no inner clipping. Existing global navigation and other products are unchanged.
