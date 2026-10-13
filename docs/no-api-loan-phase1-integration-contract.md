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
