# Mass Acceptance status — 7 October 2026

**Release decision: BLOCKED. This is not a completed 3,378-case acceptance report.**

The existing private CSV was recovered with exactly 4,030 records. All 4,030 were executed through the actual Member Answer Engine in a local VM. They include questions, answers, announcements, and conversation. Automated flags from this exploratory run are not semantic PASS/FAIL judgments of member questions.

The canonical row-level classification manifest for 1,832 standalone questions and 1,546 personal/live questions was not found. Prior conversation describes a private corpus hash beginning `e930bd64`, but the available CSV has SHA-256 `fee162d3cabcfaf66c5c36f01a87ba4ff27914549ac28e2833f7a3dd3be8fbbd`. The prior subset must not be recreated by padding, arbitrary exclusion, or assigning categories to reach target counts.

Raw chat and the 4,030-record working corpus remain private. No raw corpus, member records, private URLs, or per-member results are in this PR. The new regression cases paraphrase failure patterns and contain no member identifiers.

## Executed exploratory baseline and changes

The first baseline used main `3bdc3bc9e86190c77744aeb3d627dfcaa250d8e1`: 4,030 executed; 3,195 without automated flags; 835 flagged; 828 fallback; 7 personal/live routing review candidates.

During this task PR #77 was merged externally. The working branch was rebased to main `3e6cdb8a6ee11d184d96d4d4591c24b43288539e`, preserving its source changes and all added gold tests. A new baseline was executed on that exact source before measuring this PR's changes.

| Automated exploratory indicator | PR #77 baseline | This PR |
|---|---:|---:|
| Executed records | 4,030 | 4,030 |
| Records without flags, not semantic PASS | 3,210 | 3,679 |
| Flagged records, not canonical FAIL | 820 | 351 |
| Empty answers | 0 | 0 |
| Generic fallback | 813 | 345 |
| No actions, sources, or follow-up | 0 | 0 |
| Listed unsafe certainty phrase candidates | 0 | 0 |
| Personal/live routing review candidates | 7 | 6 |
| Missing-source review candidates | 0 | 0 |

Zero phrase candidates does not establish zero fabricated data or zero ungrounded rule answers. Those require the canonical manifest and reviewed per-case content/destination expectations. Remaining fallback cannot be dismissed as non-questions without reviewing source classification. No systematic-fallback acceptance claim is made.

## Baseline failure clustering

Primary clusters are deterministic triage buckets, counted once per flagged record. They are not adjudicated root causes for every record.

| Cluster | Count |
|---|---:|
| Status / follow-up wording | 160 |
| Short product / spoken language | 124 |
| Document request / missing context | 193 |
| Personal/live routing review | 7 |
| Insurance | 8 |
| Payment / shares / deposit | 17 |
| Unknown or non-question review | 311 |
| Total | 820 |

## General fixes

- Recover operational status questions only after existing routes fail; use official self-service and staff, without claiming receipt, approval, or a transfer date.
- Reuse established loan routes for abbreviated product questions, and normalize a common missing-tone spelling of the loan verb.
- Separate release of a pledged deposit from the number of personal guarantors. Keep an Evidence Lock pending current contract/release evidence.
- Treat insurance document requests separately from generic member/loan forms; clarify the insurance type and keep missing specific-form mapping locked.
- Preserve the distinction between insurance and `ค้ำประกัน` (guarantee), including the new gold case from PR #77.
- Route short share-payment queries to the existing official payment route.
- Ask the document topic when a short shipping/document question lacks enough context, with next actions.

Added **19 representative regression cases and 2 adjacent-topic checks**. No existing test was reduced, skipped, deleted, or changed.

## Continuation round

The next exploratory execution again covered all 4,030 records through the actual engine: 3,750 without automated flags; 280 flagged, comprising 275 fallback and 5 personal/live routing review candidates. EMPTY, DEAD-END, listed certainty-phrase candidates, and missing-source candidates were all 0. These remain triage indicators, not canonical semantic acceptance.

General routing fixes now also preserve unknown-product credit-bureau concerns before generic loan clarification; separate denial-reason review from document-arrival status; lock withdrawal questions involving pledged deposits; and provide current official next actions for opening/website availability, contact email requests, short transfer-time questions, and debt-relief/appeal inquiries. No current schedule, email address, eligibility, or personal approval outcome is invented. Ambiguous withdrawal questions ask the asset type.

