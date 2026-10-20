import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const app=loadMemberEngine();
const full=t=>[t.result.answer,...(t.result.details||[])].join('\\n');
const first=app.conversationTurn('กู้สามัญได้เท่าไหร่ ค้ำกี่คน');
assert.equal(first.result.intent,'ordinary_loan_amount_guarantors');
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
assert.match(buy.result.answer,/ยังยืนยันไม่ได้/);
assert.match(buy.result.answer,/อย่าโอนเงิน/);
assert.doesNotMatch(buy.result.answer,/^การซื้อหุ้นเพิ่มเติมเป็นครั้งคราวปิดรับแล้ว/);
console.log('T07/T13 behavior and T15 evidence gate assertions PASS');
