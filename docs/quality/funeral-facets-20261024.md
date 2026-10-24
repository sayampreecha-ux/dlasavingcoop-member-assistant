# Funeral facets: evidence and release gate (2026-10-24)

Baseline main: aa279691e9884d3507dc5a705ee70af702e6f319.
PR 166 inspected at aea65818491173d3ff3f44e0d1d9dd2c141c8578: open Draft, not merged.
This patch does not modify contextualize, topicOf, conversationTurn or PR 166 follow-up code.
It adds explicit, evidence-constrained facets and fully named follow-up buttons. Do not merge PR 166 based on these funeral tests.

## Primary evidence inspected

- Official hub https://www.dlasavingcoop.com/show.php?No=4161 opened in Cloud Browser. Links to rules No=4401, application No=3977, approval No=4241, annual 2568 report and claim procedure.
- Rules No=4401 links to https://drive.google.com/file/d/11EjAArjnuSKq2pyGHmsg6NUZ-ZeQqiNY/view . Downloaded 18-page scanned PDF; SHA256 fc70a1f858af8441dd630d6cc738be1633eef886da2149b8226ac4479eca537a. Visual inspection: page 1 section 2 effective upon registrar registration; page 2 definitions; page 4 sections 13/14 beneficiary and termination; page 5 sections 16-20 fees and advance; page 7 section 23 recipients; page 8 sections 24-25 claims and operating deduction. Pages 17/18 signatures do not establish registration date.
- Section 16 in the 2567 copy: application 100, annual maintenance 50, advance 500 baht. Historical text only; not certified current.
- Annual report linked by hub: https://drive.google.com/file/d/1MkJsa5Bqvx0etn7glg-7F_ZIQC4Ul9om/view . First displayed pages show year 2568 and sample rows maintenance 50 + advance 400 = 450. This is neither a universal amount nor a current-year rule. No membership identifiers or raw report rows copied into repository.
- Official category list https://www.dlasavingcoop.com/list.php?Category=center_3 retrieved: links include No=4777 meeting for accounting year 2568, No=4401 rules, No=4241 approvals and No=3977 application. This listing does not prove absence of later amendments.
- Claim procedure link observed in hub: https://drive.google.com/file/d/1V-9r3eoBLN6FSScmlh1xFOwsE3-M1ggT/view . Navigation reference; content not used to invent a document checklist.

## Proven defects and changes

1. Annual spoken question fell into generic menu; advance standalone question into generic clarification.
2. Death + payment wording matched payment before claim. New explicit claim route precedes legacy matcher.
3. Beneficiary synonym and debt deduction questions fell into generic menu. Separate association vs cooperative records; no assumed deduction authority.
4. Approval query containing application matched application first. Preserve application answer while requiring !isResult.
5. New routes protect private identifiers, preserve existing loan/deposit/spouse/lookup routes, and retain EVIDENCE_LOCK for present-day rates/rights.

## QA scope

60 semantic cases in 10 groups: advance, annual, entry, claim, beneficiary, debt, refund, payment, application, approval. Tests inspect real answer text, exact facet, lock state, source, actions, privacy, cross-domain exclusion and five follow-up buttons. Identifier lookup retains its existing exact intent/privacy contract. These tests establish correct historical guidance and safe handling; they do not certify current entitlements.

Local full verify-release: 72 suites passed, none skipped. Existing assertions unchanged. Generated legacy execution output is not part of patch.
Browser script: 60 real form submissions at each width 390 and 1365, visible-answer checks, actual follow-up click, overflow and page errors. Browser results must be separately recorded; a local launch failure is not PASS.
Production Cloud Browser: question “ฌาปนกิจเสียชีวิตจ่ายเท่าไร” visibly returned payment guidance, version 4.10.0-share-backed-loan-2569. Confirms original defect; not evidence of deployed fix.

## Release gate

BLOCKED until registrar effective date/current amendment chain and current-year collection evidence are verified. Keep historical/current separation and existing coverage lock. Do not fabricate current rate or net death benefit. Candidate browser/CI must also pass on exact HEAD before any merge. No approval requested again; user already authorized qualified release. Rollback: revert only this patch if eventually released.