Representative regression now contains **33 cases plus 2 adjacent-topic checks**, all passing. All **15 release suites passed again, none skipped**, including the unchanged OpenChat Gold document-status case. Exploratory testing caught an incomplete response caused by inconsistent entry/recovery predicates; aligning the predicates removed both observed EMPTY cases. No original regression assertion was weakened.

The canonical manifest is still unavailable. This continuation does not authorize merging or deploying PR #78. CI passed on continuation source commit `d0417bec9c1c63ceed52e8b78727279cb3c4fea6`: Regression run 37604025781 and E2E run 37604025803, including completed mobile/desktop browser regression. The Production tab was inspected again and still displays the generic fallback from the earlier synthetic status question; this patch is not deployed and Production acceptance is not claimed.

## Additional recovery and routing round

Two specifically identified uploaded Excel files were materialized privately and inspected. Their SHA-256 hashes are identical (`70aec14345b15534f763827d24b559948f94c18ec966ae349fc84f78cc742d3b`); each contains 69 populated legacy rows with `question_patterns`, `keywords`, and `answer` columns. Neither contains Mass Gate classifications. A targeted search of prior project history also returned only earlier aggregate claims, without a recoverable artifact, row mapping, or reproducible classification methodology. Earlier statements that all 3,378 passed remain unsupported by available execution evidence.

This round adds general normalization for emergency/quality-of-life shorthand, refinance wording, membership typos and loan-form wording. Pure product-form requests now reach the established official product form mapping before generic eligibility; the regression verifies the actual refinance form URL. Phase-specific requests retain Evidence Lock even when a product is named. New recovery routes cover short round/result questions, spaced transfer-time wording, holiday questions, official channels instead of private LINE contacts, and document witness/signature/recipient questions. Concurrent cooperative membership and phase-specific eligibility are locked pending the applicable verified rule. No rule values or private account outcomes were added.

All **52 representative cases plus 2 adjacent checks passed**. All **15 local release suites passed again, none skipped**. The actual-engine exploratory run covered 4,030 records: **3,784 without automated flags, 246 flagged, 241 fallback and 5 personal/live review candidates**. EMPTY, DEAD-END, listed certainty-phrase candidates, and missing-source candidates were 0. Remaining flagged content includes conversation and answers as well as questions; it has not been arbitrarily excluded or counted as semantic PASS. The canonical 3,378 gate still executes 0 because its classified manifest is unavailable.

CI passed on source commit `c71f2ede702bdfddd2d71a9214a9ab988bd0d1a5`: Regression run 37609102425 and E2E run 37609102426, including mobile/desktop browser regression. Merge and deployment remain blocked; no Production acceptance claim is made.

A before/after execution using the exact preceding source `db69fd1` confirms 34 records lost their exploratory flags and no previously unflagged record gained a flag. Grouped by the resulting route: status/transfer timing 10; document execution/topic/product form 8; normalization and established product/member routes 9; debt/payment 3; current service/contact channel 2; project phase Evidence Lock 2. These are routing-change counts, not adjudicated canonical failure clusters.

## Source reconstruction correction and next routing round

The original LINE export was recovered privately, and all 4,030 CSV source-line references resolve to actual member-message starts. The first reconstruction incorrectly treated empty-sender system events and weekday-prefixed date separators as continuation text. Its reported 394 messages / 43,993 continuation characters, provisional classification counts and 229 diagnostic flags are superseded. After correcting both boundary readers, **141 messages contain actual continuation text omitted from the CSV, totaling 16,498 characters**. System events are not appended to member questions.

The corrected reconstruction contains 4,030 records. Independent conservative triage proposes **2,080 standalone, 1,058 personal/live, 188 context/conversation and 704 review records**. These classes are provisional, not semantic adjudications and not the canonical 1,832/1,546 split. No target counts are used by the classifier. The reconstructed corpus remains private; neither source messages nor per-record results are committed. Per the user's latest instruction, continuation focuses on answer testing and root causes rather than further privacy review; this does not make the working corpus suitable for public publication.

The actual-engine corrected baseline executed all 4,030 records: **232 flagged, 226 fallback and 6 personal/live route-review candidates**. EMPTY, DEAD-END, listed unsafe-certainty phrase candidates and missing-source review candidates were 0. These are diagnostic indicators, not semantic acceptance results.

