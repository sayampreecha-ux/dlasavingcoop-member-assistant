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

## Browser diagnostic instrumentation — 2026-10-14

- Baseline HEAD `45c7838f352e1fdaadb5554300fdd757a18ea71d`: E2E still failed in the welfare-index assertion. Existing source inspection confirms `res('welfare_all',...)` and action injection exist in `index.html`, but not that the browser executed that path.
- Diagnostic commit `b45e1f91afc61e52f861be6a96db7c16de05a998` instruments `scripts/browser-leisure-loan-smoke.mjs` to print `WELFARE_INDEX_DIAGNOSTIC` with question, viewport, actual rendered answer, action labels/hrefs and follow-ups *only if* the existing assertion fails. The assertion and all prior expectations remain unchanged.
- First rerun on diagnostic commit: Share KB run `38515527741` PASS, Regression run `38515527763` PASS, E2E run `38515527767` IN_PROGRESS at last inspection. E2E job `115693349208`; logs not yet available during execution. Do not claim root cause confirmed before reading the diagnostic.
- **Seven-purpose ordinary §10** remains BLOCKED pending clause-specific member-answer checks. **Privacy 69** remains NOT VERIFIED as a distinct corpus; LINE runtime 69 is not a substitute.
- **NO-GO.** No merge/deploy.

## Confirmed welfare browser root cause and scoped fix — 2026-10-14

- Diagnostic E2E run `38515527767`, job `115693349208`, failed. `WELFARE_INDEX_DIAGNOSTIC` captured **question** `สวัสดิการทั้งหมด`, **viewport** 390px, and actual answer: `พบเอกสารทางการที่อาจเปลี่ยนเงื่อนไขเรื่องนี้ กำลังยืนยันผลกระทบครับ ...`. Actions were `ดูเอกสารและแบบฟอร์มเรื่องที่ถาม` → `https://www.dlasavingcoop.com/show.php?No=775`, `ตรวจเอกสารต้นฉบับ` → `https://www.dlasavingcoop.com/show.php?No=4941`, `ติดต่อเจ้าหน้าที่`, and `หน้าที่เผยแพร่ต้นฉบับ`; followups empty.
- **Confirmed root cause:** `freshnessStatus(q)` returned a pending-document Evidence Lock before `answerLegacy(q)` could emit `welfare_all`. The locked answer did retain the official welfare index URL but changed its button label, violating the browser action contract. This was **not** evidence of an erroneous eligibility answer; Evidence Lock is correct and must stay active.
- **Fix** `a82a0563fdce4052d19412b110d341b9539079f5` updates only the locked welfare-overview navigation action for the three generic questions. It preserves the lock, original document, contact actions and unverified-number suppression. All prior E2E assertions are unchanged.
- Fix-commit CI started: Share KB `38515818521` SUCCESS; Regression `38515818621` IN_PROGRESS; E2E `38515818537` IN_PROGRESS at last check. No final E2E PASS claimed yet.
- **Ordinary loan §10:** seven purposes not yet each verified against user-visible answers and subordinate board criteria: BLOCKED.
- **Privacy 69:** distinct 69-case privacy test and artifacts still NOT VERIFIED. Real LINE 69 records cannot substitute.
- **Release decision:** NO-GO until all required gates and clause-specific acceptance pass. No merge or deploy.

## E2E verification after welfare-index fix — 2026-10-14

- HEAD `36a1a2d8bdc703b0acdc8b9cdfba71a4dd45d43d` was identical to the PR branch when checked.
- CI on this HEAD: Regression `38515866073` **PASS**, Share KB `38515866062` **PASS**, E2E `38515866066` **FAIL**. The preceding fix-commit E2E `38515818537`, job `115694251507`, also **FAIL**. Neither E2E run exposed downloadable artifacts through the GitHub connector.
- Job `115694251507` browser log shows the previously failing welfare-index assertions no longer fail; execution proceeds to `scripts/browser-leisure-loan-smoke.mjs:45`, where a leisure-loan answer is expected to match `/300,000 บาท.*36 งวด/` but the actual browser answer is the official **PENDING_DOCUMENT Evidence Lock**: `พบเอกสารทางการที่อาจเปลี่ยนเงื่อนไขเรื่องนี้ กำลังยืนยันผลกระทบครับ ...`. This is a real mismatch between numeric-answer E2E expectations and current evidence-governance behavior, not evidence that the verified numeric rule should be blindly enabled. Do not weaken the assertion or bypass the lock.
- The three welfare overview questions were executed at 390px before the later failure; no earlier welfare assertion error occurred. This supports their smoke-check success for the mobile stage only, **not** completion of desktop 1365px or all remaining browser scripts.
- The official source registry still enforces `noAutomaticRulePromotion: true`. Before any code change, identify the exact pending document, its affected domain and authoritative effective date, and decide whether the correct behavior is a lock or a verified rule answer. Without that evidence the leisure issue is **BLOCKED**.
- Ordinary loan §10 seven-purpose user-visible clause-to-intent mapping: **NOT TESTED**; a generic 4-route check is not equivalent. Privacy 69: **NOT TESTED** as a distinct 69-case corpus; prior LINE 69/69 is a different corpus. No invented pass counts.
- **GO/NO-GO: NO-GO**. No merge/deploy or production URL changes.

## Pending-document leisure investigation — 2026-10-14

