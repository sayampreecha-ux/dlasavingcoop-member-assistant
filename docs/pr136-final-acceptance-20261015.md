# PR136 final acceptance, 2026-10-15

## Baseline and policy
- Starting PR HEAD: 490b389ca6373e613629ed93ade84541bf23f986.
- Main: 300b9318c4208dae54e713449a0dafb68c4e07b2.
- Existing exact-HEAD CI retained, not rerun: Regression 38652206272; Share KB 38652206484; E2E 38652206273, all success.
- Existing browser artifact 11935355768, SHA256 77741eebf2bba3f1934e1228db4fdb0c7ac76d301e337003727bd6185d2796fb.
- GitHub GET branches/main reports protected=false, protection.enabled=false, required_status_checks.enforcement_level=off, contexts=[], checks=[]. GET rulesets returns []. GET pulls/136/reviews returns []. No settings were changed. Direct administration-only protection endpoint returns 403 Resource not accessible by integration; this is not interpreted as absence of protections. The branch metadata and ruleset response are the policy evidence.
- Cloud Browser independently opened the PR and confirmed draft, no reviews, no deployments. Its GitHub session is signed out.

## Confirmed defect and fix
The query `กู้สามัญใช้ทุนเรือนหุ้นเป็นหลักประกัน` reached the general ordinary-loan collateral answer, including the 90% real-estate appraisal limit. The existing `หุ้น.*ค้ำ|ค้ำ.*หุ้น` check only recognized the other wording. Extend that narrow predicate to recognize หลักประกัน in both directions. Keep the existing safe unknown-rule answer and all original assertions. Do not add an authoritative share-backed limit from publicity.

After the fix, local `node scripts/verify-release.mjs`: 54 suites passed, none skipped. Its generated legacy execution file was restored, not committed. Full CI is required on the changed HEAD; the old results are not presented as new results.

## Additional browser gate
`scripts/browser-pr136-release-acceptance.mjs`: 17 physical UI scenarios at 390px and 1365px, with unmodified asynchronous source monitor. Covers the nine requested loan categories, flood/fire welfare, share-collateral synonyms and real-estate negative control, publicity attribution, historical Evidence Lock, private approval refusal, answer text and source/navigation links. Saves 34 screenshots and structured answers/links. Added after existing browser suites; no old test removed or weakened.

This validates bounded guidance and safe locks, not individual eligibility, nor the truth of unresolved primary terms. OWNER_APPROVED_PUBLICATION_EVIDENCE remains accepted as supplemental publicity evidence under the recorded exception. Existing binding-rule locks remain. External document availability is separate from link presence.

## Merge safety
Before code change, `git merge-tree --write-tree origin/main HEAD` succeeded without conflicts, tree 70c036867bc7faa426a5fccf842e75afa1c49f29. Resulting `data/current-events.json` blob 1681e4bba264ae9e6742b20c54a58a7a44dc831d equals Main. This created only a local synthetic tree, not a merge commit or remote merge. Recompute for final HEAD. Never deploy the PR branch directly.

## Release checklist and rollback
- [ ] Final HEAD CI and supplemental browser results verified, artifacts linked.
- [ ] Review all supplemental answers and distinguish external link availability from href checks.
- [ ] Final synthetic merge preserves current Main events blob; recheck refs before release.
- [ ] All unresolved acceptance limits explicitly recorded; only then mark Ready for Review.
- [ ] Separate owner authorization before merge and deployment to the unchanged production URL.
- On authorized release, record pre-merge Main, last successful Pages deployment and deployed commit. Use normal reviewed merge; verify events blob again before deployment.
- After release, test loan navigation, welfare, privacy and Desktop/Mobile. On P0 failure stop rollout and restore the last verified deployment through normal reviewed rollback. No force push, no replacement of Main events with the PR snapshot.

Disposition at this commit: browser/changed-HEAD CI PENDING. No merge/deploy, no Ready claim.

