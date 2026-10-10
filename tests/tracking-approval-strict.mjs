import fs from 'node:fs';import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert.match(html,/const isApproval=\/\^\(\?:ติดตามผลอนุมัติ\|ผลอนุมัติ\)/);
assert.match(html,/isMemberApproval\?/);assert.match(html,/ผู้ที่ได้รับความเห็นชอบให้เป็นสมาชิกสหกรณ์/);
assert.match(html,/arr\.findIndex\(x=>x\.directSourceUrl===e\.directSourceUrl\)===i/);
assert.match(html,/4\.8\.9-member-approval-evidence/);
console.log('Approval announcement title gate and deduplication present');
