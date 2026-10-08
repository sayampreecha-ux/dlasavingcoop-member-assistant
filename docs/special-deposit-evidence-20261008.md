# Special savings evidence and release audit — 8 October 2026

Base: ca3c20e82ea0e0412bf79615bb44dda967e672d3. Existing tests remain unchanged.

Primary regulation: https://drive.google.com/file/d/1tclgFXrZjamcjLeOk2Wu4TeTRksUZwFL/view
SHA256 8f0264fef3d3ef751c000703fcb6767815655b319de707f548c04736fcad4e36.
Six scanned pages visually read. Clause 13 (page 3): opening and each additional deposit >=500 THB; one withdrawal per month; additional withdrawals charged 1%, minimum 100 THB; balance >=500 THB except closure. Clause 24 (page 5): closure interest through previous day; withdrawal >100,000 THB requires advance notice under separate announcement, number of days not verified here.

Amendment: https://drive.google.com/file/d/1-_JHv4AqbwzE2PyPjZJbN8zzdnYpH5MR/view
SHA256 8b82b77540fc4a523fb88d42ac1b921cad1802a80ef8cbc6a1d736b6e9b7ef75.
One scanned page visually read. Replaces clause 14: daily balance calculation, interest capitalized on last day of each month, no interest below 500 THB. Announced 6 October 2566; registrar approval stamp 27 October 2566; amendment effective day following approval.

Rate notice: https://drive.google.com/file/d/1tLZsmF29KVBFAnZS8Ei--3TBP6w0-ZUp/view
Announced 29 November 2565, effective 1 December 2565: 3.25% annual, maximum 50 million THB per member. No claim that an exhaustive current-rate/supersession check is complete; current-rate answer remains EVIDENCE_LOCK.

Procedures: official website No=2959 (opening), No=4554 (additional deposits), and form https://drive.google.com/file/d/12bOm_f7cAIk_or8UTyFiMzgc8n8rMpwj/view (withdrawal/closure). Closure requires green passbook by postal submission; actual transaction date follows cooperative receipt confirmation.

Root causes fixed: generated registry mismatch; special-deposit routing shadowed collateral route; Thai เปิด contains ปิด and was treated as closure; generic balance condition mistaken for private balance; additional deposits incorrectly routed as opening; pending association depositor regulation over-scoped to member special savings.

Initial local gate failed generated freshness check. First corrected gate failed original collateral regression. Further gate failed original deposit-open intent and authenticated handoff text. All were corrected in source; original tests unchanged. Added synthetic private-data and newly pending member-deposit cases; association remains locked for association questions. New tests originally expected unknown additional-deposit and balance minima, then were strengthened to the verified clause-13 values after reading both scanned primary documents; no old test weakened.

Local verification: scripts/verify-release.mjs, all 29 suites, none skipped; see GitHub CI for exact branch SHA and browser results. First E2E run 37795430202 passed all eight old browser scripts but failed new deposit script because live association document was over-scoped. Source classifier corrected; release is conditional on full rerun and live production verification. No reduction of gate or monitor interception.

9 October 2026: owner instructed use of the original rate notice. The rate answer now leads with the original notice's 3.25% annual rate and 50-million-THB member cap, explicitly identifies announcement/effective dates and uses that notice as the reference. This instruction selects the documented reference; it does not establish absence of subsequent amendments. The current-rate freshness lock and all tests remain unchanged.
