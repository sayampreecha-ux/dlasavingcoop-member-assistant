# Special savings release audit — 8 October 2026

Base: ca3c20e82ea0e0412bf79615bb44dda967e672d3. Existing tests and PRIVATE expected contracts unchanged.

## Official evidence
- https://dlasavingcoop.com/show.php?No=2959 — first opening minimum 500 baht; bill code 7196; reference 0000011 only for first opening.
- https://dlasavingcoop.com/show.php?No=4554 — additional deposits through Krungthai NEXT or bank counter. No additional-deposit minimum or posting timetable confirmed.
- https://www.dlasavingcoop.com/show.php?No=3964 links the signed announcement https://drive.google.com/file/d/1tLZsmF29KVBFAnZS8Ei--3TBP6w0-ZUp/view — dated 29 November 2022, effective 1 December 2022, 3.25 percent yearly and aggregate 50 million baht. No exhaustive confirmation of absence of superseding announcement; current rate remains EVIDENCE_LOCK.
- https://drive.google.com/file/d/12bOm_f7cAIk_or8UTyFiMzgc8n8rMpwj/view — current linked withdrawal/closure form (Drive modified 7 July 2026). Form states monthly withdrawal; second and subsequent withdrawal fee 1 percent, at least 100 baht including closure; closure by post with green passbook; interest through day before transfer; actual processing date from receipt acknowledgement. These are attributed to the published form, with later-change uncertainty stated.

## Root causes
Additional-deposit questions matched opening minimum; closure/withdrawal lacked direct form conditions; personal-balance intent missed credentials; lending-related deposits were intercepted before loan reasoning; timetable questions received generic opening facts. Fixed routing, evidence-attributed answers, safe member portal handoff, and relevant follow-ups. No member balance or credential collection.

## Executed pre-CI checks
- Release gate: 29 suites passed, none skipped.
- Special deposit: 19 checks passed.
- PRIVATE Mass Gate v3: 5205/5205, zero failures.
- Supplemental private content audit: 5205/5205, zero failures.
- Input SHA256: 92030af56d86f5e86ac932cefaee11823ddfaac6cfb48fcd1cc02826c73cb87d.
- Private inputs and per-record outputs excluded from repository.

Browser CI, deployment and production checks must still succeed before release is declared complete.