- Baseline `dcf541a22085cdc9ac6ce40f5e1df8fa45f302bd`: Regression run `38516309284` PASS; Share KB run `38516309321` PASS; E2E run `38516309287` FAIL (job `115695785511`). No downloadable artifacts returned for that E2E run.
- Source registry inspection found numerous `PENDING` ordinary-loan documents with `mayAffectRules:false` and `pendingReason:BASELINE_INVENTORY_NOT_RULE_PROMOTION`; these **cannot by themselves trigger** `pendingFor()`, which filters for `mayAffectRules===true`. Therefore do not attribute the observed leisure `PENDING_DOCUMENT` lock to those metadata-only records without runtime evidence.
- Source `OFFICIAL_FRESHNESS.gate()` applies `pendingFor()` to the merged runtime registry; `freshnessStatus()` normalizes leisure queries to the ordinary-loan domain. The specific blocking document and authoritative effective date remain **UNVERIFIED** until runtime diagnostic reveals the actual merged snapshot.
- Diagnostic commit `06a39b953cad92269469475b6cf5263ad3935b7c` captures `LEISURE_EVIDENCE_DIAGNOSTIC` with actual browser answer, actions, details, viewport and any exposed freshness status, while retaining the exact `300,000 บาท.*36 งวด` assertion and all existing tests. Its initial CI: E2E `38516577590` IN_PROGRESS, Share KB `38516577648` PASS, Regression `38516577727` IN_PROGRESS at last check.
- The 2569 leisure loan registry version is tagged verified primary and effective 2026-10-01, but that does not authorize overriding a live pending-document lock without resolving source/version scope.
- **Ordinary §10:** 7 purpose-specific tests not yet executed; **BLOCKED** pending primary PDF and mapping. **Privacy 69:** distinct suite not executed; **NOT TESTED** (LINE 69 is separate). Browser desktop and other scripts cannot be declared passed after the early leisure failure.
- **NO-GO**. No test reduction, no automatic rule promotion, no merge/deploy.

## Definitive live monitor lock evidence — 2026-10-14

- Baseline HEAD `2aeef557533525344e08b871fd6c64e8fffae43f` confirmed identical. CI: Share KB `38516629058` PASS, Regression `38516629082` PASS, E2E `38516629124` FAIL. Previous diagnostic E2E `38516577590`, job `115696625305`, FAIL; no workflow artifacts returned.
- `LEISURE_EVIDENCE_DIAGNOSTIC` captured on 390px viewport: `monitor.reason=PENDING_DOCUMENT`, `monitor.domains=['ordinaryLoan']`, document `doc-8ef30ac9bd3b05e970e9`, title `[ประกาศ] ผลการคัดเลือกบริษัทประเมินหลักทรัพย์`, URL `https://www.dlasavingcoop.com/show.php?No=4941`, `status=PENDING`, `mayAffectRules=true`, `pendingReason=NEW_OFFICIAL_DOCUMENT`, `lastCheckedAt=2026-10-14T05:02:40.883Z`, `announcementDate=null`, `effectiveDate=null`, `affects` includes every broad product domain. Browser actual answer was an Evidence Lock; actions led to that original announcement, contact and official index.
- Confirmed mechanism: `OFFICIAL_FRESHNESS.mergeMonitor()` adds new primary pending records with monitor-provided broad `affects` values, and `pendingFor()` locks matching domains. This is **unreviewed broad classification**, not verified evidence that the company-selection notice actually changes leisure-loan eligibility. The original URL could not be fetched in the current web session, so the notice body and legal effective date are **NOT VERIFIED**. Do not promote, narrow, suppress or whitelist this document until its contents are checked.
- No code change to the source monitor or lock in this step. The 300,000 THB / 36 installments E2E assertion remains intact. The blocked E2E does not establish desktop success.
- Ordinary-loan amendment §10 seven-purpose semantic tests: **NOT TESTED**, pending verified clause mapping. Separate Privacy 69 corpus: **NOT TESTED**, distinct from LINE runtime 69. No fabricated results or test weakening.
- **NO-GO**, no merge/deploy. Human review of announcement content/scope is the release dependency.

## Additive §10 and independent Privacy 69 test development — 2026-10-14

- Baseline `223fbd26e5d2b395a904227d32f3af925ea2ef31` identical to PR HEAD. CI: Share KB `38516789908` PASS, Regression `38516789916` PASS, E2E `38516789983` FAIL (job `115697287561`, no artifacts). Browser diagnostic still shows 390px leisure question blocked by pending announcement `doc-8ef30ac9bd3b05e970e9` at `https://www.dlasavingcoop.com/show.php?No=4941`.
- External official notice index confirms the notice title `ผลการคัดเลือกบริษัทประเมินหลักทรัพย์`, but direct page `No=4941` is inaccessible through current web retrieval. Full notice content and effective date remain NOT VERIFIED; monitor broadly maps its affects across unrelated domains. **Do not change or bypass Evidence Lock without original text review.**
- Added additive source-grounded §10 tests for all seven purposes based on both supplied scans of Ordinary Loan Amendment No.5/2569, effective 2026-10-01. These are seven distinct answer/action/no-false-approval smoke checks, **not** eligibility certification or complete clause-to-product board-criteria coverage.
- Added a separate 69-question privacy corpus (23 personal financial/operational topics × 3 phrasing variants), each checking non-empty answers and absence of ID/OTP/PIN disclosures; not derived from LINE Runtime 69. **Limitation:** this is a basic disclosure regression, not a full semantic authorization/security audit.
- First test commit `fb03d99407f05ea6e41583ab3bc198c682a4e9fe` failed Regression and Share KB because the new §10 source provenance assertion looked for the PDF in the embedded runtime registry instead of the canonical `data/official-source-registry.json`; actual manifest has verified `doc-fbfe47014336a2cb94f8`. Corrected **only the source lookup** in `bb796ea0dcbff8c0ebe611484ecf242677063ac1`, preserving assertions.
- CI on fix SHA `bb796ea0dcbff8c0ebe611484ecf242677063ac1`: Share KB `38522834477` PASS, Regression `38522834445` IN_PROGRESS, E2E `38522834531` IN_PROGRESS at last check. Artifacts not yet verified. E2E full mobile/desktop remains unverified.
- **NO-GO** pending all CI gates, original notice scope review, and full §10/Privacy acceptance. No merge/deploy or URL change.

## Verification after additive §10/Privacy tests — 2026-10-14

