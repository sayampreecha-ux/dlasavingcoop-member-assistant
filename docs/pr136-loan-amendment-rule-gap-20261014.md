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
