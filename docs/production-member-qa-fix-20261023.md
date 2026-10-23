# Production member QA: scoped correctness fixes

Baseline: `0eefdb0e4125217743a7b4b70fa523aa7979d53f`.

## Problem and behavior

An age-of-membership bound was converted to an exact duration in `compoundLoanAnswer` and `factValue`. Negative mentions of an ordinary loan also counted as an existing ordinary-loan product. `norm` now recognizes the audited spelling variants, bound-aware intake retains the comparator and target product, and bounded input never grants a membership PASS.

`OFFICIAL_FRESHNESS` previously excluded the association-deposit regulation only when a query explicitly named special savings or collateral. Generic member-account questions consequently inherited an association-only pending rule. `documentScope` now scopes that document to association depositors. Its PENDING status is unchanged. Tests retain locks for actual association deposits and newly discovered member-account regulations.

Overlapping eligibility keywords ran before the requested service facet. `memberConcern` now handles repayment increases, external-creditor documents, resignation with guarantee liability, mortgage redemption, spouse association questions and document delivery before those eligibility paths. Responses with missing primary evidence remain explicit evidence locks with the relevant official work route. No numeric loan rules, rates, formulas or rule-authority data were added or changed.

`conversationTurn` retains document-channel questions after short membership replies, carries the original amount into installment intake, and remembers account opening/withdrawal/interest when a deposit type is selected. Existing public `deposit_open`, `deposit_withdraw` and `welfare_contact` intent contracts are retained.

## Validation

- Existing Production captures: 100 source questions and 5 synthetic follow-ups were read from the private QA artifact. No full LINE corpus, original chat export, identifiers or private test dataset is committed here.
- Baseline source replay with the committed monitor reproduces the captured Production answer text in 100/100 cases. This establishes baseline parity; it does not make the changed branch a Production test.
- A new 32-check synthetic regression suite fails 27 checks against baseline and passes 32/32 after the patch.
- Complete `node scripts/verify-release.mjs`: 66 suites, none skipped, including canonical authority/runtime checks and the 306 legacy question patterns.
- The same 100 questions and 5 follow-ups are replayed locally on the branch. Matched-evidence semantic review: CORRECT 16, PARTIAL 33, WRONG 0, FALLBACK 0, SAFE HANDOFF 49, NOT VERIFIED 2. With the same newly inspected primary evidence, the baseline is 10/39/26/2/21/2 respectively. The original historical Production report remains 6/38/26/2/21/7; improved evidence coverage is not a code improvement. These are source-review results, not deployed accuracy or 100 successful substantive answers.
- Changed main answers: 36/100; all 7 previously NOT VERIFIED main answers remain unchanged. All 5 follow-ups execute: 4 CORRECT behavioral results and 1 SAFE HANDOFF for unverified PDF delivery, after primary-document verification of the three-installment rule.
- Two existing assertions intentionally expected an association rule to lock a generic member-account query. They now expect that query to remain available, while separate positive association queries stay locked. No existing personal-data or relevant-member-rule locks were removed.
- Browser installation in this workspace failed because the Chromium download was not a valid archive. Local changed-branch browser QA is NOT VERIFIED. Existing GitHub browser jobs must be assessed on the final PR SHA; baseline Production browser captures cannot certify the patch.

## Remaining limitations

The 7 original NOT VERIFIED items were reviewed again. Search retrieval failed for the Drive links, but the connected Drive service successfully supplied the original scanned PDFs. Relevant pages were rendered and inspected; no rule-authority data was changed.

| Item | Evidence and result |
| --- | --- |
| MQ-00114 | NOT VERIFIED: complete current staff image/list and responsibility mapping still need independent confirmation. |
| MQ-00522 | CORRECT for the stated condition only: emergency criteria page 2 clause 5(4), together with quality-of-life page 2 clause 5(5). This is not personal approval. |
| MQ-00526 | CORRECT: emergency criteria page 1 clause 4(3) supports the residual-income answer. |
| MQ-00822 | NOT VERIFIED: ordinary criteria page 3 clause 6(1) was read, but does not expressly decide the retirement question; a complete current membership/bylaw interpretation remains needed. |
| MQ-00826 | CORRECT for membership duration only: ordinary criteria page 1 clause 4(1). Other eligibility conditions remain separate. |
| MQ-01313 | PARTIAL: quality-of-life page 2 clause 5(2) supports the term for real-estate-backed consolidation, but the question's small scheme amount may refer to another project. Clarify the project before applying that term. |
| MQ-01316 | CORRECT for the named real-estate-backed type: quality-of-life pages 1–2 clause 4(1)–(2). No individual eligibility decision is made. |

Primary files downloaded read-only from their existing official-linked Drive IDs:

- Emergency: `1XZYfuXWgzqWp6K_Ld0aosuO58pxKXU5p`, SHA-256 `15b72b5357333ef95e9a5f259f7b5effefb40b8369ccfe374346bfe202f72a08`.
- Ordinary: `1QQo5gux4sB3xdcbFvxYBeV-D30gOkXnV`, SHA-256 `36e236c9eeba2407341255c43e89baa73a41b5b4e23c9464bd333febc68ef4d9`.
- Quality of life: `1Ek7aw6J-fgIE2AKOv_QruD57pQpJXVjU`, SHA-256 `8fe51e1cbfa02ec96c1bfbbec306bd4e2b48021d6907e0b206a1fe5d89c13bcb`.

33 questions remain partial and 49 are appropriate handoffs rather than full answers. Better routing does not establish missing delivery-channel acceptance, application-round schedules, document processing times or individual eligibility. The 100-case selection was exact-text deduplicated, not certified as a statistically independent semantic holdout.

## Review and recovery

This PR changes only the two runtime representations, focused synthetic regressions, the two corrected scope assertions and this review note. `data/`, news, guide/UI layout, loan formulas and deployment workflows remain unchanged. The source-monitor fixture is the existing committed snapshot.

Do not merge or deploy as part of this task. Review the final PR checks and unresolved evidence before any release. Before release, rollback means closing this unmerged PR. If separately authorized and deployed later, revert this PR's commit(s), run the release gate, and redeploy the reviewed prior commit; no database or data migration is involved.