- HEAD `757b030e4a8ab64dfe97ac6af100ea94169ddd6f` was identical to the existing PR branch at verification time. Three CI workflows: Regression `38522887207` **PASS**, Share KB `38522887198` **PASS**, E2E `38522887214` **FAIL**.
- Requested prior E2E `38522834531` job `115716251193` **FAIL**, no artifacts returned. `LEISURE_EVIDENCE_DIAGNOSTIC` identifies `doc-8ef30ac9bd3b05e970e9` ([ประกาศ] ผลการคัดเลือกบริษัทประเมินหลักทรัพย์, No=4941) as a pending broad-domain monitor record with `announcementDate=null` and `effectiveDate=null`. Mobile width 390px fails on the preserved `300,000 บาท.*36 งวด` assertion; desktop continuation is not verified.
- Direct retrieval of official notice `https://www.dlasavingcoop.com/show.php?No=4941` was inaccessible in this session. Consequently its full text, actual scope and effective date **remain BLOCKED**; no Evidence Lock bypass or false classification was applied.
- `tests/loan-amendments-2569.mjs` contains 7 distinct ordinary §10 purpose answer/action/non-guarantee assertions and a separate 69-question privacy suite (23 × 3). Both are included in the passing Regression and Share KB runs. Their scope is **smoke coverage** only: privacy checks detect literal ID/OTP/PIN disclosures, not all contextual leakage or access-control failures, and §10 tests do not prove correct semantic classification for each purpose.
- Final acceptance: **NO-GO**. No merge, deploy, assertion weakening or production URL change.

## Contextual privacy addition and new E2E verification — 2026-10-14

- At HEAD `3839a533e720533023447d41830c4c0d7d3bbc63`, CI Share KB `38525013949` PASS, Regression `38525014140` PASS, E2E `38525013955` FAIL. E2E job `115723212833` still logs `PENDING_DOCUMENT` on mobile 390px for leisure loan, caused by new monitor notice `doc-8ef30ac9bd3b05e970e9` / No=4941. No artifacts returned for any of the three workflows.
- Direct official page `https://www.dlasavingcoop.com/show.php?No=4941` was not accessible through the web tool; original body, scope and effective date are unverified. **No lock bypass or rule promotion.**
- Added **12 distinct contextual privacy smoke checks** (third-party account inquiries, OTP/PIN/password requests, unverifiable identity, false loan approval) on top of independent 69-question corpus and 7 §10 purposes, in commit `ee24323fc1c06fc9bc44386e8718b86198558bf6`. Existing assertions remain unchanged. Tests check nonempty response, literal ID/OTP/PIN leaks, and unsupported approval promises; these are not a comprehensive security/authorization assessment.
- CI on new test commit: Share KB `38525249057` PASS; Regression `38525249069` and E2E `38525249204` IN_PROGRESS at report preparation. Browser desktop still NOT VERIFIED, mobile E2E baseline FAIL. Await new logs/artifacts.
- **NO-GO**. No merge, deploy or production URL change.

## Follow-up CI evidence — 2026-10-14

- Confirmed HEAD `400cec3cecf66de4f7801cb936eaf169e65ce77b` identical to PR branch before this report.
- On this HEAD: Share KB `38525310114` **PASS**; Regression `38525310132` **PASS**; E2E `38525310059` **FAIL**.
- Specifically requested previous run `38525249204` **FAIL**, job `115723974551`, no artifacts. Same evidence-lock mismatch at 390px, `scripts/browser-leisure-loan-smoke.mjs:50`. No desktop completion evidence.
- Regression run `38525249069`, job `115723975372` **PASS**, logs explicitly contain `ordinary-section10-and-privacy69` with `section10Purposes:7` and `privacyCases:69`, and `contextual-privacy-smoke` with `cases:12`. This confirms execution of additive smoke checks, **not** comprehensive semantic/privacy acceptance.
- Official No=4941 source body/effective date and true rule impact remain **BLOCKED**; only notice metadata/title is available. Keep Evidence Lock active. No unjustified E2E test change, no merge/deploy.
- **GO/NO-GO: NO-GO**. Required: official source text verification, impact classification, rerun E2E across both mobile and desktop, and fresh evidence on the final SHA.

## Official No.4941 retrieval and latest CI verification — 2026-10-14

- HEAD `00ff17933404f387a11170a1ef49de1747890f7e` was identical to PR branch before report update.
- Share KB `38525555805` **PASS**, Regression `38525555827` **PASS**, E2E `38525555873` **FAIL** (job `115724955464`, artifacts **none**). Browser script still fails at mobile width 390 on unchanged `/300,000 บาท.*36 งวด/` expectation because the monitor's No.4941 record triggers `PENDING_DOCUMENT`. Desktop flow does not complete.
- Official notice index/homepage independently displays the title `[ประกาศ] ผลการคัดเลือกบริษัทประเมินหลักทรัพย์`. Attempts to retrieve `https://www.dlasavingcoop.com/show.php?No=4941` with web source returned inaccessible, and direct HTTP from available container failed DNS resolution. No verified body, effective date, attachment or policy impact. **BLOCKED: cannot certify this notice as non-governing or change Evidence Lock.**
- Existing regression logs previously confirmed §10 seven-purpose smoke, independent privacy 69, and contextual privacy 12. Their PASS status does not establish complete semantic mapping, secure authorization or production E2E.
- GO/NO-GO: **NO-GO**. Preserve all assertions and current Evidence Lock; no merge, deploy, production URL change or new PR.

## Latest verification and independent viewport feasibility — 2026-10-14

- HEAD `4476e7ff06c4edbe4f800182cd20f2bccf61085f` identical to PR branch before update. Share KB `38525724410` **PASS**, Regression `38525724404` **PASS**, E2E `38525724370` **FAIL**, job `115725474148`; no E2E artifacts.
- Reviewed `scripts/browser-leisure-loan-smoke.mjs`: it loops sequentially over `[390,1365]` and the first mobile assertion `/300,000 บาท.*36 งวด/` throws before desktop starts. Independent desktop execution is **not supported by this script without a new additive runner or parameter**; no desktop PASS is claimed. Original assertion retained.
- No.4941: index metadata title indicates selection of property valuation company, but original notice body/attachments, date of effect, and any loan rule impact remain unverified. **BLOCKED**. Do not infer non-governing status from title alone, suppress monitor record, or remove Evidence Lock.
- Seven §10, 69 privacy and 12 contextual privacy cases passed in previously inspected regression job `115723975372`; the current Regression workflow also passed, but this is not a full semantic or access-control audit.
- Final **NO-GO** pending original evidence and browser mobile/desktop verification. No merge, deploy, production URL change or assertion reduction.

