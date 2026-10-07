# Reviewed education and disaster loan answers

The member assistant now explains general education and disaster loan rules in the answer body. Source links supplement the explanation. It does not determine a member's approval, account balance, or personal eligibility without complete supporting data.

## Primary evidence

All four pages of each announcement were reviewed. Both announcements were signed on 11 September 2569 and apply from 1 October 2569. Clause 3 repeals the earlier 2567 criteria and the 2568 amendment. Earlier values are not inferred.

Official publication index: https://www.dlasavingcoop.com/show.php?No=774

| Product | Primary announcement | Maximum amount | Maximum installments | Application deadline |
| --- | --- | --- | --- | --- |
| Education | https://drive.google.com/file/d/1h_AhLqYbkI0Gfzsy5pIHuXtFRLVl7TM5/view | 200,000 baht | 60 | No deadline inferred |
| Disaster | https://drive.google.com/file/d/18zwMfC-yCHLmANcYSSRPbmAOka4_IOKh/view | 300,000 baht | 120 | Within 180 days of the event |

The combined ordinary-loan debt ceiling is 2,000,000 baht. General membership and share-payment requirements are six months/six installments. Remaining monthly income must meet both 15% and 6,000 baht; age at the end of the contract must not exceed 75. These are general criteria, not an approval or individual available credit.

Education covers actual study expenses of the member, spouse, child or adopted child from pre-primary through doctoral study. Disaster assistance covers repair, improvement or replacement of damaged houses/property belonging to the member, spouse, father or mother. Personal guarantees, property, government securities and cooperative deposits remain subject to the actual announcement's conditions.

Document answers were checked separately against the official forms:

- Education: https://drive.google.com/file/d/1cK6zUQSPdT-3NT7bJ3WXO_MWP_ruzXLi/view
- Disaster: https://drive.google.com/file/d/1YXj7yWsr7ZQC2MlL0Dt7qMaJO_vCY0kb/view

## Defects corrected

- Missing reviewed versions prevented useful explanations despite available primary evidence.
- The word `ช่วยเหลือ` incorrectly selected the remaining-income answer, displacing disaster installment and deadline questions.
- Education/disaster follow-up questions could lose the product context.
- An explicitly supplied `วันที่` was not recognized as a historical rule date. Unverified historical versions now lock safely.

## Validation

Existing tests, assertions, expected results and private contracts were retained. New synthetic tests require actual facts in the primary answer, correct follow-up, response changes when reviewed values change, and locks for removed/changed original documents and unverified historical dates. New browser coverage exercises both mobile and desktop, including asynchronous live monitoring. CI and Pages run this coverage in addition to all existing browser suites.

The exact private input remains outside the repository. Neither the private dataset nor per-record results are included in this change. Aggregate results are recorded in the pull request after actual execution.
