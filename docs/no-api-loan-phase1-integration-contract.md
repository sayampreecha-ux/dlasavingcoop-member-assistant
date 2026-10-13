# Phase 1 — No-API Loan Service and Future Integration Contract (DRAFT)

Status: **SPECIFICATION ONLY / NOT RELEASE-APPROVED**. This document is not a claim that production is changed or tests pass.

## Baseline and constraints
- Continue on existing `main`; deploy remains governed by README's `main → regression → production backup → gh-pages sync → version/hash` process.
- Pilot freeze applies. Do not change production UI or add new runtime features without a separately approved pilot exception.
- Preserve existing Intent Router, Answer Gate, source registry, privacy/freshness gates, and all current tests.
- No AI API, no LINE API, no personal member data in GitHub. Never invent eligibility, interest rates, forms, or effective dates.
- Existing loan-related open PRs **#35 and #41** must be reconciled against current `main` before modifying loan rules. Other open PRs should be checked for shared-file conflicts.

## Work packages
1. **Evidence inventory**: enumerate loan product IDs from current engine, compare with `data/official-source-registry.json`, verify original effective primary documents. Record `verified / pending / superseded` per product and field; do not infer product availability from a listing alone.
2. **Real-question corpus**: reuse existing `tests/member-real-questions.mjs`, `tests/openchat-gold-regression.mjs`, `tests/legacy-line-69-runtime.mjs`, `tests/mass-member-routing-regression.mjs`. Import only de-identified questions, remove duplicates and direct/indirect identifiers; never commit raw chat logs.
3. **Loan answer contract**: for each member question, classify intent; answer only evidence-backed general criteria; identify missing facts; show up to three relevant primary actions; provide direct verified document links and a human handoff when needed.
4. **No-API implementation**: extend existing routing and deterministic response rules only after reproducing an actual failure. Do not create a parallel engine or rewrite `index.html` wholesale.
5. **Future integration adapter**: define an *interface only* (below). No production endpoints, credentials, authentication tokens, private API calls, or live connections in this phase.
6. **Release gate**: run `node scripts/verify-release.mjs` and existing browser E2E on an actual preview. Never substitute a mocked clock for the release gate or weaken tests.

## Future member integration interface (non-executable contract)
A future server-side gateway may expose **read-only**, explicitly authorized capabilities:
- `getLoanSummary(memberSession)`
- `getLoanApplicationStatus(memberSession, applicationId)`
- `getShareSummary(memberSession)`
- `getDividendSummary(memberSession)`
- `getWelfareRequestStatus(memberSession, requestId)`

Requirements:
- `memberSession` is a short-lived authenticated server-side session from the cooperative's approved identity provider, **not** a member ID supplied in chat.
- Per-request permission checks, explicit field allowlists, audit trail with sensitive data redacted, rate limits, timeouts, and kill switch.
- Fail closed on authorization, source freshness, or gateway errors. Never fall back to another member's cached data.
- Browser on GitHub Pages must never contain secrets, API keys, session signing keys, or privileged endpoints.
- No create/update/payment/loan-approval operations in phase 1; transactions stay with the cooperative's existing member system.

## Test and privacy acceptance
- Confirm each de-identified question's intent, evidence status, next step, and correct non-disclosure behavior.
- Distinguish `correct answer`, `correct safe refusal/handoff`, `wrong answer`, and `unanswered`; do not count handoff as a successful substantive answer.
- Validate ambiguous cases: flood welfare vs disaster loan; guarantor eligibility vs guarantor debt repayment; personal loan balance vs general loan rules; emergency repeat loan vs ordinary restructuring.
- Maintain existing regression, freshness, source, stock, deposit, welfare and privacy tests.
- Merge/deploy **blocked** until authoritative documents, CI, browser E2E and release review are independently verified.

## Initial evidence audit (13 October 2026)
- GitHub default branch `main`; repository contains `data/`, `tests/`, `scripts/` and `index.html`.
- Open PRs observed: #35, #41, #58, #66, #97, #113, #129, #134.
- Recent CI included an E2E Member Answer Engine failure on the head of #134. This must be investigated; other passing checks do not override a failure.
- Existing `docs/loan-primary-audit-2569-fixes.md` describes five loan source PDFs and identifies unresolved rate/form issues. Treat its historical audit as evidence to revalidate, not an automatic live approval.

## Follow-up audit: existing loan PRs and corpus
- PR #35 modifies `.github/workflows/regression.yml` and `data/cooperative-rule-coverage.json`: promotes official-index version metadata for multiple domains and five loan subtypes. This is **version evidence, not automatic proof of each numeric loan criterion**.
- PR #41 modifies `data/official-rule-master.json`, `tests/e2e-member-answer-engine.mjs`, and `tests/legacy-line-69-acceptance.json`. It adds emergency-loan criteria metadata and an assertion; the PR itself records that full 69-row runtime corpus execution remains pending. Recheck effective original documents before promoting rules.
- The existing `tests/member-real-questions.mjs` already contains questions on repeated education/emergency loans, guarantor capacity, mixed loans, income remaining, personal status and official schedules. Reuse these tests; do not add a parallel router.
- A Library search found historical LINE chat exports and a processed member-question quality review file. **No raw messages have been copied into GitHub or disclosed in this document.** Corpus extraction, deduplication and de-identification are **not yet executed**.
- An attempted local `git clone` for running Node tests failed because the execution container could not resolve `github.com`. This is an environment/network failure, **not a test PASS or product FAIL**. GitHub-hosted CI must be used for verified execution.
- The repository README explicitly freezes new runtime features during Pilot. Therefore this PR remains documentation-only until a pilot exception or post-pilot change window is approved.

