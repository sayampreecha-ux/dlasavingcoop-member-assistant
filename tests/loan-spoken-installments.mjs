// Expected thresholds come from emergency 2569 clauses 5(4), 4(5), 4(8), not parser output.
import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const app=loadMemberEngine();let checks=0;
const test=(name,fn)=>{fn();checks++;};
const primary='1XZYfuXWgzqWp6K_Ld0aosuO58pxKXU5p';
for(const product of ['พัฒนาคุณภาพชีวิต','สามัญ','เคหะ'])for(const paid of ['งวดเดียว','หนึ่งงวด','1งวด','๑งวด'])for(const reverse of [false,true])test(product+paid+reverse,()=>{
 const q=reverse?'ขอกู้ฉุกเฉินได้ไหม กู้'+product+'ส่งไปแล้ว'+paid:'กู้'+product+'ส่งไปแล้ว'+paid+' อยากกู้ฉุกเฉินต่อได้ป่าวครับ';
 const t=app.conversationTurn(q),r=t.result;assert.equal(r.decision,'NOT_YET_ELIGIBLE');assert.match(r.answer,/ชำระแล้ว 1 งวด.*อีก 2 งวด/);assert.match(r.answer,/5 \(4\)/);assert.equal(r.requiredFact,null);assert.ok(r.sources.some(x=>x.url.includes(primary)));
 const next=app.conversationTurn('แก้เป็น3งวด',t.state);assert.equal(next.result.decision,'ELIGIBLE_CONDITION');
});
for(const duration of ['เดือนเดียว','หนึ่งเดือน','1เดือน','๑เดือน','3เดือน'])test('month is not payment '+duration,()=>{
 let t=app.conversationTurn('กู้พัฒนาคุณภาพส่งมา'+duration+' กู้ฉุกเฉินได้ไหม');
 assert.equal(t.result.decision,'NEED_INFO');assert.equal(t.result.facts.qualityOfLifeCurrent,null);assert.match(t.result.answer,/หมายถึง.*ชำระจริงแล้ว.*ใช่ไหม/);assert.doesNotMatch(t.result.answer,/อีก 2 งวด/);
 const rejected=app.conversationTurn('ไม่ใช่ครับ',t.state);assert.equal(rejected.result.decision,'NEED_INFO');assert.equal(rejected.result.facts.qualityOfLifeCurrent,null);
 const corrected=app.conversationTurn('ชำระแล้วหนึ่งงวด',rejected.state);assert.equal(corrected.result.decision,'NOT_YET_ELIGIBLE');assert.match(corrected.result.answer,/อีก 2 งวด/);
 const confirmed=app.conversationTurn('ใช่ครับ',t.state);assert.equal(confirmed.result.decision,duration==='3เดือน'?'ELIGIBLE_CONDITION':'NOT_YET_ELIGIBLE');
});
for(const n of [11,12,13])test('restructure specific clause '+n,()=>{
 let t=app.conversationTurn('กู้ปรับโครงสร้างหนี้ส่งแล้ว'+n+'งวดกู้ฉุกเฉินได้ไหม');const r=t.result;
 assert.equal(r.decision,n<12?'NOT_YET_ELIGIBLE':'ELIGIBLE_CONDITION');assert.match(r.answer,/12 งวด/);assert.match(r.answer,/4 \(5\) หน้า 1/);assert.doesNotMatch(r.answer,/3 งวดตามเกณฑ์ทั่วไป/);assert.ok(r.sources.some(x=>x.url.includes(primary)));
 t=app.conversationTurn('แก้เป็น12งวด',t.state);assert.equal(t.result.decision,'ELIGIBLE_CONDITION');assert.match(t.result.answer,/4 \(5\)/);
});
for(const q of ['กู้สามัญส่งแล้ว3งวดแต่ค้าง1งวดขอกู้ฉุกเฉินได้ไหม','กู้สามัญค้างชำระหนึ่งงวดขอกู้ฉุกเฉินได้ไหม','กู้สามัญส่งแล้วหนึ่งงวดแต่ค้างหนึ่งงวดขอกู้ฉุกเฉินได้ไหม'])test('arrears '+q,()=>{
 let t=app.conversationTurn(q);assert.equal(t.result.decision,'NOT_YET_ELIGIBLE');assert.match(t.result.answer,/4 \(8\)/);
 t=app.conversationTurn('แก้เป็น3งวด',t.state);assert.equal(t.result.decision,'NOT_YET_ELIGIBLE');assert.match(t.result.answer,/ค้าง/);
});
test('new arrears fact must not replace paid fact',()=>{let t=app.conversationTurn('กู้สามัญส่งแล้ว3งวดกู้ฉุกเฉินได้ไหม');t=app.conversationTurn('แต่ค้างหนึ่งงวด',t.state);assert.equal(t.result.facts.ordinaryLoanCurrent,3);assert.equal(t.result.decision,'NOT_YET_ELIGIBLE');});
test('income constraint survives installment correction',()=>{let t=app.conversationTurn('กู้สามัญส่งแล้วหนึ่งงวดเงินเหลือ1000บาทขอกู้ฉุกเฉินได้ไหม');t=app.conversationTurn('แก้เป็น3งวด',t.state);assert.equal(t.result.decision,'NOT_YET_ELIGIBLE');assert.match(t.result.answer,/1,?000.*3,?000/);});
test('multiple contracts retain independent payments',()=>{let t=app.conversationTurn('กู้สามัญส่งแล้ว3งวดและกู้เคหะส่งแล้วงวดเดียวขอกู้ฉุกเฉินได้ไหม');assert.match(t.result.answer,/เคหะ.*อีก 2 งวด/);t=app.conversationTurn('แก้เคหะเป็น3งวด',t.state);assert.equal(t.result.decision,'ELIGIBLE_CONDITION');assert.equal(t.result.facts.ordinaryLoanCurrent,3);});
test('resolved requested-product followups have no category question',()=>{let t=app.conversationTurn('กู้พัฒนาคุณภาพส่งแล้วงวดเดียวกู้ฉุกเฉินได้ไหม');for(const [q,re]of [['แล้วผ่อนได้กี่งวด',/15 งวด/],['ต้องใช้เอกสารอะไร',/เอกสารกู้ฉุกเฉิน/]]){t=app.conversationTurn(q,t.state);assert.equal(t.result.domain,'emergencyLoanCurrent');assert.match(t.result.answer,re);assert.doesNotMatch(t.result.answer,/ต้องการถามคุณสมบัติ เอกสาร หรือสถานะ/);}});
console.log('SPOKEN INSTALLMENTS: '+checks+' behavioral checks PASS');
