// Regression guard for pensioner ordinary-loan routing (source-level).
// Full answer-engine and browser tests are required before release.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const pensioner=html.match(/if\(pensionLoan\)\{[\s\S]*?\n    \}\n    \/\/ Recognize debt consolidation/);
assert.ok(pensioner,'pensioner routing must exist');
assert.match(pensioner[0],/KB\.ruleAuthority\.rules\.ordinaryLoanCurrent/,'use shared verified ordinary rule');
assert.match(pensioner[0],/ordinary\.primaryEvidenceVerified===true/,'require verified evidence');
assert.match(pensioner[0],/PENSIONER_SPECIFIC_TERMS_UNVERIFIED/,'retain scoped pensioner evidence lock');
assert.match(pensioner[0],/ORDINARY_RULE_NOT_VERIFIED/,'retain fallback when ordinary rule is unverified');
assert.doesNotMatch(pensioner[0],/7\.50%/,'do not hard-code potentially stale pensioner rate');
console.log('pensioner ordinary routing source guards: PASS');
