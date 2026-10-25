import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const app=loadMemberEngine();
const cases=[
  {domain:'ordinary-loan',start:'เงินกู้สามัญกู้ได้ไหม',follow:['คุณสมบัติอะไรบ้าง','วงเงินสูงสุดเท่าไร','ผ่อนได้กี่งวด'],final:/240\s*งวด/,reject:/ยังอ่านค่านั้นไม่ชัด|เป็นสมาชิกสหกรณ์มาแล้วกี่เดือน/},
  {domain:'welfare-childbirth',start:'สวัสดิการคลอดบุตร',follow:['ได้รับเท่าไร'],final:/1,?000\s*บาท/,reject:/เงินกู้ประเภทไหน/},
  {domain:'scholarship',start:'ทุนการศึกษาบุตรสมาชิก',follow:['ได้ทุนเท่าไร'],final:/ทุน|การศึกษา|เกณฑ์|ประกาศ/,reject:/เงินกู้ประเภทไหน/}
];
for(const spec of cases){
 let t=app.conversationTurn(spec.start);
 for(const q of spec.follow)t=app.conversationTurn(q,t.state,{continuation:true});
 assert.doesNotMatch(t.result.answer,spec.reject,spec.domain+': wrong-topic answer');
 assert.match(t.result.answer,spec.final,spec.domain+': missing relevant answer');
 console.log(JSON.stringify({domain:spec.domain,status:'PASS',intent:t.result.intent,topic:t.state.topic}));
}
// Previously observed category drop-outs: validate routing, not numerical entitlements.
for(const spec of [
 {domain:'shares',start:'การส่งหุ้นรายเดือน',question:'ใช้เอกสารอะไร',expected:/หุ้น/,reject:/ต้องการส่งหรือขอเอกสารเรื่องใด/},
 {domain:'membership',start:'สมัครสมาชิกสหกรณ์',question:'คุณสมบัติอะไรบ้าง',expected:/สมาชิก/,reject:/ข้อความนี้ยังไม่พอระบุคำถาม/},
 {domain:'funeral',start:'สมาคมฌาปนกิจสงเคราะห์',question:'สมัครอย่างไร',expected:/ฌาปนกิจ/,reject:/ข้อความนี้ยังไม่พอระบุคำถาม/}
]){
 let t=app.conversationTurn(spec.start);t=app.conversationTurn(spec.question,t.state,{continuation:true});
 assert.match(t.result.answer,spec.expected,spec.domain+': wrong category');
 assert.doesNotMatch(t.result.answer,spec.reject,spec.domain+': generic context loss');
 console.log(JSON.stringify({domain:spec.domain,intent:t.result.intent,topic:t.state.topic,answer:t.result.answer.slice(0,150)}));
}
// No invented funeral documents or guaranteed resignation refund: explicit, scoped handoffs.
for(const spec of [
 {topic:'funeral',start:'สมาคมฌาปนกิจสงเคราะห์',question:'ใช้เอกสารอะไร',intent:'funeral_scoped_document_handoff',expected:/ฌาปนกิจ.*(?:เอกสาร|ข้อบังคับ)/},
 {topic:'resignation',start:'ลาออกได้ไหม',question:'ถ้ามีหนี้อยู่ทำอย่างไร',intent:'resignation_existing_debt_handoff',expected:/หนี้|ภาระค้ำประกัน/}
]){
 let turn=app.conversationTurn(spec.start);
 turn=app.conversationTurn(spec.question,turn.state,{continuation:true});
 assert.equal(turn.result.intent,spec.intent,spec.topic+': contextual intent');
 assert.equal(turn.result.decision,'SAFE_HANDOFF',spec.topic+': no unsupported personal determination');
 assert.match(turn.result.answer,spec.expected,spec.topic+': actionable handoff');
 assert.ok(turn.result.sources.some(x=>x.url),spec.topic+': official source URL');
}
// Official 2569 share-change request form (visually read original PDF):
// these short questions must receive a procedure/document answer, not a rule recap.
{
 let t=app.conversationTurn('การส่งหุ้นรายเดือน');
 for(const q of ['ส่งหุ้นสูงสุดเท่าไร','เพิ่มหุ้นได้ไหม','ลดหุ้นได้ไหม'])t=app.conversationTurn(q,t.state,{continuation:true});
 const checks=[
  {q:'ต้องทำอย่างไร',intent:'share_verified_change_form_steps',must:/กรอกชื่อ-สกุล.*อัตราเดิม.*อัตราใหม่/},
  {q:'ใช้เอกสารอะไร',intent:'share_verified_change_form_documents',must:/แบบคำขอเปลี่ยนแปลงการส่งค่าหุ้นรายเดือน/},
  {q:'ยื่นได้ที่ไหน',intent:'share_verified_change_submission',must:/ฝ่ายทะเบียน.*ยืนยันช่องทาง/},
  {q:'คืนหุ้นเมื่อไร',intent:'share_refund',must:/คืนทุนเรือนหุ้น/},
  {q:'ถ้ามีหนี้ทำอย่างไร',intent:'share_refund_existing_debt_handoff',must:/หนี้สหกรณ์หรือภาระค้ำประกัน/},
  {q:'ดูยอดหุ้นได้อย่างไร',intent:'share_balance_private_handoff',must:/ระบบสมาชิกทางการหลังยืนยันตัวตน/}
 ];
 for(const spec of checks){
  t=app.conversationTurn(spec.q,t.state,{continuation:true});
  assert.equal(t.result.intent,spec.intent,'shares '+spec.q+' intent');
  assert.match(t.result.answer,spec.must,'shares '+spec.q+' grounded answer');
  assert.equal(t.state.topic,'shares','shares '+spec.q+' topic');
  assert.ok(t.result.sources.some(s=>s.url?.startsWith('https://')),'shares '+spec.q+' official source');
  assert.doesNotMatch(t.result.answer,/ขอเปลี่ยนอัตราหุ้นรายเดือนได้ครับ:|เรื่องทุนเรือนหุ้นที่สมาชิกใช้บ่อย/,'shares '+spec.q+' must not repeat generic menu');
 }
}
console.log('Scoped share form/debt/balance follow-ups 6/6 PASS');

console.log('Semantic multi-turn acceptance PASS');
