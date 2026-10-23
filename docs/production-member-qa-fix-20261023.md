# Production member QA: scoped correctness fixes

Baseline: `0eefdb0e4125217743a7b4b70fa523aa7979d53f`.

## Final acceptance follow-up (same PR, no release)

The first PR-head review still had 33 PARTIAL and 49 SAFE HANDOFF results. All 82 were reviewed individually against the same captured questions and expected behavior. 29 of the partial responses still answered an adjacent facet (for example, a resignation application instead of a post-resignation refund, an opening procedure instead of mandatory associate-member deposit, or a real-estate loan term instead of a small phase scheme). Scoped `memberConcern` routes now preserve the actual operation and explicitly ask for missing information or retain the evidence lock. Special-deposit bill-payment wording reaches the existing deposit-increase procedure. A numeric emergency amount plus interest question composes the existing two answers without changing thresholds, formulas or rate data.

- Focused regression: **58/58** pass. Against reference HEAD `23035f1c40fc3b20bda2911458bea06e952329f5`, the same suite has **26 failures / 32 passes**. The 26 newly added synthetic checks contain no private corpus.
- Release regression after the final runtime edit: **66/66 suites**, none skipped.
- Same private 100 questions and 5 conversations replayed through Source runtime: **18 CORRECT, 4 PARTIAL, 0 WRONG, 0 FALLBACK, 76 SAFE HANDOFF, 2 NOT VERIFIED**. Each main status uses denominator 100; handoffs are not counted as fully answered questions. Main responses changed in 29 cases relative to the reference PR head. Follow-up results remain 4 behavioral CORRECT and 1 SAFE HANDOFF.
- The remaining PARTIAL cases concern phase-specific associate eligibility, the ambiguous project in the less-than-three-years question, a current ordinary-loan cutoff, and an ambiguous mortgage/reapplication interval. They are not converted to complete answers without evidence or clarification.
- The previous CI successes certify only the reference SHA. New CI must be read on the final updated HEAD, without manually rerunning an unchanged SHA. The private report holds the final CI result and full row-level evidence.
- **Exact private-set Branch Browser replay: 0/100 main questions and 0/5 conversations completed on either viewport.** The local Playwright installation has no Chromium executable; the earlier official download was an invalid archive. Cloud Browser can load Production but cannot reach the workspace Branch server (`net::ERR_CONNECTION_REFUSED`). No tunnel, preview deployment or private-dataset upload is introduced to work around that boundary. Existing CI browser suites cannot stand in for these 100 questions.
- Two original NOT VERIFIED items stay locked. The official contact page and its staff images were inspected further, but a complete dated responsibility mapping for share refunds is still not established. The ordinary-loan criteria do not expressly resolve the retired-guarantor case without the applicable complete membership/bylaw evidence. Public professional staff information is not a rule establishing guarantor eligibility.

These final values supersede the initial source-review totals below. Production remains baseline and is not certified PASS. The full 82-row review, final answers, missing facts/evidence and rollback instructions are retained in the private QA report, not committed as a private corpus.

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