| Primary automated triage cluster before this round | Count |
|---|---:|
| Cooperative / membership wording | 136 |
| Payment / transfer timing | 27 |
| Loan product wording | 32 |
| Document / address context | 14 |
| Current notice | 6 |
| Personal/live review | 6 |
| Other semantic review | 11 |
| Total | 232 |

This round broadens concurrent-membership detection to include the full term for another savings cooperative, normalizes spaced interrogatives, separates election/reward notice requests from loan routing, routes address confirmation to the existing official contact page, recognizes insurance policy terminology, and retains Evidence Lock for repayment deadlines falling on holidays. No address, election result, transfer date, holiday extension or membership eligibility is invented. Testing caught a new address route taking over existing document-topic clarification; its predicate was narrowed and the unchanged original representative passes again.

**61 representative cases plus 2 adjacent checks PASS. All 15 release suites PASS, none skipped.** The unchanged full-message corpus was then rerun: **228 flagged, 222 fallback and 6 personal/live review candidates**. The four resolved diagnostic flags comprise one concurrent-membership case, one insurance case and two address-confirmation cases; no previously unflagged case gained a flag. This is a same-input diagnostic comparison, not canonical PASS/FAIL. The six live-route candidates were inspected: five contain commentary, an answer or an explanatory discussion rather than a standalone personal record request; one asks whether two loan approval announcements are combined. They remain recorded as diagnostic flags; no exclusion or test change was used to claim a zero count.

Latest proposed production-source blob: `09b24622a0c68dd54437a3ef937b7cde9993a166`. Source commit `d0e745d91156a07aa8a7867c2f7460cbc86cb93a` passed Regression run 37614931612 and E2E run 37614931590. The E2E job completed the real mobile/desktop browser regression successfully. Production was opened again in Cloud Browser and the synthetic document-arrival/transfer-date query still returned generic topic clarification; the proposed source is not deployed. The canonical manifest and independent per-case content/destination expectations remain unavailable. **Canonical Mass Gate executed: 0; merge and deployment remain blocked.**

## Independently reviewed source contracts and spoken-language round

The canonical mapping is still unavailable. Work therefore continues by specifying acceptance contracts directly from reviewed original messages, independently of engine answers. A supplemental private subset now contains **34 source-message contracts**, each requiring the relevant answer content and an appropriate official destination; most also require the correct live-data or Evidence Lock decision. These are genuine source messages, separate from paraphrased public regressions. The exact same contracts and corpus hash were executed against the preceding source and the proposed source: **0/34 PASS before; 34/34 PASS after**. All preceding cases returned fallback with wrong content and destination. Expectations were not changed to match outputs. This subset does not stand in for the remaining corpus or the canonical gate.

General fixes cover additional spoken interrogatives and problem reports; transfer/refund timing; ledger items that have not posted; personal-balance access; spaced membership-number requests including funeral association IDs; disbursement method; full project-policy requests; holiday deadline scope; document execution and attachments; external creditor payoff inquiries; loan-product clarification; and common abbreviation/typo normalization. Missing current rules retain Evidence Lock, and no approval, account balance, payout date, membership entitlement or holiday extension is asserted. External debt payoff requests direct the member to their own creditor's contractual official channel and explicitly do not assert a creditor contact or amount; cooperative staff are linked only for cooperative application documentation.

A new conversation regression exposed loss of the eligibility question after choosing a product: the engine listed the loan rather than continuing eligibility. Duration-bearing membership questions now retain that concern, and choosing the emergency product reaches eligibility with NEED_MEMBER_DATA rather than a product overview. Source-subset testing also exposed spacing in the original funeral membership-number question; the identifier predicate now recognizes the spaced term and reaches a personal-data verification route.

**92 representative questions, 2 existing adjacent-topic checks and the new eligibility conversation checks PASS. All 15 local release suites PASS, none skipped.** No original test was weakened, removed or skipped. The unchanged private full-message corpus was rerun through the actual engine: **4,030 executed; 107 flagged (101 fallback, 6 live-review candidates)**. Compared with the preceding round's 228 flags / 222 fallback, 121 records lost their flags and no previously unflagged record gained one. Flag reduction is not an adjudicated semantic pass count: source includes answers, discussion and announcements, and the remaining 101 fallback records still require content/context review.

