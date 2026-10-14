# PR #136 — Loan amendment rule/KB gap review (2026-10-14)

**Review base:** `80696f966815e8b4006cbe8a3be19644d144b6f9`  
**Scope:** evidence-only; no rule promotion, merge, or deployment.

## Primary documents

| Amendment | Official linked PDF | Registry document ID | Effective date recorded |
|---|---|---|---|
| Ordinary loan 5/2569 | https://drive.google.com/file/d/1CO8uENf2kvBbzILoKhMg6UFQyqXw99wb/view | `doc-fbfe47014336a2cb94f8` | 2026-10-01 |
| Emergency loan 2/2569 | https://drive.google.com/file/d/1DeH0vI9PR6NHPMMlh3X62HOH-twlA0KR/view | `doc-f63c6860836344db8a78` | 2026-10-01 |
| Special loan 3/2569 | https://drive.google.com/file/d/1QePe3oTJto46Dru4j4Je-gE_CUjsDUgd/view | `doc-89e8283abdd6fffa6356` | 2026-10-01 |

PDF clauses identified in review: ordinary clauses 8 and 10; emergency clause 8; special clause 9. Reconcile exact legal text and governing board criteria before any answer-rule change.

## Verified repository findings

1. All three amendments have `status: "CURRENT"`, `mayAffectRules: false`, and review text `metadata only` / `no product rule changes` in `data/official-source-registry.json`. **Potential semantic mismatch:** clauses concern eligibility, loan limits or categories. This is a *review flag*, not proof that the live answer engine is wrong.
2. Registry policy sets `noAutomaticRulePromotion: true`. Keep this safeguard. Do not treat `CURRENT` as permission to activate numeric or eligibility answers.
3. `README.md` describes pilot freeze, official-source hierarchy, privacy handoff and regression requirements. Changes must preserve those contracts.
4. `tests/regression.mjs` and `scripts/official-freshness.js` exist. A complete rule/KB mapping across inline `index.html` and other tests has **not yet been demonstrated**.

## Gap and decision table

| PDF clause | Impact to check | Registry evidence | Rule/KB status | Action |
|---|---|---|---|---|
| Ordinary §8 | Member/share contribution eligibility, ordinary loan ceiling and restructuring exception | `doc-fbfe47014336a2cb94f8` | NOT VERIFIED | Locate rule and answer pathways; verify governing board criteria; add boundary tests |
| Ordinary §10 | Seven ordinary-loan purposes/categories | same | NOT VERIFIED | Compare intent routing, categories and member-facing answers |
| Emergency §8 | Membership-duration eligibility and delegated criteria | `doc-f63c6860836344db8a78` | NOT VERIFIED | Check rule values and date boundaries; obtain board criteria |
| Special §9 | Per-member ceiling and delegated criteria | `doc-89e8283abdd6fffa6356` | NOT VERIFIED | Check per-product rules and any calculation claims |

## Acceptance gates

- **PASS** — PR branch at reviewed HEAD; existing associated CI: Regression run 38489813090, E2E Member Answer Engine run 38489813101, Share KB baseline run 38489813094 all concluded success.
- **PASS** — Source registry links and dates recorded for three amendments; original PDFs were retrieved for separate source review.
- **BLOCKED** — Full clause-to-rule mapping, effective-date handling, board criteria, and member-answer verification not yet supported by repository-wide evidence.
- **NOT TESTED** — New clause-specific browser E2E and privacy edge cases after any future rule change.
- **NO-GO** — No merge/deploy authorization.

**Important:** Existing green CI proves baseline checks only, not correctness of newly amended lending rules. Do not weaken assertions or hard-code tests. Keep the older mismatched ordinary-loan 2023 document pending until independently reconciled.

## Repository rule/KB spot-check (current PR branch)

Read `index.html` (510,008 UTF-8 characters), `tests/regression.mjs` (18,646 characters), and `scripts/official-freshness.js` (14,236 characters) from the PR branch.

- Embedded KB `domains.ordinaryLoan` already states a **six-month** membership condition, and `domains.emergencyLoan` already states **three months** plus three share installments. These observations show some rules may already be aligned; do not label them as newly fixed or infer full correctness.
- Embedded KB `domains.qualityOfLife` includes a **5,000,000 THB** ceiling tied to a specific quality-of-life product. Do not generalize that product-specific rule to every special loan without checking the special-loan amendment and subordinate criteria.
- The embedded `specialHousing` and `specialRedeemMortgage` product entries have separate source links and rule keys; evaluate each separately.
- Existing `tests/regression.mjs` contains loan intent cases, but literal searches did not find 2,000,000 / 5,000,000 or six-/three-month threshold assertions. This is an **identified test coverage gap**, not evidence of a live rule defect.
- `index.html` has numerous references to loan amounts and durations. Their presence is not evidence that every user-facing answer is accurate. The full clause-to-output trace remains BLOCKED pending targeted runtime tests.

**Remediation priority:** (1) source-clause and delegated-criteria verification, (2) add regression boundary assertions without weakening existing ones, (3) compare actual member answers in browser, (4) only then change any contradicted rule or source-registry classification with tests. No numeric rule auto-promotion.

## Acceptance update — 2026-10-14, regression added