## Independent mobile/desktop E2E instrumentation — 2026-10-14

- Baseline HEAD `1d54613f1531f1d2f392bfd61932eb59d16390d0` identical to branch. Share KB `38526609617` PASS, Regression `38526609604` PASS, E2E `38526609607` FAIL. Existing original notice No=4941 content/effective date remains BLOCKED; Evidence Lock unchanged.
- Commit `7ca45e28af0c58a436f9873649c319e461e7b22d` adds optional `LEISURE_VIEWPORT_WIDTH` (390 or 1365) to the original Playwright script, retaining all original assertions. Failed leisure response now captures `leisure-failure-<width>.png` when `LEISURE_SCREENSHOT_DIR` is set.
- Commit `cfce6334a9ca8f14adeecae687f156b5615cc2b5` adds two independent diagnostic steps to E2E workflow, plus always-upload artifact. These diagnostic steps use `continue-on-error` **only to collect both failure records**; the original unchanged blocking browser step still runs and fails when its assertions fail. Diagnostic failures must never be represented as PASS.
- New CI on code HEAD: Share KB `38526796240` PASS; Regression `38526796176` IN_PROGRESS; E2E `38526796246` IN_PROGRESS at document update. Independent browser outcomes and artifact IDs are **NOT YET VERIFIED**.
- Final **NO-GO**, no merge/deploy/new PR/production URL change.

## Independent browser E2E results verified — 2026-10-14

- Requested Run `38526796246` job `115728946999` **FAIL**. Independently executed Mobile 390px and Desktop 1365px both exit **1** at the unchanged `/300,000 บาท.*36 งวด/` assertion; both display the same `PENDING_DOCUMENT` Evidence Lock caused by unreviewed notice No=4941. This proves the desktop failure independently, not merely a skipped desktop run.
- Diagnostic steps display GitHub step conclusion `success` only because `continue-on-error: true` is used for evidence collection. Their process logs show **exit code 1**, and the original mandatory browser step also fails. Never interpret diagnostic-step success as test success.
- GitHub screenshot artifact `11875808123`, `leisure-independent-browser-diagnostics`, 772665 bytes, uploaded successfully. Screenshots were generated for failed mobile and desktop viewports.
- CI at HEAD `7fe9663551d43461ff6b0b3154299b229f596dd3`: Share KB `38526853568` PASS, Regression `38526853572` PASS, E2E `38526853548` IN_PROGRESS at last check. Original source body, attachments, effective date and loan-rule impact of No=4941 remain **BLOCKED**; Evidence Lock untouched.
- Seven §10 purposes, privacy 69, contextual privacy 12: verified earlier regression logs; this is smoke coverage, not final semantic/authorization certification.
- **NO-GO**. No merge/deploy/new PR, no assertion weakening or production URL change.

## Screenshot artifact inspection and latest CI — 2026-10-14

- Verified HEAD `0bf83a5ce827633392ec6c46fed84e749867cb84` identical to PR branch before update. Share KB `38526991497` PASS; Regression `38526991564` PASS; E2E `38526991309` FAIL.
- Downloaded and opened artifact `11875808123` (ZIP 772665 bytes): two actual screenshots `leisure-failure-390.png` (360307 bytes) and `leisure-failure-1365.png` (434160 bytes). Both show the leisure-loan selection and an Evidence Lock response rather than loan amount/term. Screenshots show no obvious clipping of the eight loan choices, but screenshots alone are insufficient for all responsive UI assertions.
- Job `115728946999` logs confirm both independent browser widths fail original amount/term assertion with exit code 1; the diagnostic steps' reported success only reflects `continue-on-error`. Original mandatory E2E fails.
- Attempt to retrieve official original `https://www.dlasavingcoop.com/show.php?No=4941` again returned inaccessible. Original content, attachments, effective date and actual effect on loan rules remain **BLOCKED**; no justified Evidence Lock change.
- Prior regression logs prove 7 ordinary §10 purposes, 69 privacy and 12 contextual privacy smoke checks were executed and passed; not a comprehensive semantic or access-control audit.
- Final **NO-GO**. No assertion reductions, merge, deploy, new PR or production URL changes.

## CI rerun and No.4941 source recheck — 2026-10-14

- Confirmed baseline HEAD `ad108a6ab1a7ee2ddf9b001c3369bc29a16c483e` identical to PR branch before report update.
- CI: Share KB `38527249622` PASS; Regression `38527249614` PASS; E2E `38527249647` FAIL, job `115730403628`.
- Independent Playwright 390px and 1365px each exit code 1 at leisure-loan answer due to `PENDING_DOCUMENT` for No=4941. Original mandatory browser suite also fails; no original assertion modified. The two diagnostic steps report success only because they are configured `continue-on-error` for collection.
- New screenshot artifact `11875903828` `leisure-independent-browser-diagnostics`, 779470 bytes. Prior screenshot artifact `11875808123` independently reviewed and showed same Evidence Lock response.
- Official No=4941 page `https://www.dlasavingcoop.com/show.php?No=4941` again inaccessible from available web reader. Original text, attachments, effective date, and actual loan-rule effect **BLOCKED**. No authority to bypass Evidence Lock or alter policy.
- Seven ordinary-loan §10 purposes, privacy 69 and contextual privacy 12 were previously confirmed in regression log as smoke tests. Current Regression PASS; no new claim of comprehensive authorization/security testing.
- Final **NO-GO**. No merge/deploy/new PR, assertion reduction or production URL change.

