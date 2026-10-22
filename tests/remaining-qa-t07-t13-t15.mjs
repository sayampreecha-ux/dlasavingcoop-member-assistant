import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const app=loadMemberEngine();
const authorityPolicy=app?.knowledgeBase?.ruleAuthority?.policy?.rules;
// Verify the generated in-app authority policy is not silently reverted.
const htmlPolicy=(await import('node:fs')).readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert.match(htmlPolicy,/เมื่อเอกสารอ้างอิงประกาศ ระเบียบ หรือหนังสือฉบับก่อน/);
assert.match(htmlPolicy,/ฉบับต้นเรื่อง ฉบับแก้ไขเพิ่มเติม ฉบับขยายเวลา ฉบับยกเลิก และฉบับทดแทน/);
assert.match(htmlPolicy,/ห้ามใช้ฉบับล่าสุดเพียงฉบับเดียว/);

assert.match(htmlPolicy,/function documentChain\(registry,rootId,asOf\)/);
assert.match(htmlPolicy,/MISSING_REFERENCED_DOCUMENT/);
assert.match(htmlPolicy,/LATEST_INDEX_COVERAGE_UNVERIFIED/);

const full=t=>[t.result.answer,...(t.result.details||[])].join('\\n');
const first=app.conversationTurn('กู้สามัญได้เท่าไหร่ ค้ำกี่คน');
assert.equal(first.result.intent,'ordinary_loan_amount_guarantors');
assert.equal(first.result.domain,'ordinaryLoanCurrent');
assert.equal(app.answer(app.contextualize('วงเงินเท่านี้ต้องค้ำกี่คน','ordinaryLoanCurrent')).domain,'ordinaryLoanCurrent');
assert.match(full(first),/2,000,000/);
assert.match(full(first),/500,000/);
assert.match(full(first),/ผู้ค้ำ/);
assert.match(full(first),/ไม่ใช่วงเงินอนุมัติเฉพาะราย/);
const isolated=app.conversationTurn('ขอเพิ่มค่าหุ้นรายเดือน ต้องทำไง');
const after=app.conversationTurn('ขอเพิ่มค่าหุ้นรายเดือน ต้องทำไง',first.state,{continuation:true});
for(const t of [isolated,after]){
 assert.equal(t.result.intent,'share_change_rate');
 assert.match(full(t),/แบบคำขอเปลี่ยนค่าหุ้นรายเดือน/);
 assert.doesNotMatch(t.result.answer,/วิธีขอกู้สามัญ/);
}
const follow=app.conversationTurn('ค้ำกี่คน',first.state);
assert.match(full(follow),/ผู้ค้ำ|ค้ำประกัน/);
const buy=app.conversationTurn('ซื้อหุ้นเพิ่มเป็นครั้งคราว ตอนนี้ยังเปิดรับไหม');
assert.equal(buy.result.decision,'EVIDENCE_LOCK');
assert.equal(buy.result.availability?.state,'EVIDENCE_PENDING');
assert.match(full(buy),/4865 และ 4893/);
assert.match(full(buy),/LATEST_INDEX_COVERAGE_UNVERIFIED/);
assert.ok(buy.result.actions.some(a=>a[1]==='https://www.dlasavingcoop.com/show.php?No=4865'));
assert.ok(buy.result.actions.some(a=>a[1]==='https://www.dlasavingcoop.com/show.php?No=4893'));
assert.match(buy.result.answer,/30 กันยายน 2569/);
assert.match(buy.result.answer,/รอบเดิม/);
assert.match(buy.result.answer,/ยังไม่ยืนยัน/);
assert.ok(buy.result.sources.some(s=>String(s.url||'').includes('00126.jpg')));
assert.match(buy.result.answer,/อย่าโอนเงิน/);
assert.doesNotMatch(buy.result.answer,/^การซื้อหุ้นเพิ่มเติมเป็นครั้งคราวปิดรับแล้ว/);
console.log('T07/T13 behavior and T15 evidence gate assertions PASS');
