import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const a=loadMemberEngine();
const ordinary='เงินกู้สามัญเพื่อพัฒนาคุณภาพชีวิตสมาชิก',pension='เงินกู้สำหรับผู้รับบำนาญ',special='เงินกู้พิเศษเพื่อพัฒนาคุณภาพชีวิต (รวมหนี้)';
for(const menu of ['เงินกู้','เงินกู้มีกี่แบบ']){const r=a.answer(menu);for(const title of [ordinary,pension,special])assert.equal(r.followups.filter(x=>x===title).length,1);}
for(const q of [ordinary,ordinary+' ปี2569 ระยะ2',ordinary+' ปี๒๕๖๙ ระยะ๒']){const r=a.answer(q);assert.equal(r.decision,'HISTORICAL_INFORMATION');assert.match(r.answer,/100,000 บาท/);assert.match(r.answer,/30 กันยายน 2569/);assert.ok(r.details.some(x=>x.includes('4,000 บาท')));assert.ok(r.actions.some(x=>x[1].includes('Category=notice')));assert.ok(r.sources.some(x=>x.url.includes('1mg3x9')));}
for(const q of [ordinary+' ปี2568 ระยะ2',ordinary+' ปี2570 ระยะ2',ordinary+' ปี2569 ระยะ3']){const r=a.answer(q);assert.equal(r.decision,'EVIDENCE_LOCK');assert.doesNotMatch(r.answer,/100,000|สิ้นสุด.*30 กันยายน/);}
assert.equal(a.answer(pension).intent,'ordinary_pensioner_general_guidance');assert.equal(a.answer(pension).decision,'GENERAL_INFORMATION');assert.match(a.answer(pension).answer,/สามารถยื่นขอกู้เงินสามัญ/);assert.equal(a.answer(ordinary+' OTP ทดสอบ').privacy,true);
assert.equal(a.answer('สมาชิกเกษียณอายุราชการแล้วสามารถค้ำประกันเงินกู้ได้หรือไม่').intent,'retired_guarantor_current');
assert.equal(a.answer(special).intent,'loan_special_quality');
for(const [start,follow,intent] of [[ordinary,'ดอกเบี้ยเท่าไร','ordinary_quality_phase2_archived'],[pension,'ผ่อนได้กี่งวด','ordinary_pensioner_general_guidance'],[special,'วงเงินสูงสุดเท่าไร','loan_primary_rule_inquiry']]){let t=a.conversationTurn(start);t=a.conversationTurn(follow,t.state,{continuation:true});if(start===special)assert.match(t.result.answer,/5,000,000/);else assert.equal(t.result.intent,intent);}
for(const q of ['เกษียณกู้ได้ไหม','เกษียณอายุกู้ได้ไหม','เกษียณแล้วกู้ได้ไหม','เกษียณอายุราชการแล้วกู้ได้หรือเปล่า','เกษียณแล้วขอกู้เงินได้ไหม','ข้าราชการเกษียณกู้ได้ไหม','ข้าราชการบำนาญกู้สามัญได้ไหม','ผู้รับบำนาญกู้ได้ไหม','รับบำนาญอยู่กู้ได้หรือไม่','เป็นสมาชิกสหกรณ์แต่เกษียณแล้วกู้ได้ไหม','เกษียนแล้วกู้ได้มั้ย','คนเกษียณกู้ได้ก่อ']){const r=a.answer(q);assert.equal(r.intent,'ordinary_pensioner_general_guidance',q);assert.match(r.answer,/สามารถยื่นขอกู้เงินสามัญ/,q);assert.ok(r.sources.some(s=>s.url.includes('1QQo5gux')),q);}
for(const [q,phrase] of [['ผู้รับบำนาญกู้ได้สูงสุดเท่าไร','2,000,000'],['เกษียณแล้วผ่อนได้กี่งวด','240'],['เกษียณกู้ต้องมีคนค้ำกี่คน','ผู้ค้ำ'],['รับบำนาญอยู่เป็นสมาชิกกี่เดือนถึงกู้ได้','6']]){const r=a.answer(q);assert.equal(r.intent,'ordinary_pensioner_general_guidance',q);assert.match(r.answer,new RegExp(phrase),q);}
assert.equal(a.answer('สมาชิกเกษียณอายุราชการแล้วสามารถค้ำประกันเงินกู้ได้หรือไม่').intent,'retired_guarantor_current');
assert.equal(a.answer('เกษียณแล้วกู้ได้ไหม เลขบัตรประชาชน 1234567890123').privacy,true);
console.log('Loan product/year/phase/privacy/menu, pensioner language and follow-up dialogues PASS');