## Fresh artifact visual inspection and CI — 2026-10-14

- Confirmed HEAD `09303d92728561f6cde2219056fbcff9376a77d9` identical to branch before this update. Share KB `38527396292` PASS, Regression `38527396230` PASS, E2E `38527396193` FAIL.
- Downloaded screenshot artifact `11875903828` from Run `38527249647` and inspected actual PNGs: `leisure-failure-390.png` 362585 bytes and `leisure-failure-1365.png` 437023 bytes. Both show a response warning about potentially changing official documents rather than verified amount/term; eight loan-purpose choices remain visible. Neither screenshot proves all interactions/viewport assertions.
- Job `115730403628` confirms mobile and desktop independent diagnostics each exit 1, with unchanged original release-gating browser step also failing. This is a reproducible evidence-lock disagreement, not a PASS.
- Original official notice No=4941 and attachments remain inaccessible to available tools; effective date, policy impact, and rule applicability **BLOCKED**. No change to Evidence Lock, no speculative reclassification.
- Seven ordinary-loan §10 purpose checks, privacy 69, and contextual privacy 12 confirmed in earlier regression logs as PASS smoke; latest Regression PASS does not imply comprehensive privacy authorization review.
- Final **NO-GO**; no merge, deploy, new PR, changed production URL or assertion weakening.

## Latest CI and verified lock root cause — 2026-10-14

- HEAD `54b8986ad175e022ab9c06e8b4cca76b124e3992` identical to PR branch before update. Share KB `38528394300` PASS, Regression `38528394123` PASS, E2E `38528393922` FAIL, job `115734111657`. Browser diagnostic artifact `11876633177` (773569 bytes).
- Reviewed actual `index.html` `mergeMonitor(base,snapshot)`: pending monitor documents with `mayAffectRules` and `primary(d)` are added to the registry and their declared affected domains become pending; only exact reviewed content hashes/fingerprints and restricted verified metadata review allow exemptions. The No=4941 snapshot has unknown date, no verified primary body and broad affected domains. This explains the current `PENDING_DOCUMENT` behavior but does not establish that its classification is wrong.
- Official No=4941 original/attachment and effective date remain **BLOCKED**. Do not bypass Evidence Lock on title alone, alter baseline inventory or weaken test assertions. Independent mobile and desktop E2E remain FAIL pending source review; prior screenshot artifacts and job logs substantiate both widths.
- Regression 7 ordinary-loan §10, privacy 69 and contextual privacy 12 PASS at smoke level from inspected logs; not a full authorization audit.
- Final **NO-GO**. No merge/deploy/new PR/production URL change.

## Visual comparison and CI on HEAD fa1ccf54 — 2026-10-14

- Baseline `fa1ccf54bf32d5c4c65f85e107f8944bb336b667` matches branch before documentation update. Share KB `38528545249` PASS; Regression `38528545201` PASS; E2E `38528545187` FAIL.
- Downloaded artifact `11876633177` (773569 bytes) and inspected `leisure-failure-390.png` (360402 bytes) and `leisure-failure-1365.png` (434160 bytes). Both show the same `PENDING_DOCUMENT` warning instead of the asserted 300,000 baht / 36 installments. The eight purpose choices and follow-up buttons are visible. Mobile stacks choices in two columns; Desktop has a fixed-width centered layout and more horizontal space. This is not a width-specific answer failure. Desktop screenshot also shows a sticky bottom navigation overlapping part of the category tiles, a separate potential layout issue that requires a dedicated assertion before claiming a defect or fix.
- Job `115734111657` confirms independent mobile 390px and desktop 1365px process exit 1, plus original mandatory browser step exit 1. No assertions altered.
- No=4941 original body, attachments, issue/effective date, and loan-rule effect still unverified/BLOCKED; Evidence Lock unchanged. Regression covers §10 seven purposes, privacy 69, contextual privacy 12 at smoke level; not comprehensive privacy certification.
- Final **NO-GO**; no merge, deploy, new PR or production URL change.

## Dedicated menu geometry assertions — 2026-10-14

- Baseline `4be135bd7e0867a9344d1c6e170af3a2db8ba52e` identical to PR branch. Share KB `38528731925` PASS, Regression `38528731919` PASS, E2E `38528731956` FAIL.
- Inspected CSS: `.reading-current .follow` uses `position:sticky;bottom:8px;max-height:155px;overflow:auto`. Screenshot alone cannot prove the sticky element blocks an interactive loan choice; do not claim a UI defect without geometry/interception evidence.
- Commit `5f278d31c4425693787716437de4a90012b5f816` adds `LOAN_NAV_GEOMETRY` output and two extra assertions for 8 visible loan menu button rectangles within their menu bounding box, for both independent viewport runs. Original assertions remain unchanged, and Evidence Lock unchanged. This geometry test is not yet a click-interception test; a separate hit-target assertion may be needed if overlap is confirmed.
- New CI on code HEAD: E2E `38528935333` IN_PROGRESS, Regression `38528935367` IN_PROGRESS, Share KB `38528935331` IN_PROGRESS at writing.
- Original No=4941, attachments, dates and impact remain BLOCKED. §10 seven purposes, privacy 69, contextual privacy 12 last verified smoke PASS, not full certification. Final **NO-GO**. No merge/deploy/new PR/production URL change.

## Menu geometry confirmed and hit-target follow-up — 2026-10-14