## Follow-up release evidence state
| Check | State |
| --- | --- |
| PR #35 and #41 diff review | Reviewed (metadata/diff only) |
| Existing LINE-related tests | Identified; not executed |
| Raw LINE anonymization | Not executed; no raw data committed |
| Loan runtime change | Not started |
| Node regression in local container | BLOCKED: GitHub DNS resolution |
| GitHub CI for this PR head | Not yet verified |
| Browser E2E for this PR head | Not yet verified |
| Merge / deploy | BLOCKED |

## CI and privacy review — commit 9be3d48
- GitHub Actions Regression run [38416055935](https://github.com/sayampreecha-ux/dlasavingcoop-member-assistant/actions/runs/38416055935) completed **success** for commit `9be3d48`; this workflow runs `scripts/verify-release.mjs`, which enumerates all `tests/*.mjs` and `tests/*.cjs`, including new `tests/no-api-loan-phase1.mjs`.
- E2E run [38416055804](https://github.com/sayampreecha-ux/dlasavingcoop-member-assistant/actions/runs/38416055804) was **in_progress** at the time of this review. No E2E PASS claim.
- Existing `data/legacy-line-69-corpus.json` contains **69** records, with intent distribution: debt consolidation 17, housing 15, emergency 11, ordinary-related 16, membership 8, contact 1, greeting 1. This corpus is **already committed on main**; do not claim this phase imported or anonymized it.
- Preliminary automated PII keyword/number scan flagged **6 records** (IDs 18, 20, 34, 35, 63, 65), but manual inspection of their question/legacy-answer excerpts showed **generic topics** such as cooperative phone contact, bank transfer, and cooperative mailing address, not demonstrated private member identifiers. A keyword hit is not evidence of a leak. **Full field-by-field privacy audit still pending.**
- Legacy answer text can contain outdated monetary/eligibility rules; `legacy_answer_policy=NEVER_AUTHORITY` must remain enforced.
- New five-case regression passed via CI. This is not a claim that all LINE-derived cases or a live browser were individually audited in this turn.
- No Answer Engine modification was warranted by the passing targeted checks. Keep Draft until browser E2E and primary evidence review.

## Follow-up: all-field corpus scan and full runtime gate
- GitHub Actions Regression [38416205750](https://github.com/sayampreecha-ux/dlasavingcoop-member-assistant/actions/runs/38416205750) completed successfully for `ba12455`; this runs `scripts/verify-release.mjs`, including `tests/legacy-line-69-runtime.mjs`. The runtime suite asserts all 69 records and every stored question pattern, but **does not independently prove every real-world rule is current**.
- At review time E2E runs [38416055804](https://github.com/sayampreecha-ux/dlasavingcoop-member-assistant/actions/runs/38416055804) and [38416205853](https://github.com/sayampreecha-ux/dlasavingcoop-member-assistant/actions/runs/38416205853) remained in progress; no E2E PASS claim.
- All 14 keys of each of the 69 corpus records were scanned for formatted Thai citizen IDs, mobile phone numbers, email addresses, bank account numbers and LINE IDs. Only record **45** matched: a Gmail-format address in `legacy_answer`, `expected_behavior` and `pattern_assertions`. No email address is reproduced in this audit. The context describes an emergency-loan document submission channel, but **official ownership/current validity is not verified**.
- This is a pattern scan, **not a complete privacy certification**; unstructured names, indirect identifiers and historical text require manual review. Do not publish raw LINE exports.
- Potential defect to resolve before production promotion: record 45 expects a Gmail address in legacy acceptance assertions; independently verify the cooperative's current official submission channel, then replace stale contact-dependent assertions and add a regression test. Do not assume a historical email address is current or a private member email.
- No runtime source or historic corpus modified in this audit because evidence of the correct current channel is still pending. Do not weaken existing tests to conceal the issue.

## Official-source recheck and E2E — 13 Oct 2026
- Official emergency-loan page `https://www.dlasavingcoop.com/show.php?No=773` lists application forms and the **B.E.2569 emergency-loan criteria** in addition to earlier B.E.2568 amendments. This newer source requires version reconciliation before treating older extracted numeric criteria as current.
- Official regulations index `https://dlasavingcoop.com/show.php?Category=procedure` lists the emergency-loan regulation amendment No.2 B.E.2569.
- The official emergency-loan landing page did **not independently confirm the historical Gmail submission address** in corpus record 45. Keep `EMAIL_CHANNEL_UNVERIFIED`; do not silently promote legacy address to a verified instruction.
- CI: `ba12455` E2E [38416205853](https://github.com/sayampreecha-ux/dlasavingcoop-member-assistant/actions/runs/38416205853) **success**; `4826506` Regression [38416478435](https://github.com/sayampreecha-ux/dlasavingcoop-member-assistant/actions/runs/38416478435) **success**; `4826506` E2E [38416478492](https://github.com/sayampreecha-ux/dlasavingcoop-member-assistant/actions/runs/38416478492) still in progress at review time.
- Regression executes the 69-record corpus (59 loan records, 10 non-loan), including their question patterns, via `scripts/verify-release.mjs`. It is not a manual field-by-field certification of all 2026 source criteria.
- **Release lock:** new B.E.2569 emergency criteria and submission-email authority must be checked from primary document content before any production answer change. Do not alter acceptance assertions merely to make the run green.