The fixed canonical Mass Gate remains **0 executed / BLOCKED** because the 1,832/1,546 row mapping and full independent semantic expectations are not established. The new 34-case source contracts provide a concrete way to reconstruct reviewed acceptance evidence without waiting only for the missing old manifest; they do not authorize padding or arbitrary reclassification to meet the requested counts. Raw questions, private contracts and per-record results remain outside GitHub.

Proposed production-source blob: `cd176cf08fe64d2e2a30e006e077c824f1b10319`. Source commit `3f73baff058643a1a46da243cf4cbfce7379052a` passed Regression run 37618117257 and E2E run 37618117305, including real mobile/desktop browser regression. No merge or deployment is authorized while the canonical gate is unresolved. Existing Production source and URL remain unchanged.

## Semantic routing and empty-rule safeguard round

The same 71 independently specified source-message contracts were run on the preceding source `5ae7c22`: **34 PASS / 37 FAIL**. On the proposed source: **71 PASS / 0 FAIL**. The original 34 contracts remain unchanged. Supplemental contracts check content, decision and an appropriate official destination, not only intent. One newly authored expectation was corrected after rereading its source concern: an external-bank payoff question requires Evidence Lock, rather than product clarification alone. This does not change any previously committed regression or acceptance expectation.

The 37 baseline semantic failures are grouped by the independently reviewed concern below. These are supplemental root-cause groups, not canonical full-corpus counts.

| Supplemental failure group before this round | Count |
|---|---:|
| Missing product / ambiguous loan eligibility | 6 |
| Rule/evidence scope: policy, payoff, purpose, certificate, phase, attachment and remittance | 11 |
| Current notice, live records, document status/issuance, payout method and facility condition | 8 |
| Document topic / execution | 3 |
| Service feedback / group-channel authority | 6 |
| Cooperative identity / website access | 3 |
| Total reviewed baseline FAIL | 37 |


General fixes cover service feedback, attachment orders, bank payoff scope, deposit posting on holidays, website access, financial-report requests, certificate requirements, live document issuance, member records, group-channel verification, current notices and policy review. Requests without verified rules stay locked. Keyword collisions are narrowed: “ติดต่อกัน” is not a contact request; a number following “ส่งถึง” is not a delivery address; money supplied for loan eligibility is not automatically a payout-date inquiry. A specific membership-certificate request precedes the concurrent-membership rule.

A new regression exposed a more serious existing defect: compound reasoning could report eligibility when **zero applicable conditions had been checked**. Empty checks now ask for missing information for known products, or continue routing when the product is absent. The existing compound-reasoning intent tests remain unchanged and pass; new checks require NEED_INFO and forbid the old passing claim. The first guard implementation missed an established cross-product conversation; the original suite caught it, and the source was fixed before release verification.

**114 representative cases plus 3 supplementary routing cases, the original adjacent checks, eligibility conversation checks and the new empty-rule guard PASS. All 15 local release suites PASS, none skipped.** Three new supplementary cases cover holiday deposits, financial reports and document arrival.

The unchanged full-message corpus was executed again: **4,030 records; 84 diagnostic flags (78 fallback / 6 live-route review)**. EMPTY, DEAD-END, listed unsafe-certainty phrases and missing-source flags are 0. Against the preceding source's 107 flags, 40 records lose flags and **17 previously unflagged records gain fallback flags**. These 17 were previously misrouted to compound reasoning or live timing; they include commentary and unresolved inquiries. They remain outstanding review, not exclusions. Removing unsupported passing claims is necessary even when it increases flags. These figures are not adjudicated canonical PASS/FAIL or proof of zero fabrication.

Proposed source blob: `086b9566204845dfb94d199648a23d4dbd6c75a7`. Source commit `052f4cc0fe076cb9ce7d33afd915b086a1326597` passed Regression run 37621998510 and E2E run 37621998413, including real mobile/desktop browser regression. Canonical acceptance remains **0 executed / BLOCKED**: the original 1,832/1,546 row mapping and full independent semantic expectations are still not established. No merge or deployment is performed.

## Product-scope guard verification

A further synthetic check exposed ordinary age/term reasoning being applied when the question had no loan product or named housing. Compound reasoning is now limited to the products its encoded rules support; other products continue through their existing verified product routes, and unnamed loans ask for a product. Two added scope assertions verify missing-product NEED_INFO and prevent housing from receiving ordinary compound eligibility. All original tests remain intact.