- **Test commit:** `4980a789e97c3ce465ac0da4b6df96d2d3a97a73`.
- Added `tests/loan-amendments-2569.mjs` and required invocation in `tests/regression.mjs` (existing assertions retained).
- Added checks for current ordinary loan 6 months / 6 share installments / THB 2,000,000; emergency 3 months / 3 installments; special housing THB 3,000,000 product limit versus THB 5,000,000 total-debt limit; quality-of-life THB 5,000,000 product ceiling; 2026-10-01 effective-date boundary; legacy emergency supersession; answer action presence; basic PII/OTP non-disclosure.
- **Not a complete legal acceptance:** seven ordinary purposes under §10, exact delegation to board criteria, member-specific entitlement, and browser E2E still need dedicated proof. Privacy checks here are additive, not a replacement for the full 69-case corpus.
- **GitHub Actions on test commit, at last check:** Regression `38514269113` IN_PROGRESS; Share KB 2569 and baseline regression `38514269073` IN_PROGRESS; E2E Member Answer Engine `38514269058` IN_PROGRESS. Do not report PASS until each completes successfully and its logs/artifacts are inspected.
- **Release decision: NO-GO.** No merge/deploy performed.

## CI root-cause investigation and corrective action — 2026-10-14

**Failure evidence for HEAD `ea960ee0d070328dc74de0cd11a01efbd10cb058`:**

| Workflow | Run | Result | Job |
|---|---:|---|---:|
| Share KB 2569 and baseline regression | 38514300095 | FAIL | 115689525918 |
| E2E Member Answer Engine | 38514300071 | FAIL | 115689526023 |
| Regression | 38514300104 | FAIL | 115689525995 |

All three job logs show `AssertionError: versioned authority available` at `tests/loan-amendments-2569.mjs:15`. The new test incorrectly expected `globalThis.COOP_KB.ruleAuthority.ruleVersions`; the existing generated app embeds `ruleVersions` at `globalThis.OFFICIAL_SOURCE_REGISTRY.ruleVersions`. **Fix commit `f7f90c26de1d65266124af2c4bd4e57643822186`** changes only the test's authority-registry access and retains all numeric/privacy assertions. No product rule was changed.

Before this assertion failure, the full release log showed `Real LINE runtime: { PASS: 69, PARTIAL: 0, FAIL: 0 }` and `CURRENT RULE CORPUS: 306 patterns PASS`. These component results **do not** override the overall FAIL status of those runs.

**Rerun evidence for fix commit (initial check):** Share KB run 38514470418 SUCCESS; Regression run 38514470393 IN_PROGRESS; E2E run 38514470548 IN_PROGRESS. No artifacts were returned for the three failed workflow runs. Re-check results and any artifacts before acceptance.

**Ordinary loan §10:** Four answer-route checks in the new test do not prove all seven legally defined purposes. Full clause-to-intent coverage remains BLOCKED pending individual assertions and evidence mapping. **Privacy:** 69 real LINE runtime records passed before the test setup failure, but complete privacy-specific 69-case coverage is not established by that count alone.

**Release decision:** NO-GO until all workflows complete successfully and the substantive coverage gaps are resolved. No merge or deploy.

## Latest HEAD CI verification — 2026-10-14

Verified branch HEAD `076db423c0cac37a7f283cf79f0e687bc336424d` (compare: identical, ahead 0).

| Workflow | Run ID | Job ID | Final result |
|---|---:|---:|---|
| Regression | 38514512542 | 115690167968 | PASS |
| Share KB 2569 and baseline regression | 38514512664 | 115690168392 | PASS |
| E2E Member Answer Engine | 38514512522 | 115690167896 | **FAIL** |

**E2E failure from job log:** `scripts/browser-leisure-loan-smoke.mjs:28` throws `AssertionError: One complete welfare index button` (`actual:0, expected:1`) for the welfare index action labelled `❤️ เปิดระเบียบและหลักเกณฑ์สวัสดิการทั้งหมด`. This occurs during the first browser-smoke stage, before the remainder of browser scripts can run. No downloadable workflow artifacts were returned for these three runs.

**Code evidence:** `index.html` still contains the welfare-index action injection for `intent==='welfare_all'` and `S.welfareForms`. The browser output nevertheless has zero matching buttons. This establishes a real behavior mismatch, but **not yet** whether the root cause is intent classification, an evidence lock, asynchronous freshness, or action rendering. Do not change the UI/router or relax the assertion until actual browser response and selected intent are captured.

**Ordinary amendment §10 seven purposes:** Still **BLOCKED** for full semantic acceptance. Existing route checks are not seven clause-specific assertions; no fabricated clause-to-intent mapping has been added. Preserve the PDF's seven purposes and require purpose-by-purpose actual answer tests after source and board criteria mapping.

**Privacy 69:** The `Real LINE runtime: PASS 69` result seen in previous release logs is a **69-record LINE corpus**, not a separately demonstrated 69-case privacy test suite. Three additive PII/OTP assertions in `tests/loan-amendments-2569.mjs` are not equivalent to Privacy 69. **NOT VERIFIED** pending distinct privacy corpus identification, 69/69 execution and logs.

**Decision: NO-GO.** Two of three latest workflows passed; one failed. No merge, deploy, test removal or assertion weakening.