- Baseline HEAD `16a072bdc9e63c7b1562fc1b4872a54655589cff` matched branch. E2E `38528935333` FAIL job `115735840257`, artifact `11876479318`; Regression `38528935367` PASS and Share KB `38528935331` PASS. Newer docs-only HEAD runs: E2E `38528984417` FAIL, Regression `38528984332` PASS, Share KB `38528984364` PASS.
- Logs `LOAN_NAV_GEOMETRY` show 8 buttons inside menu bounds at both 390px and 1365px; `sticky:[]` for queried `.reading-current .follow`. This **does not prove** no overlay intercepts clicks, but disproves earlier inference of clipping based on screenshot alone. Both viewport runs still fail original 300,000 baht / 36-installment assertion due to No=4941 PENDING_DOCUMENT.
- Commit `d52ef8c863bb8f4f4087b581b30182a011f3ce75` adds `LOAN_NAV_HIT_TARGET` diagnostics and assertions that every on-screen loan choice center resolves to its own button or descendant, using `document.elementFromPoint`. Offscreen buttons are not treated as blocked. Existing assertions unchanged. New CI results **NOT YET VERIFIED** at this documentation update.
- No=4941 original content/attachments/dates/loan-rule impact remain BLOCKED; Evidence Lock preserved. Seven ordinary §10 purposes, privacy 69 and contextual privacy 12 regression smoke PASS previously, not full authorization certification. Final **NO-GO**; no merge/deploy/new PR/production URL change.

## Verified viewport geometry and hit-target gate — 2026-10-14

- HEAD `16a072bdc9e63c7b1562fc1b4872a54655589cff` identical to branch at start. Share KB `38528984364` PASS, Regression `38528984332` PASS, E2E `38528984417` FAIL.
- Inspected actual E2E Job `115735840257` (run `38528935333`) and screenshot artifact `11876479318` (773569 bytes). `LOAN_NAV_GEOMETRY`: Mobile 390 menu x=25..365, y=2041.83..2258.02, eight buttons entirely within bounds; Desktop 1365 menu x=329.5..1035.5, y=1570.39..1682.98, eight buttons entirely within bounds. Both `sticky:[]` for the tested selector. No evidence of button clipping in those traces. Geometry alone does not prove a pointer click cannot be intercepted.
- Commit `8484fb855f2c3e20d0ec9414ddddb586893d0ecf` adds eight separate pointer-center hit-target assertions per viewport, after scrolling each button into view, without modifying or disabling any existing assertion. CI triggered by code change; results pending at documentation update.
- `LEISURE_EVIDENCE_DIAGNOSTIC` remains `PENDING_DOCUMENT` for No=4941 with `announcementDate:null` and `effectiveDate:null`; both viewport processes exit 1 on unchanged original leisure answer assertion. No verified original notice or attachments, so keep Evidence Lock and BLOCKED.
- §10 seven purposes, privacy 69 and contextual privacy 12 remain regression smoke checks; prior Regression PASS. Final **NO-GO**. No merge/deploy/new PR/URL change.

## Hit-target E2E result — 2026-10-14

- Baseline `1dfb91705c9218f1132725ba208f3e3d386f75c5` matches branch. E2E run `38529199104` FAIL, job `115736697440`, screenshot artifact `11876898851` (780132 bytes); release gating failure persists. Regression `38529199093` and Share KB `38529199121` PASS.
- Job logs explicitly report `LOAN_NAV_HIT_TARGET` with `hit:true`, `topTag:BUTTON`, `topClass:chip` for each of the eight buttons at 390px and 1365px after scrolling into view (16/16 PASS). Before scrolling, all buttons are below the visible viewport; that is normal page scrolling, not clipping. No demonstrated sticky interception; no CSS change warranted.
- `LEISURE_EVIDENCE_DIAGNOSTIC` remains `PENDING_DOCUMENT` in both viewports; original mandatory leisure amount/term assertion still fails. No=4941 original content, attachments, announcement/effective dates, and rule impact not verified. Maintain Evidence Lock and BLOCKED.
- CI on previous documentation HEAD `1dfb91705c9218f1132725ba208f3e3d386f75c5`: Share KB `38529223940` PASS, Regression `38529224074` PASS, E2E `38529223904` was IN_PROGRESS when checked. Ordinary loan §10 seven purpose checks, Privacy 69 and contextual Privacy 12 are regression smoke tests; do not infer full privacy certification.
- Final **NO-GO**. No new PR, merge, deploy, weakened assertions or changed production URL.

## Latest PR #136 release-gate verification — 2026-10-14

- PR #136 is OPEN, NOT MERGED; starting HEAD `aff455e50898390e1cef8aae8f95b5e002f72c16`.
- Latest CI on starting HEAD: Regression `38529398077` PASS, Share KB `38529398062` PASS, E2E `38529398084` FAIL. E2E job `115737346973`; artifact `11876784626` (780132 bytes).
- E2E job logs: 24 per-button `LOAN_NAV_HIT_TARGET` results across independent 390px, 1365px and mandatory 390px runs; every result `hit:true`. No supported CSS hit-target defect. All three browser runs exit 1 on unchanged leisure-loan assertion because the response says pending official document, not the asserted amount/term.
- Official No=4941 page `https://www.dlasavingcoop.com/show.php?No=4941` inaccessible via available web reader on this verification. No primary body, attachments, issue/effective dates, or impact confirmation. Retain Evidence Lock and BLOCKED; do not infer policy impact from indexed title.
- §10 seven purpose cases, Privacy 69 and contextual Privacy 12 remain PASS at regression-smoke scope only. No test assertions weakened; no policy code change, new PR, merge, deploy or URL change.
- **Final NO-GO** until source authority review and browser release gate are both resolved.

## No=4941 source verification and latest CI — 2026-10-14

- Starting HEAD `594e85a8fb26d1e10178b252cefade5bbd483b11`; PR #136 OPEN, NOT MERGED.
- Latest CI: Share KB `38530995434` PASS; Regression `38530995463` PASS; E2E `38530995806` FAIL, job `115742583634`, screenshot artifact `11878316018` (780132 bytes).
- Browser job log has 24 button hit-target observations with `hit:true`; independent mobile 390px, desktop 1365px and mandatory mobile smoke all exit 1 due to unchanged leisure-loan amount/term assertion while the response is `PENDING_DOCUMENT`.
- Public official site index `https://dlasavingcoop.com/index.php` displays title `[ประกาศ] ผลการคัดเลือกบริษัทประเมินหลักทรัพย์`. The primary No=4941 page `https://www.dlasavingcoop.com/show.php?No=4941` remains inaccessible to the web reader. Independent official historical special-loan PDFs (e.g. `https://www.dlasavingcoop.com/coop/ckeditor/system/plugins/ckfinder/upload/files/FromHome01_20210122.pdf`) reference appraisal companies for secured home loans, suggesting a *possible* category association, not evidence of No=4941's actual provisions, date, attachments, or its effect on leisure loans. Do not reclassify or unlock on this inference.
- Original notice body, attachments, announcement/effective dates and scope remain BLOCKED. Preserve Evidence Lock, no policy-code change or assertion relaxation. Ordinary loan §10 seven purposes, Privacy 69 and contextual Privacy 12 remain PASS at regression smoke scope.
- Final **NO-GO**. No new PR, merge, deploy or production URL change.

