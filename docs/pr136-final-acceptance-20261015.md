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
