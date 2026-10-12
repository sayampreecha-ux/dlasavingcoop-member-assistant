// Regression guard: account-change answer must precede generic dividend answer.
// Run: node tests/dividend-bank-change.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const specific = html.indexOf("return res('dividend_bank_change'");
const generic = html.indexOf("return res('dividend',");
assert(specific > 0 && generic > specific, 'bank-change route must precede generic dividend route');
for (const phrase of ['30 กันยายน 2569','พ้นกำหนด','แบบแจ้งขอรับเงิน','LINE หรืออีเมล','S.dividendNotice2569','S.contact']) {
  assert(html.slice(specific, generic).includes(phrase), 'missing critical account-change guard: ' + phrase);
}
assert(html.includes("dividendNotice2569:'https://www.dlasavingcoop.com/show.php?No=4916'"), 'official source must be direct');
console.log('PASS: bank-change source, deadline, channel uncertainty, and intent precedence');
