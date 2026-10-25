import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const app=loadMemberEngine();
const form='https://drive.google.com/file/d/1TvtIW_yrOcBYuvRNZmbU58sDpgyd1P6e/view?usp=sharing';
for(const spec of [
 {q:'คุณสมบัติอะไรบ้าง',intent:'membership_verified_form_categories',must:[/ข้าราชการ\/พนักงานส่วนท้องถิ่น/,/ลูกจ้างประจำ/,/ไม่รวมพนักงานราชการหรือพนักงานจ้าง/,/ไม่ใช่การยืนยันสิทธิ/] },
 {q:'ใช้เอกสารอะไร',intent:'membership_verified_form_documents',must:[/หนังสือตั้งผู้รับโอนประโยชน์/,/สำเนาบัตรประชาชน/,/สำเนาทะเบียนบ้าน/,/คำขอเปิดบัญชี/,/อย่าส่งเอกสารส่วนบุคคล/]}
]){
 const first=app.conversationTurn('สมัครสมาชิกสหกรณ์');
 const t=app.conversationTurn(spec.q,first.state,{continuation:true});
 assert.equal(t.result.intent,spec.intent,spec.q);
 assert.equal(t.result.decision,'RULE_INFORMATION',spec.q);
 assert.equal(t.state.topic,'membership-apply',spec.q);
 assert.ok(t.result.sources.some(x=>x.url===form),spec.q);
 for(const pattern of spec.must)assert.match(t.result.answer,pattern,spec.q);
 assert.doesNotMatch(t.result.answer,/เป็นเงินกู้ประเภทไหนครับ|ข้อความนี้ยังไม่พอระบุคำถาม/,spec.q);
}
// Preserve evidence gate for membership fees, which can change by later rule.
let t=app.conversationTurn('สมัครสมาชิกสหกรณ์');
t=app.conversationTurn('มีค่าธรรมเนียมหรือไม่',t.state,{continuation:true});
assert.equal(t.result.intent,'membership_scoped_followup');
assert.equal(t.result.decision,'SAFE_HANDOFF');
assert.equal(t.state.topic,'membership-apply');
// Official loan index, not the general notices category, for public approvals.
let n=app.conversationTurn('ประกาศอนุมัติเงินกู้ล่าสุด');
n=app.conversationTurn('มีประกาศใหม่หรือยัง',n.state,{continuation:true});
assert.equal(n.result.intent,'approval_public_scoped_followup');
assert.ok(n.result.sources.some(x=>x.url==='https://www.dlasavingcoop.com/list.php?Category=loan'));
console.log('Primary membership form + official approval index 4/4 PASS');
