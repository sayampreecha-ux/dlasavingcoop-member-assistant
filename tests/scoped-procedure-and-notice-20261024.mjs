import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const app=loadMemberEngine();
const cases=[
 ['เงินกู้สามัญกู้ได้ไหม','ยื่นที่ไหน','ordinaryLoanCurrent','เงินกู้สามัญ'],
 ['เงินกู้สามัญกู้ได้ไหม','ใช้เวลาพิจารณาเท่าไร','ordinaryLoanCurrent','เงินกู้สามัญ'],
 ['เงินกู้ฉุกเฉินกู้ได้ไหม','ต้องยื่นที่ไหน','emergencyLoanCurrent','เงินกู้ฉุกเฉิน'],
 ['เงินกู้พิเศษรวมหนี้คืออะไร','ใครยื่นได้','qualityOfLifeCurrent','เงินกู้พิเศษ'],
 ['เงินกู้พิเศษรวมหนี้คืออะไร','เปิดรับเมื่อไร','qualityOfLifeCurrent','เงินกู้พิเศษ'],
 ['เงินกู้พิเศษรวมหนี้คืออะไร','ต้องสมัครอย่างไร','qualityOfLifeCurrent','เงินกู้พิเศษ'],
 ['เงินกู้พิเศษรวมหนี้คืออะไร','มีหนี้เดิมยื่นได้ไหม','qualityOfLifeCurrent','เงินกู้พิเศษ']
];
for(const [start,q,topic,scope] of cases){
 const first=app.conversationTurn(start);
 const next=app.conversationTurn(q,first.state,{continuation:true});
 assert.equal(next.state.topic,topic,start+' > '+q);
 const hasVerified=!(q==='ใช้เวลาพิจารณาเท่าไร'||q==='เปิดรับเมื่อไร');
 assert.equal(next.result.intent,hasVerified?'loan_scoped_verified_procedure':'loan_scoped_procedure_handoff',q);
 assert.equal(next.result.decision,hasVerified?'RULE_INFORMATION':'SAFE_HANDOFF',q);
 if(hasVerified)assert.ok(next.result.sources.some(x=>x.url.includes('drive.google.com/file/d/')),q+' signed PDF citation');
 assert.ok(next.result.answer.includes(scope),q);
 assert.ok(next.result.sources.some(s=>s.url?.startsWith('https://')),q);
}
const notices=app.conversationTurn('ประกาศอนุมัติเงินกู้ล่าสุด');
assert.equal(notices.state.topic,'approval-public');
assert.equal(notices.result.intent,'approval_public_index');
assert.equal(notices.result.sources[0].url,'https://www.dlasavingcoop.com/list.php?Category=loan');
const follow=app.conversationTurn('วันโอนเมื่อไร',notices.state,{continuation:true});
assert.equal(follow.result.intent,'approval_public_scoped_followup');
assert.equal(follow.result.decision,'SAFE_HANDOFF');
const ordinary=app.conversationTurn('ยื่นที่ไหน',app.conversationTurn('เงินกู้สามัญกู้ได้ไหม').state,{continuation:true});
assert.ok(ordinary.result.answer.includes('ไปรษณีย์')&&ordinary.result.answer.includes('Mobile Application'),'ordinary signed PDF section 8');
const emergency=app.conversationTurn('ต้องยื่นที่ไหน',app.conversationTurn('เงินกู้ฉุกเฉินกู้ได้ไหม').state,{continuation:true});
assert.ok(emergency.result.answer.includes('dlasavingloan01@gmail.com'),'emergency signed PDF section 8');
const special=app.conversationTurn('ใครยื่นได้',app.conversationTurn('เงินกู้พิเศษรวมหนี้คืออะไร').state,{continuation:true});
assert.ok(special.result.answer.includes('36 งวด')&&special.result.answer.includes('60 งวด'),'special signed PDF section 4');
console.log('Scoped loan procedure and official approval index 12/12 PASS');
