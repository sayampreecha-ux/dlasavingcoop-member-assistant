# Spoken loan installment follow-up fix — 2026-10-17

Base Main: e711a4e842b3ac0b0018dcf541b23d672f1b7f10. PR143 is already merged; its work is preserved. No relevant open fix PR was found. Existing unrelated PRs remain untouched.

## Evidence and expected behavior

The official emergency index https://www.dlasavingcoop.com/show.php?No=773 was checked again and still links https://drive.google.com/file/d/1XZYfuXWgzqWp6K_Ld0aosuO58pxKXU5p/view. Its rendered primary pages were reread: effective 2026-10-01 (page1 clause2); other loans require at least3 recorded paid installments (page2 clause5(4)); restructured ordinary debt requires12 (page1 clause4(5)); arrears in the preceding12 installments prevent eligibility under clause4(8). No later amendment was listed on the official index during this check. Existing versioned Rule Master thresholds and source monitor locks remain authoritative; this patch changes interpretation and presentation, not those policy values.

- “งวดเดียว/หนึ่งงวด/1งวด/๑งวด” with a payment statement means one paid installment. Existing quality debt plus requested emergency must report two more installments, cite5(4), and not ask the count again.
- A month duration is not a recorded paid-installment fact. Ask whether the member means the stated number of paid installments. A yes confirms that meaning; no retains unknown; a new explicit count replaces it. No eligibility decision is inferred from elapsed months.
- Restructured debt at11/12/13 uses the12 threshold and explicit4(5) citation. At12/13 only the installment condition passes; approval and other criteria remain separate.
- Arrears never become paid installments, and installment corrections retain disclosed arrears and numeric emergency qualifications.
- Resolved emergency term/document answers omit the generic category clarification. Missing evidence and missing decisive facts retain their guards.

## Tests and scope

Added tests/loan-spoken-installments.mjs:39 behavioral checks. Existing loan-scenarios suite retains its cases and adds a month-confirmation case (313 checks). Its prior test that treated “ส่งมา1เดือน” as one paid installment was corrected: the same wording is now explicitly tested for NEED_INFO plus a targeted confirmation; the alias test continues with an unambiguous installment unit. Assertions were not reduced.

The existing browser scenario gate now additionally reruns all16 original simulation turns, month confirmation/rejection/correction, numeric/Thai/word units, restructure13 and arrears correction, at390px and1365px. Those same checks run locally, in PR CI, before Pages deployment and against live Production. The prior17 browser cases at each size are retained.

Source release gate:58 suites PASS locally. Local browser, immutable PR CI, final merge safety and deployment/Production verification results are to be recorded in the final acceptance evidence; this document alone is not a Production release certificate.

No new menus, forms, transactions, calculator changes, rule numbers, source gates, URL changes or workflow bypasses. Existing broad source and browser gates remain enabled.
