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
for(const [q,expected] of [['ใครมีสิทธิ','6 เดือน'],['ส่งที่ไหน','111/1'],['มีเงื่อนไขผลการเรียนไหม','ไม่ได้กำหนดเกรดเฉลี่ยขั้นต่ำ']]){
 const start=app.conversationTurn('ทุนการศึกษาบุตรสมาชิก');
 const t=app.conversationTurn(q,start.state,{continuation:true});
 assert.equal(t.state.topic,'scholarship',q);
 assert.ok(t.result.answer.includes(expected),q);
 assert.ok(t.result.sources.some(x=>x.url?.includes('drive.google.com/file/d/')),q+' primary source');
}
for(const [q,expected] of [['ใช้เอกสารอะไร','สมุดบัญชี'],['ต้องติดต่อที่ไหน','dla.deposit01@gmail.com']]){
 const start=app.conversationTurn('เงินฝากออมทรัพย์พิเศษ');
 const t=app.conversationTurn(q,start.state,{continuation:true});
 assert.equal(t.state.topic,'depositSpecial',q);
 assert.equal(t.result.intent,'deposit_scoped_official_procedure',q);
 assert.equal(t.result.decision,'PROCEDURE_INFORMATION',q);
 assert.ok(t.result.answer.includes(expected),q);
 assert.ok(t.result.sources.some(x=>x.url?.includes('dlasavingcoop.com/show.php?No=807')),q);
}
const debtOverview=app.conversationTurn('เงินกู้พิเศษรวมหนี้คืออะไร');
assert.equal(debtOverview.result.intent,'special_debt_explained_verified');
assert.ok(debtOverview.result.answer.includes('80')&&debtOverview.result.answer.includes('5 ล้านบาท'));
const shareIntro=app.conversationTurn('การส่งหุ้นรายเดือน');
const shareMax=app.conversationTurn('ส่งหุ้นสูงสุดเท่าไร',shareIntro.state,{continuation:true});
assert.equal(shareMax.result.intent,'share_monthly_max_verified');
assert.ok(shareMax.result.answer.includes('5,000 หุ้นต่อเดือน'));
const emergencyIntro=app.conversationTurn('เงินกู้ฉุกเฉินกู้ได้ไหม');
const emergencyGuarantee=app.conversationTurn('ใช้คนค้ำไหม',emergencyIntro.state,{continuation:true});
assert.equal(emergencyGuarantee.result.intent,'emergency_guarantor_document_scope');
assert.equal(emergencyGuarantee.result.decision,'EVIDENCE_LOCK');
assert.ok(emergencyGuarantee.result.sources.length>=2);
console.log('Scoped loan, scholarship, deposits and official approval index 20/20 PASS');
