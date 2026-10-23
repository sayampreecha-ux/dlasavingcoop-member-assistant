import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const a=loadMemberEngine();
const ordinary='เงินกู้สามัญเพื่อพัฒนาคุณภาพชีวิตสมาชิก',pension='เงินกู้สำหรับผู้รับบำนาญ',special='เงินกู้พิเศษเพื่อพัฒนาคุณภาพชีวิต (รวมหนี้)';
for(const menu of ['เงินกู้','เงินกู้มีกี่แบบ']){const r=a.answer(menu);for(const title of [ordinary,pension,special])assert.equal(r.followups.filter(x=>x===title).length,1);}
for(const q of [ordinary,ordinary+' ปี2569 ระยะ2',ordinary+' ปี๒๕๖๙ ระยะ๒']){const r=a.answer(q);assert.equal(r.decision,'HISTORICAL_INFORMATION');assert.match(r.answer,/100,000 บาท/);assert.match(r.answer,/30 กันยายน 2569/);assert.ok(r.details.some(x=>x.includes('4,000 บาท')));assert.ok(r.actions.some(x=>x[1].includes('Category=notice')));assert.ok(r.sources.some(x=>x.url.includes('1mg3x9')));}
for(const q of [ordinary+' ปี2568 ระยะ2',ordinary+' ปี2570 ระยะ2',ordinary+' ปี2569 ระยะ3']){const r=a.answer(q);assert.equal(r.decision,'EVIDENCE_LOCK');assert.doesNotMatch(r.answer,/100,000|สิ้นสุด.*30 กันยายน/);}
assert.equal(a.answer(pension).decision,'EVIDENCE_LOCK');assert.equal(a.answer(ordinary+' OTP ทดสอบ').privacy,true);
assert.equal(a.answer('สมาชิกเกษียณอายุราชการแล้วสามารถค้ำประกันเงินกู้ได้หรือไม่').intent,'retired_guarantor_current');
assert.equal(a.answer(special).intent,'loan_special_quality');
for(const [start,follow,intent] of [[ordinary,'ดอกเบี้ยเท่าไร','ordinary_quality_phase2_archived'],[pension,'ผ่อนได้กี่งวด','ordinary_pensioner_evidence_review'],[special,'วงเงินสูงสุดเท่าไร','loan_primary_rule_inquiry']]){let t=a.conversationTurn(start);t=a.conversationTurn(follow,t.state,{continuation:true});if(start===special)assert.match(t.result.answer,/5,000,000/);else assert.equal(t.result.intent,intent);}
console.log('Loan product/year/phase/privacy/menu and 3 follow-up dialogues PASS');