## CI closure evidence — 2026-10-15 (verified on b18a2a153814879367ba634a0c3b5e2822340464)
- Regression run 38662780550: SUCCESS.
- Share KB 2569 run 38662780532: SUCCESS.
- E2E Member Answer Engine run 38662780536, job 116187693001: SUCCESS.
- Release gate 54 suites passed, none skipped; PR136 physical browser acceptance 34 total, 0 failed (390px and 1365px). Prior guarantor wording failures resolved in index.html; Evidence Lock remains in place.
- Browser evidence artifact 11940190107 (sha256 ec13aa807dc5680ad1d77fa3bece9d9e2c5902e2099ccf7d9401f4d41500728e); independent leisure diagnostics artifact 11939581852 (sha256 8179b1a3459057be135ef254c24ebb91ebd811e3c020e3f4e3c338a18a6bb2bb).
- GitHub connector reports PR mergeable=true, draft=true, reviews=[]; these do NOT establish branch policy requirements. Branch Protection / Rulesets / Required Checks policy remains NOT VERIFIED in this connector session.
- Current Main data/current-events.json blob 1681e4bba264ae9e6742b20c54a58a7a44dc831d; PR branch blob 17ee0f37494088359e585631faa9e06990e60938; file absent from PR changed paths. Standard three-way merge must preserve Main's blob. Final synthetic merge after latest commit NOT TESTED.
- Source metadata remains separate from binding financial rule verification; pending source items remain subject to Evidence Lock. External PDF page-by-page independent revalidation and production smoke remain NOT TESTED in this execution.
- Final disposition: FUNCTIONAL CI PASS; RELEASE NO-GO pending branch policy verification, final merge-safety verification, source/acceptance review and separate owner authorization. No merge or deployment.

### Rollback controls for separately approved release
Record Main SHA, last successful Pages deployment ID, deployed commit and current-events blob before merging. Deploy from approved Main only; smoke-test loan categories, welfare, privacy and mobile/desktop. On P0, halt rollout and restore last-known-good via reviewed procedure without force push or overwriting current-events.

## Official website publication policy — 2026-10-15
Owner policy: the cooperative's official website is the primary publication source regardless of format (PDF, image, infographic, news, table, or text). Facebook is supplementary publicity, not a primary authority for changing binding loan rules. Official publication is evidence of what the cooperative published, but not automatically proof of binding legal authority or every eligibility clause. Do not require a fresh PDF/signature check when a sufficient official publication and auditable previously verified evidence already establish the specific answer. Keep question-scoped Evidence Lock for missing or conflicting binding conditions; retain wrong-year 2023 duplicate as PENDING. `scripts/official-freshness.js` now exposes `officialPublication(doc)` independently of `primary(doc)` for this distinction. This change alone does not reclassify any registry item or relax numeric rule locks.

**Validation status:** new code commit `d430c8839da9af8ea8594afb9307230bc9c7c842` awaits CI; prior 3/3 successes belong to `91b45527117bb4a521a45e3471ee08fd9ebe622b` only. GitHub policy and latest synthetic merge remain unverified; no merge/deploy. Rollback: revert the single official-freshness.js commit through a reviewed PR-branch commit if it causes regressions, keeping Main and current-events untouched.


