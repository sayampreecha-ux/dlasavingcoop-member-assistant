# Special savings release verification — 8 October 2026

Continues the authority correction in PR #98, head 16667f77600ecc1ba6dd20324dc326b83fb94201. Retains its source-grounded opening, additional-deposit minimum, withdrawal, closing, interest-capitalization and privacy checks.

Additional root-cause corrections: deposit-related loan questions ask for the loan product instead of endorsing a presumed deposit percentage; holiday/evening receipt and passbook delivery dates remain evidence-locked; deposit/withdrawal procedures offer relevant next steps; personal ledger requests use authenticated self-service without credential requests. Opening links point to the current official procedure (No=3993).

Primary evidence reviewed: regulation 2566 clause 13 (opening/additional deposits and balance minimum 500 baht; monthly withdrawal and 1%/100-baht fee), amendment 2/2566 clause 14 (daily interest capitalized every month end; below 500 baht no interest), and the current linked withdrawal/closure form (green passbook by post; closure interest through the day before transfer). Published 3.25% is attributed to the 2565 announcement; absence of a later change remains unconfirmed and current rate remains locked.

Local release gate: 31 suites, none skipped. Additional special-deposit acceptance: 19 cases. PRIVATE Mass Gate v3: 5,205 executed, 5,205 PASS, 0 FAIL; input SHA-256 92030af56d86f5e86ac932cefaee11823ddfaac6cfb48fcd1cc02826c73cb87d. Private input and per-record results remain outside the repository. Original tests and contracts were preserved.

Both E2E and Pages workflows require the existing special-deposit authority browser suite plus the new 38-check mobile/desktop suite. CI and live Production verification must pass before this document can be taken as evidence of a completed deployment. Production URL remains https://sayampreecha-ux.github.io/dlasavingcoop-member-assistant/ .
