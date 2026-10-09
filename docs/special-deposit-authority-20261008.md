# Special savings deposit source correction — 8 October 2026

Base: ca3c20e82ea0e0412bf79615bb44dda967e672d3.

Primary authority was read from the current official regulation index https://www.dlasavingcoop.com/show.php?Category=procedure and the linked original scanned PDFs:

- https://drive.google.com/file/d/1tclgFXrZjamcjLeOk2Wu4TeTRksUZwFL/view — 2566 regulation, clause 13: opening minimum 500 baht; each additional deposit minimum 500 baht; one withdrawal per month without fee; additional withdrawals charged 1%, minimum 100 baht; remaining balance at least 500 baht except closure. Clause 24 requires advance notice for withdrawals above 100,000 baht, with notice period set by cooperative announcement.
- https://drive.google.com/file/d/1-_JHv4AqbwzE2PyPjZJbN8zzdnYpH5MR/view — amendment 2/2566 replaces clause 14: daily balance interest, capitalized each month end; no interest below 500 baht. Registrar approval stamp 20 October 2566; effect from next day under clause 2. Previous last-working-day calculation wording is superseded.
- https://www.dlasavingcoop.com/show.php?No=3964 — published rate announcement referring to November 2565 board resolution: 3.25%. No independent confirmation of absence of subsequent rate changes; current rate remains EVIDENCE_LOCK.
- https://dlasavingcoop.com/show.php?No=2959 — opening 500 baht, payment code 7196; reference 0000011 is for first opening only.
- https://drive.google.com/file/d/12bOm_f7cAIk_or8UTyFiMzgc8n8rMpwj/view — withdrawal/closure form modified 7 July 2026: closure by post with green passbook; interest through day before transfer; withdrawal fee; required documents and receipt-based processing date.

Changes preserve existing tests. The special opening answer uses the established deposit_open intent family. General balance/minimum questions are separated from personal ledger requests. Collateral release remains unconfirmed until staff checks. No member identifiers, passwords, PINs or OTPs are requested.

Executed locally: original regression passed; verify-release passed all 29 suites, none skipped; dedicated deposit authority suite passed 12 questions plus 7 assertions. CI browser gates and live production checks are required before declaring deployment verified. This correction does not constitute completion of the separate human pilot acceptance gate.