All 15 release suites PASS again, the private source contracts remain **71/71 PASS**, and the unchanged 4,030-record diagnostic remains **84 flags: 78 fallback / 6 live-review**. Source commit `9cb8e003b86abd6623d0a5106b4f917125c70a9d` passed Regression run 37622579375 and E2E run 37622579368, including the real mobile/desktop browser step. Latest proposed index.html blob is `e12527447c1cf103b00a66371020bc7461579d1a`. Canonical acceptance is still BLOCKED; this does not certify Production or authorize merge.

## Gate evidence and outstanding acceptance items

| Required item | Result |
|---|---|
| 1. Corpus found | 4,030 CSV records |
| 2. Canonical Mass Gate executed | 0; canonical classified manifest unavailable |
| 3. Standalone executed in canonical gate | Not established; target 1,832 |
| 4. Personal/live executed in canonical gate | Not established; target 1,546 |
| 5. Canonical PASS | Not established |
| 6. First canonical failure count | Not established; exploratory first baseline separately reported above |
| 7. Clusters | 820 exploratory records on PR #77 baseline, table above |
| 8. Root causes fixed | Operational status, product wording, deposit-collateral routing, insurance/form ambiguity, share-payment routing, document clarification |
| 9. New representative regression | 114 cases + 3 supplementary routing cases, original adjacent/conversation checks and empty-rule guard PASS; private source subset 71/71 PASS |
| 10. Post-fix canonical Mass Gate | BLOCKED; exploratory 4,030 execution separately reported |
| 11. Existing regression | PASS; 86 intents, 21 typo cases, 7 privacy cases, 33 transaction cases, 19 homepage buttons |
| 12. Engine E2E | 36 checks PASS |
| 13. Real Member Simulation | 85 checks PASS; additional member-real-questions suite 28 cases PASS |
| 14. Legacy LINE | 69/69, 306 patterns PASS |
| 15. OpenChat Gold | 139 cases PASS, including all existing PR #77 guards |
| 16. Official Freshness | 32/32 PASS |
| 17. Browser/UI acceptance | Production was opened; a synthetic document-arrival/transfer-date question returned a generic category fallback. Full acceptance of this PR's source is not performed on Production because it is not deployed |
| 18. CI | PASS on source `9cb8e003b86abd6623d0a5106b4f917125c70a9d`: Regression 37622579375 / E2E 37622579368; real mobile/desktop browser step PASS |
| 19. PR | Draft [PR #78](https://github.com/sayampreecha-ux/dlasavingcoop-member-assistant/pull/78), validated source commit `9cb8e003b86abd6623d0a5106b4f917125c70a9d` |
| 20. Merge commit | None for this PR; merge prohibited while canonical Mass Gate is unresolved |
| 21. Base main SHA | `3e6cdb8a6ee11d184d96d4d4591c24b43288539e` |
| 22. Base gh-pages SHA | `622a644f389a81e28971ccbf2293702fd588715c` |
| 23. Production/base index.html blob | `4d653082fdf07445a8cbaec3da14515e7235201b`; latest proposed source blob `e12527447c1cf103b00a66371020bc7461579d1a` |
| 24. Main vs gh-pages source | Base index.html blobs match after PR #77. This PR's source is not on either deployment branch |

Full local release verification passed **15 suites, none skipped**. Product coverage passed 65 inquiries. The new private Mass Gate runner is deliberately outside automatic public CI: it requires the private corpus and canonical manifest, binds the corpus hash, validates the exact class counts, runs the actual answer engine, and requires reviewed content plus destination expectations. Missing input exits BLOCKED with 0 executed; it cannot substitute gold representative counts for 3,378 cases.

## Safe continuation

Recover the original private manifest identifying every row's class, then establish independent per-case semantic expectations. Keep all member source material and per-record results private. Run `scripts/run-private-mass-gate.mjs` with private `--corpus`, `--manifest`, and `--out` files. Inspect remaining real failures, add safe representatives, fix general causes, and rerun all release gates. Only after canonical Mass Acceptance and CI pass may this PR merge and follow the existing gh-pages deployment and Production browser acceptance process.


## Latest main synchronization

PR #78 was synchronized onto main `b34c1cd3ec0dd6fb33008ac2850055a7575c497e` without publishing private corpus data. Release gates remain unchanged pending CI and canonical acceptance evidence.
