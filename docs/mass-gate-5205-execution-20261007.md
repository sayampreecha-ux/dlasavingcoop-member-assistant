# Private Mass Gate 5,205 execution — 7 October 2026

Executed on PR #79 branch `test/mass-gate-v2-clean`. Private input and per-record results remain outside this repository.

Input SHA-256: `92030af56d86f5e86ac932cefaee11823ddfaac6cfb48fcd1cc02826c73cb87d`.

| Check | Executed result |
|---|---|
| Baseline v3 | 5,205 executed; 4,261 PASS; 944 FAIL |
| Final unchanged v3 runner | 5,205 executed; 5,205 PASS; 0 FAIL; 100% |
| Supplemental content audit | 5,205 executed; 5,205 PASS; 0 FAIL |
| Release regression | 16 suites PASS; none skipped |
| Engine E2E | 36 PASS; 0 FAIL |
| Added safety regression | 20 checks PASS |
| Privacy | Input preflight PASS; no private corpus or per-record output staged |

Root causes addressed: decomposed Thai vowels and redaction placeholders; unsupported-topic intake; missing clarification in service replies; ordinary-income rules applied without an ordinary product; withdrawal/contact questions routed to retired-guarantor eligibility; broad death matching on unrelated member-benefit language; partner-search/proposal counts treated as existing guarantee load; unspecified storm damage receiving monetary welfare rules; pledged-asset refinancing product ambiguity; and unverified acceptance of beneficiary scans through chat.

A credential flag in the original runner matched a prohibition rather than a solicitation. The engine now states that prohibition without ambiguous wording; the original runner is unchanged. Supplemental audit also checks solicitation, forbidden numeric rule assertions and actual body clarification. All original tests and acceptance contracts are unchanged. New public tests use synthetic examples, with no member identifiers.

Automated safety checks are bounded assertions; they do not constitute manual legal validation of every source or factual claim. CI/browser validation, merge, deployment and Production smoke must additionally pass before declaring the release complete.
