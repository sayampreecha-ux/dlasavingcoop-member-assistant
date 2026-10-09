# Special savings integration release — 9 October 2026

Integrates PR #99 (4b5da7e28ba4adb43885986cfa8f93422f29b476), PR #100 (4590287a9d21ec81da0d32e81c73e0cd2e0a05c0), and main including PR #101 (66536fae5e7bec0ddd241ecb1b4e443c3e242786).

The original 29 November 2565 notice, effective 1 December 2565, remains the explicit rate reference: 3.25% annually and 50 million THB maximum per member. This reference choice is not evidence that no later amendment exists. The freshness lock stays in place.

Conflict resolution preserves every original main test and browser script. PR #99 acceptance stays at tests/special-deposit-acceptance.mjs. The distinct PR #100 acceptance is retained verbatim at tests/special-deposit-mass-acceptance.mjs. Its browser script is retained as scripts/browser-special-deposit-mass-smoke.mjs with only its import path adjusted. Both workflows run all four deposit browser suites before merge/deployment; Pages runs them again against the unchanged Production URL after deployment.

Source integrates deposit topic continuation, correct opening links, separate association/member rule scopes, authenticated personal-data routes, pledged-deposit restrictions, passbook delivery handoff, minimum opening/additional deposits/balance, withdrawal/closure procedures, and interest calculation. Personal credentials are never requested or echoed. Unknown posting times and loan deposit percentages remain unconfirmed.

Local verification on the integrated source: RELEASE GATE 33 suites PASS, none skipped. PRIVATE Mass Gate v3 contract: 5,205 executed, 5,205 PASS, 0 FAIL. Input SHA-256: 92030af56d86f5e86ac932cefaee11823ddfaac6cfb48fcd1cc02826c73cb87d. The unchanged runner, private input and per-record results remain separate; no private data is published. This contract pass does not replace source-document validation or browser checks.

Local Chromium download was unavailable in this environment. GitHub CI must provide actual mobile/desktop browser results on the published integration commit before merge. Deployment is complete only when Pages and all post-deployment browser checks succeed and the Production content matches the released commit.
