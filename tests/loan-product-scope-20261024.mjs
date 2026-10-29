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
const pensionFollowups=[['กู้ได้เท่าไร',/2,000,000/],['ได้สูงสุดเท่าไร',/2,000,000/],['คุณสมบัติอะไรบ้าง',/6 เดือน/],['ผ่อนได้กี่ปี',/240 งวด/],['ผ่อนได้กี่งวด',/240 งวด/],['อายุไม่เกินเท่าไร',/75 ปี/],['ต้องมีคนค้ำกี่คน',/ผู้ค้ำ/],['ดอกเบี้ยเท่าไร',/ประกาศอัตราปัจจุบัน/],['ใช้เอกสารอะไร',/แบบคำขอเงินกู้สามัญ/]];
for(const [question,expected] of pensionFollowups){const start=a.conversationTurn('เกษียณกู้ได้ไหม');assert.equal(start.state.topic,'ordinary-pensioner');for(const continuation of [false,true]){const turn=a.conversationTurn(question,start.state,{continuation});assert.equal(turn.result.intent,'ordinary_pensioner_general_guidance',question);assert.match(turn.result.answer,expected,question);assert.ok(turn.result.sources.some(x=>x.url.includes('1QQo5gux')),question);assert.equal(turn.state.topic,'ordinary-pensioner',question);}}
for(const newQuestion of ['กู้ฉุกเฉินได้เท่าไร','กู้รวมหนี้ได้สูงสุดเท่าไร','ข่าวประกาศสหกรณ์','เงินฝากออมทรัพย์พิเศษ','ปันผลปี 2569']){const first=a.conversationTurn('เกษียณกู้ได้ไหม');const next=a.conversationTurn(newQuestion,first.state);assert.notEqual(next.result.intent,'ordinary_pensioner_general_guidance',newQuestion);}
const guarantor=a.conversationTurn('เกษียณกู้ได้ไหม');assert.notEqual(a.conversationTurn('ผู้ค้ำจะเกษียณก่อนหมดสัญญาทำอย่างไร',guarantor.state).result.intent,'ordinary_pensioner_general_guidance');

 // True multi-turn dialogue: each question must receive the state from the immediately preceding turn.
const sequentialQuestions=[
 ['กู้ได้เท่าไร',/2,000,000/],
 ['คุณสมบัติอะไรบ้าง',/6 เดือน/],
 ['ผ่อนได้กี่ปี',/240 งวด/],
 ['อายุไม่เกินเท่าไร',/75 ปี/],
 ['ต้องมีคนค้ำกี่คน',/ผู้ค้ำ/],
 ['ดอกเบี้ยเท่าไร',/ประกาศอัตราปัจจุบัน/],
 ['ใช้เอกสารอะไร',/แบบคำขอเงินกู้สามัญ/],
 ['ผ่อนได้กี่งวด',/240 งวด/],
 ['ได้สูงสุดเท่าไร',/2,000,000/],
];
for(const continuation of [false,true]){
  let dialog=a.conversationTurn('เกษียณกู้ได้ไหม');
  assert.equal(dialog.state.topic,'ordinary-pensioner','initial topic');
  for(const [q,pattern] of sequentialQuestions){
    dialog=a.conversationTurn(q,dialog.state,{continuation});
    assert.equal(dialog.result.intent,'ordinary_pensioner_general_guidance','sequential: '+q);
    assert.match(dialog.result.answer,pattern,'sequential: '+q);
    assert.equal(dialog.state.topic,'ordinary-pensioner','sequential state: '+q);
    assert.ok(dialog.result.sources.some(s=>s.url.includes('1QQo5gux')),'sequential source: '+q);
  }
  dialog=a.conversationTurn('เงินฝากออมทรัพย์พิเศษ',dialog.state,{continuation});
  assert.notEqual(dialog.result.intent,'ordinary_pensioner_general_guidance','explicit topic switch');
}
console.log('Real sequential pensioner dialogue (9 followups x 2 modes), evidence, topic switch PASS');

console.log('Loan product/year/phase/privacy/menu, pensioner language and follow-up dialogues PASS');