## Final CI verification — 2026-10-15 (HEAD 515fb4c1c778cb48bd3b750e203ab557f8b9b066)
- Canonical `scripts/official-freshness.js` was synchronized into generated `index.html` at commit `515fb4c1c778cb48bd3b750e203ab557f8b9b066` after the earlier freshness mismatch. No test assertions were removed.
- Regression run [38669816402](https://github.com/sayampreecha-ux/dlasavingcoop-member-assistant/actions/runs/38669816402): SUCCESS.
- Share KB run [38669816369](https://github.com/sayampreecha-ux/dlasavingcoop-member-assistant/actions/runs/38669816369): SUCCESS.
- E2E Member Answer Engine run [38669816396](https://github.com/sayampreecha-ux/dlasavingcoop-member-assistant/actions/runs/38669816396), job 116210039349: SUCCESS; all GitHub job steps SUCCESS, including install browser runtime, independent 390px mobile and 1365px desktop diagnostics, Pilot browser regression and scoped member-answer acceptance.
- E2E artifacts: `leisure-independent-browser-diagnostics` ID 11944640065; `pr136-member-answer-acceptance` ID 11944635149. Artifact presence verified; individual screenshot contents and detailed privacy assertions not independently inspected in this connector session.
- Registry already contains ordinary amendment 5/2569 (`doc-fbfe47014336a2cb94f8`), emergency amendment 2/2569 (`doc-f63c6860836344db8a78`), special amendment 3/2569 (`doc-89e8283abdd6fffa6356`), and leisure criteria 2569 (`doc-5c893b2d819d747e4a6c`, original Google Drive ID `1PlpK5Cprkz3NV5ey23Ix60Uo10F7IlFS`), all marked CURRENT. No duplicate created; mismatched-year `doc-4510c4fa1d9e18f4bfb9` remains PENDING. The leisure announcement text was read through the connected Google Drive source: promulgated 2026-09-30, effective 2026-10-01.
- GitHub PR reports `mergeable=true`, `draft=true`; `main...HEAD` compare 78 ahead / 2 behind and does not list `data/current-events.json` as changed. This is **not** a completed final synthetic merge test. Branch Protection, Rulesets, Required Checks and review requirements remain NOT VERIFIED with available connector actions.
- **Decision:** Functional CI PASS for the tested HEAD; final release approval gate remains BLOCKED on repository policy verification and final synthetic merge / Main event-blob preservation. Do not merge or deploy. Reverify CI on this documentation-only successor HEAD if GitHub requires exact-SHA checks. Keep PR draft until release governance is satisfied.


## Owner-reported cross-menu acceptance follow-up — 2026-10-15

- HEAD `4ef2c4e1d6bb1cc72ed126f61f112fac225087fa` adds four exact-question browser acceptance cases to `scripts/browser-pr136-release-acceptance.mjs`, evaluated at both 390px and 1365px: leisure loan 300,000 THB; emergency membership 3 months; monthly shares 5,000 THB; childbirth welfare 1,000 THB. These cases prohibit a blanket evidence-lock response. Prior assertions remain intact.
- Runs: Regression `38671571265` SUCCESS; Share KB `38671571231` SUCCESS; E2E `38671571230` IN_PROGRESS at verification. E2E job `116215653943`: independent browser diagnostics mobile/desktop SUCCESS, Pilot browser regression IN_PROGRESS, scoped member-answer acceptance PENDING. Only artifact so far: `leisure-independent-browser-diagnostics` ID `11943773702`; **no owner-question results.json evidence yet**.
- A request to retrieve live job logs returned 404 BlobNotFound; this is not evidence that a test failed. Do not claim owner questions PASS or FAIL until E2E completes and its artifact/logs are inspected.
- `main...HEAD` comparison: 80 ahead / 2 behind, no `data/current-events.json` in changed files. No submitted PR reviews. Branch Protection, Rulesets, Required Checks, final merge simulation, and production smoke test remain NOT VERIFIED.
- Root cause remains open for the reported production-wide Evidence Lock across loans, shares, welfare. The embedded canonical registry has no PENDING records with `mayAffectRules=true`, while the runtime accepts monitor snapshots and applies shared freshness gating; investigate actual browser answer outputs and snapshot state before changing guard logic. Do not weaken evidence or privacy gates without focused negative tests.
- **Decision: NO-GO / BLOCKED** pending exact-question acceptance and repository release controls. PR stays Draft. No Main edits, merge, deployment or production URL change. Rollback: preserve current Main/Production, revert only the PR fix commit(s) on the PR branch if regressions are demonstrated; retain original tests and registry provenance.


## Follow-up CI verification and merge governance — 2026-10-15

- Tested PR branch HEAD `449a6c5fc7f948b1ce32479167fd075ed5d1cf65` (Draft, GitHub reports mergeable true). Regression run `38672877751` SUCCESS; Share KB run `38672877802` SUCCESS. E2E run `38672877807` job `116219812807` IN_PROGRESS at inspection; independent mobile 390px and desktop 1365px diagnostics SUCCESS; Pilot regression IN_PROGRESS; scoped member answer acceptance PENDING. Available artifact: `leisure-independent-browser-diagnostics` ID `11944688879`. Do not infer final E2E PASS or inspect nonexistent results.json.
- Earlier run `38672321512` on preceding HEAD `e28e45f4...` had scoped acceptance 42/42 PASS, including the four owner questions and privacy, but logs exposed an `href="undefined"` for the shares action. PR fixes followed in commits `d5387e5e...` (new browser assertion for undefined/NaN link text) and `449a6c5...` (shares action now points to verified rule source). Final link href verification remains NOT VERIFIED until the latest E2E completes. Link href negative assertion is not yet part of the test script.
- Compare main...PR: 85 ahead / 2 behind, `data/current-events.json` absent from PR changed files; no submitted reviews. This does not prove final synthetic merge or repository policy compliance. Branch Protection, Rulesets, Required Checks and final merged-tree test NOT VERIFIED through available GitHub connector operations.
- **Decision: NO-GO / PENDING E2E AND MERGE POLICY**. Do not merge, deploy, change Main, alter production URL or create a new PR. Rollback: keep Main/production unchanged; if a regression is proven, revert the minimal PR-only commits and rerun complete acceptance without weakening existing assertions.


## Final E2E evidence and release-governance closure attempt — 2026-10-15

- Verified HEAD before documentation update: `f457f23d80503cc8b7015d2200db7861f81165bc`. GitHub Actions: Regression `38673201221` SUCCESS; Share KB `38673201331` SUCCESS; E2E `38673201216` SUCCESS (job `116220827454`). All independent 390px/1365px browser diagnostics, Pilot browser regression, and scoped member answer acceptance completed SUCCESS.
- Retrieved job logs directly: `PR136_ACCEPTANCE {"total":42,"failed":0}`. Four owner questions PASS at both widths: leisure 300,000 THB, emergency membership 3 months, monthly shares ceiling 5,000 THB, childbirth welfare 1,000 THB. Historical evidence lock and privacy personal-loan-approval handoff PASS on both widths. Share rule action link is now an actual official Google Drive URL rather than `undefined`.
- Artifact `pr136-member-answer-acceptance` ID `11944699849` and `leisure-independent-browser-diagnostics` ID `11945361624` present. Acceptance artifact ZIP successfully downloaded through connector, but the ZIP's `results.json` was not separately parsed in this session; per-case outcomes above are independently verified from full GitHub job logs. Combined commit statuses endpoint returned empty `statuses` (this does not negate the successful GitHub Actions workflows, and does not identify configured required checks).
- GitHub PR Draft; `mergeable=true`, but mergeable is not a proof of protected-branch compliance. No submitted PR reviews. Main comparison 86 ahead / 2 behind; `data/current-events.json` not in PR changed files. Branch Protection, Rulesets, required-check configuration, synthetic merge, and event blob preservation post-merge NOT VERIFIED with available connector operations.
- **Final decision: Functional acceptance PASS; Release governance BLOCKED / NO-GO, NOT READY FOR OWNER APPROVAL.** No Main modification, merge, deployment, production URL change, or new PR. Rollback: Main and Production remain unchanged; if a regression arises, revert the smallest affected PR commits, preserve tests and verified source registry, rerun the complete suite and recheck Main's `data/current-events.json` before seeking approval.


## Release governance verification checkpoint — 2026-10-15 (HEAD 5dcaf4b)

- HEAD `5dcaf4b0a26bdb9a3d4f08b95097cd00d07b8dbe` verified on Draft PR #136. Regression run `38679359472` SUCCESS; Share KB run `38679359424` SUCCESS; E2E run `38679359413` job `116240121953` IN_PROGRESS when checked. Mobile/desktop Pilot regression was still running; scoped acceptance pending. Artifact `leisure-independent-browser-diagnostics` ID `11946777862` present, final member answer artifact not yet available.
- PR mergeable=true as reported by GitHub, but still 87 commits ahead and 2 behind Main. No submitted PR reviews; no review threads. `data/current-events.json` not in changed-file list. GitHub combined status API returned an empty statuses list; no positive proof of required-check configuration.
- Connector currently exposes no read action for branch protection/rulesets/required checks. Thus Branch Protection, Rulesets, Required Checks, synthetic merged-tree safety and post-merge preservation of Main's `data/current-events.json` remain **BLOCKED / NOT VERIFIED**; GitHub's mergeable=true must not be interpreted as full policy compliance.
- **Release decision: NO-GO, NOT READY FOR OWNER APPROVAL.** Preserve Main and production; do not merge/deploy or create new PR. Rollback plan: no production rollback needed while Main is unchanged; for any future approved release, retain pre-merge Main SHA and `data/current-events.json` blob SHA, compare after merge and revert only the approved merge if release smoke tests fail, subject to owner authorization.
