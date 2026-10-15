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