## Current CI and primary-source recheck — 2026-10-14

- Starting PR HEAD `088d1c9a4427cd9a26d98a688ac139105218e7c7`, OPEN and NOT MERGED.
- CI on this SHA: Share KB `38534971999` PASS, Regression `38534972108` PASS, E2E `38534972036` FAIL. E2E job `115755528861`, screenshot artifact `11879947410` (780132 bytes).
- Job logs: all 24 `LOAN_NAV_HIT_TARGET` observations report `hit:true`; independent Mobile 390px, Desktop 1365px and mandatory Mobile E2E fail on unchanged leisure-loan answer assertion while official-document gate is pending.
- Official homepage `https://dlasavingcoop.com/index.php` currently indexes `[ประกาศ] ผลการคัดเลือกบริษัทประเมินหลักทรัพย์`; official No=4941 full-text `https://www.dlasavingcoop.com/show.php?No=4941` was attempted again but web reader returned inaccessible. Original body, attachments, announcement/effective dates and actual loan-rule impact **NOT VERIFIED / BLOCKED**. No Evidence Lock bypass or assumption from title.
- Regression PASS is evidence of suite execution; seven §10 purposes, Privacy 69 and contextual 12 are smoke coverage, not exhaustive certification. No verified source change or code root cause warrants altering policy or CSS.
- Final **NO-GO**. No weakened assertions, new PR, merge, deploy or production URL change.

## New official leisure-loan source discovery — 2026-10-14

- Starting PR HEAD `a090879aabaf61861a61c63b3b38b7562f697eba`. CI Regression `38535309741` PASS; Share KB `38535309797` PASS; E2E `38535309909` FAIL.
- Official cooperative page `https://dlasavingcoop.com/show.php?No=774` directly lists three leisure-loan resources: (1) official summary image `https://dlasavingcoop.com/coop/ckeditor/system/plugins/ckfinder/upload/files/holiday.png`; (2) `ประกาศหลักเกณฑ์เงินกู้สามัญเพื่อการพักผ่อน พ.ศ. 2568` at `https://drive.google.com/file/d/1VrfsYKIYmdc21p2nGSMtz0oBYkdd0dSu/view?usp=sharing`; and (3) leisure-loan application at `https://drive.google.com/file/d/1qC30WEF9YTq1oo-M0r8sySLg2J2uNoIL/view?usp=sharing`.
- These are authoritative **source locators**, not verified contents. Web reader could not retrieve the image/PDF bodies; Facebook official page could not be read. Amount, term, qualification, issue/effective date and any 2569 amendment interaction remain NOT VERIFIED. Do not unlock or overwrite rules from a document title alone.
- Distinguish the leisure-specific 2568 announcement from No=4941 (indexed as appraiser-company selection). No=4941 full text/attachments still unverified; do not assume it has or lacks any loan-rule impact.
- **BLOCKED / NO-GO** pending primary content access and re-running unchanged E2E assertions. No code/policy change, weakened tests, new PR, merge, deploy or production URL change.

## PRIMARY SOURCE VERIFIED: Leisure ordinary loan rules 2568 (2-page signed scan) — 2026-10-14

- Primary PDF fetched through connected Google Drive: `https://drive.google.com/file/d/1VrfsYKIYmdc21p2nGSMtz0oBYkdd0dSu/view`, filename `(หลักเกณฑ์ฯ)คุณสมบัติผู้ขอกู้.pdf`, 2 scanned pages. Both pages visually inspected. Issued 1 Nov 2568, effective 1 Dec 2568 (clause 2).
- Clause 3: ordinary or associate member at least 12 consecutive months; salary/wages continuously at least 12 months; shares and debt payments by payroll deduction or cooperative-approved method; cremation association membership except associate members; no guarantor obligations to other cooperatives.
- Clause 4.1: not above THB 100,000 and not above 90% of net share capital after deducting guarantee liabilities, subject to committee-defined lending envelope. Clause 4.2: maximum 12 installments, age not above 75 years. Clause 4.3: submit tour-company receipt within 30 days after returning; failure triggers ordinary-loan interest and reclassification. Clause 6: 4.25% annual interest, no patronage refund. Clause 5: travel booking/receipt and itinerary supporting documents.
- The independently fetched cooperative leisure application `https://drive.google.com/file/d/1qC30WEF9YTq1oo-M0r8sySLg2J2uNoIL/view` confirms maximum 12 installments and travel documentation, but is a form, not the rulemaking instrument.
- Existing browser E2E `scripts/browser-leisure-loan-smoke.mjs` expects THB 300,000 / 36 installments and an older Google Drive rule ID `1PlpK5Cprkz3NV5ey23Ix60Uo10F7IlFS`; those expectations **conflict with the verified 2568 source**. Also check old claims about guarantor and 15%/6,000 income rather than automatically adopting them. Existing source-registry PENDING_DOCUMENT for No=4941 and any superseding 2569 amendment remain separate evidence gates; do not bypass the lock until scope and effective-version checks are complete.
- This entry documents a verified mismatch, **not** an authorization to disable or relax assertions. Replace outdated expectations only with explicit new positive source-based assertions after verifying source hierarchy and implementing correct rule/answer. No code/test change in this commit. E2E remains FAIL, release **NO-GO** pending implementation and source-scope verification.

