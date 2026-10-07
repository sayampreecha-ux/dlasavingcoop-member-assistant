import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const app=loadMemberEngine();let checks=0;
const ask=q=>app.answer(q),text=r=>[r.answer,...(r.details||[])].join(' ');
assert.equal(app.norm('ขอค้ําประกัน'),app.norm('ขอค้ำประกัน'));checks++;
assert.equal(app.norm('น้ําท่วม'),app.norm('น้ำท่วม'));checks++;
assert.equal(app.norm('<MENTION> [MEMBER_B] เงินฝาก <PHONE>'),'เงินฝาก');checks++;
for(const q of ['อยากแลกค้ำสามคน ใครสนใจบ้าง','มีคนค้ำสองคนแล้ว กำลังหาคนค้ำอีกคน','อยากให้ทบทวนหลักเกณฑ์การค้ำเป็นสิบราย']){
 const r=ask(q);assert.equal(r.intent,'guarantee_context_review');assert.equal(r.decision,'NEED_INFO');assert.doesNotMatch(text(r),/ปัจจุบันค้ำอยู่|ผ่านเงื่อนไข|เพดาน \d/);checks++;
}
const death=ask('ผู้ค้ำเสียชีวิต ต้องเปลี่ยนผู้ค้ำอย่างไร');assert.equal(death.intent,'loan_change_guarantor');checks++;
for(const q of ['สมาชิกเสียสิทธิ์เพราะขาดสภาพคล่อง มีวิธีเสนอความคิดเห็นไหม','รายละเอียดผลประโยชน์สมาชิกอยู่ที่ไหน']){
 const r=ask(q);assert.notEqual(r.intent,'welfare_member_death');assert.doesNotMatch(text(r),/ค่าทำศพ|สมาชิกถึงแก่กรรม/);checks++;
}
const storm=ask('ได้รับผลกระทบจากพายุ ประสบภัยพิบัติ จะขอความช่วยเหลือแบบไหน');assert.equal(storm.decision,'EVIDENCE_LOCK');assert.doesNotMatch(text(storm),/\d+\s*(บาท|วัน|เดือน)|\d+%/);checks++;
const prop=ask('อยากให้มีโครงการกู้พัฒนาคุณภาพชีวิตช่วยประชาชนเพิ่ม');assert.equal(prop.decision,'EVIDENCE_LOCK');assert.doesNotMatch(text(prop),/\d+\s*บาท|\d+%/);checks++;
const balance=ask('เงินเหลือหลังหักหนี้เจ็ดพัน อยากกู้ได้ไหม');assert.notEqual(balance.intent,'ordinary_current_remaining_income');assert.doesNotMatch(text(balance),/6,000|15%/);checks++;
const asset=ask('เกษียณแล้วหมดภาระค้ำ ต้องการถอนหุ้นติดต่อฝ่ายไหน');assert.notEqual(asset.intent,'retired_guarantor_current');assert.doesNotMatch(text(asset),/ได้ครับ การเกษียณ/);checks++;
const submit=ask('ส่งสแกนผู้รับโอนประโยชน์ทางไลน์ได้หรือเปล่า');assert.equal(submit.decision,'EVIDENCE_LOCK');assert.doesNotMatch(text(submit),/พยาน.*2 คน/);checks++;
const ref=ask('อยากรวมหนี้แต่หลักทรัพย์ติดภาระกับธนาคาร ต้องทำไง');assert.equal(ref.intent,'refinance_product_clarification');assert.equal(ref.decision,'NEED_INFO');checks++;
for(const q of ['ตกลงอย่างนี้หมายความว่าอะไร','ช่วยหน่อยทำแบบนี้ไม่เข้าใจ']){
 const r=ask(q);assert.equal(r.intent,'member_topic_clarification');assert.equal(r.decision,'NEED_INFO');assert.equal(r.requiredFact,'serviceTopic');assert.ok(r.followups.length&&r.actions.length);checks++;
 const turn=app.conversationTurn(q);const next=app.conversationTurn('กู้ฉุกเฉิน',turn.state,{continuation:true});assert.notEqual(next.result.intent,'member_topic_clarification');checks++;
}
const status=ask('สถานะรอตรวจสอบนานแล้ว ทำไง');assert.doesNotMatch(text(status),/(?:รหัสผ่าน|OTP|PIN)\s*(?:ของคุณ|มา|ให้)/i);checks++;
console.log('MASS CONTRACT SAFETY: '+checks+' checks PASS');