## User-confirmed 2569 leisure-loan infographic — 2026-10-14

- The user explicitly confirmed the uploaded infographic `IMG_1395.jpeg` as the reference for leisure-loan content. It is branded `สหกรณ์ออมทรัพย์องค์กรปกครองส่วนท้องถิ่น จำกัด`, titled `เงินกู้สามัญเพื่อการพักผ่อน — สรุปหลักเกณฑ์ พ.ศ. 2569`. Record its provenance as **user-supplied infographic**, not as a verified signed regulation or the inaccessible No=4941 announcement.
- Infographic explicitly states maximum principal **THB 300,000**, maximum repayment **36 installments**, interest **4.25% per year**; member at least 12 months, continuous shares at least 12 installments, residual monthly income at least 15% and THB 6,000, and loan repayment by age 75. Also references tourism proof within 30 days after return and other conditions.
- The older Drive application PDF states **up to 12 installments**, creating a document-version conflict. User approval establishes the infographic as a content reference for QA but does not alone verify the governing signed 2569 announcement's effective date, amendment hierarchy, or all eligibility conditions. Keep source/effective-date uncertainty explicit.
- Do not falsely mark No=4941 as read or unlock the full Evidence Lock based solely on infographic. Existing E2E expected 300,000/36; source supports those *stated* figures, but gate logic and policy precedence still need verified implementation and full regression. No assertions weakened; no merge or deploy. **NO-GO** pending source/version resolution.

## Latest QA and source-hierarchy decision — 2026-10-14

- Starting HEAD `a7f5b178487273fe48bd4e6fa6e5b55da1f7aa39`, PR OPEN. CI Share KB `38536489516` PASS, Regression `38536489463` PASS, E2E `38536489608` FAIL; job `115760509330`, diagnostic artifact `11880256747`.
- Browser smoke source `scripts/browser-leisure-loan-smoke.mjs` contains **positive** 300,000/36 assertions and separate document link, qualification, evidence and interest-rate assertions; do not delete or weaken them. The failure is the application returning a pending-document gate, not proof that the 300,000/36 expectation is wrong.
- User-confirmed 2569 infographic supports the stated 300,000/36/4.25% publicity values; older signed-form text explicitly caps installments at 12. Full signed 2569 governing instrument, effective date, supersession and No=4941 full content remain unverified. The registry explicitly requires authority/version/effective-date review and `noAutomaticRulePromotion: true`.
- **Root cause at governance level**: conflicting effective-version evidence and unverified notice scope. Not authorized to force-promote infographic over a signed instrument, alter source-monitor status or bypass Evidence Lock. No defensible code patch at this evidence level. Smoke suites PASS do not equal a complete substantive 69+12 privacy audit.
- Final **NO-GO**. No code/test changes, no assertion reductions, no merge, deploy, new PR or production URL changes.

## Root-cause clarification from current source registry — 2026-10-14

- At HEAD `762a160d96379bade89a427e48848286e3d6ce08`, the existing `data/official-source-registry.json` ALREADY contains `doc-5c893b2d819d747e4a6c`: 2569 signed leisure-loan criteria, original PDF `https://drive.google.com/file/d/1PlpK5Cprkz3NV5ey23Ix60Uo10F7IlFS/view`, announcement 2026-09-30, effective 2026-10-01, `primaryBytesVerified:true`, `status:CURRENT`, hash `9a3d752a24f829e7b414ddc5e7082ba11492a6e4c0eaccc7493a3908b6861632`.
- Rule `leisureLoanCurrent@2026-10-01` is `VERIFIED_PRIMARY` and already encodes max THB 300,000, max 36 installments, age 75, membership 12 months, continuous shares 12 installments, residual income 15%/THB 6,000, travel evidence 30 days, and collateral conditions. This aligns with the user-confirmed 2569 infographic. Prior descriptions saying the signed 2569 instrument was not in the repository were incomplete: its *recorded prior primary verification* exists. A fresh independent read of those bytes has not been performed in this round.
- `index.html` already contains detailed member-facing leisure answers, but the global `PENDING_DOCUMENT` gate can supersede them before they render. This is the confirmed code-path cause of the observed browser failure. The No=4941 primary document/scope remains unverified; do not weaken the global gate or mark that notice irrelevant merely by its indexed title. Distinguish a source already verified in registry from a separately pending document.
- CI for starting SHA: Share KB `38536489516` PASS, Regression `38536489463` PASS, E2E `38536489608` FAIL; job `115760509330`, artifact `11880256747`. No changes to source, test assertions, merge or deploy. **NO-GO** until scoped pending notice is resolved or a formally verified source-specific non-eligibility answer is implemented and tested.

## Verified root-cause refinement — 2026-10-14

- Read `index.html` functions `documentScope`, `pendingFor`, `gate`, `freshnessStatus`, and `leisureLoanAnswer` against registry at HEAD `7c22dac737847b392eb60f6acc5fee18dec1ad53`.
- **Important correction to earlier diagnosis:** registry currently has **zero** records matching `status=PENDING && mayAffectRules===true`; therefore `pendingFor` cannot itself explain a PENDING_DOCUMENT response on this HEAD. The previous statement that No=4941 was definitively blocking via `pendingFor` was unproven. Do not alter `documentScope` or bypass Evidence Lock without a reproducing trace. The observed E2E failure needs investigation of fixture/runtime registry or other gating conditions (including stale monitor/primary checks).
- Current leisure-loan rule `leisureLoanCurrent@2026-10-01` is already `VERIFIED_PRIMARY` with 300000/36; member answer includes these values. Interest 4.25% appears only as user-confirmed 2569 infographic, and the existing answer intentionally qualifies it against the signed rule's interest clause. A source-attributed publicity summary can report the image's 4.25% while preserving effective-rate uncertainty, but this has not yet been implemented or independently tested.
- **NO-GO**. No source/test modification or new test run in this step. Preserve assertions and no merge/deploy.
