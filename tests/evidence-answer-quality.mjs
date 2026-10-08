import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
export const qualityCases=[
 ['ทะเบียนบ้านเดียวกันแต่อยู่คนละหลัง บ้านน้ำท่วมขอสวัสดิการได้ไหม',/ที่อยู่อาศัยประจำ/,/ยังสรุปสิทธิไม่ได้/],
 ['บ้านของคู่สมรสน้ำท่วมขอเงินช่วยเหลือได้ไหม',/สิทธิครอบครอง/,/เพียงรายเดียว/],
 ['บ้านเช่าน้ำท่วมขอเงินสวัสดิการได้ไหม',/ไม่รวมบ้านเช่า/],
 ['บ้านน้ำท่วม ต้องใช้เอกสารอะไรยื่นสวัสดิการ',/ภาพถ่าย/,/ประกาศพื้นที่ประสบภัย/,/120 วัน/],
 ['บ้านน้ำท่วม ขอเงินสงเคราะห์ต้องทำยังไง',/1\./,/5\./,/แบบสำรวจ/],
 ['กู้ฉุกเฉินต้องใช้เอกสารอะไร',/เดือนปัจจุบัน/,/หนังสือรับรองเงินเดือน/,/รับรองสำเนา/],
 ['กู้ฉุกเฉินต้องยื่นยังไง',/เตรียมเอกสาร/,/ติดตามผล/,/ไม่ยืนยันวันโอน/],
 ['กู้สามัญต้องใช้เอกสารอะไร',/เครดิตบูโร/,/ย้อนหลัง 3 เดือน/,/ทะเบียนสมรส/],
 ['กู้สามัญต้องใช้เอกสารอะไรและผ่อนได้กี่งวด',/เครดิตบูโร/,/240 งวด/],
 ['กู้ฉุกเฉินต้องใช้เอกสารอะไรและผ่อนได้กี่งวด',/เดือนปัจจุบัน/,/15 งวด/],
 ['กู้สามัญต้องทำยังไง',/2,000,000 บาท/,/240 งวด/,/1\./,/3\./],
 ['กู้เคหะต้องทำอย่างไร',/3,000,000 บาท/,/360 งวด/,/หลักประกัน/],
 ['เงินกู้สามัญและกู้ฉุกเฉินต่างกันยังไง',/240 งวด/,/15 งวด/,/4 เท่า/],
 ['กู้ค่าเทอมต้องใช้เอกสารอะไรและผ่อนได้กี่งวด',/สถานศึกษา/,/60 งวด/],
 ['กู้เพื่อการศึกษาวงเงินเท่าไร และผ่อนได้กี่งวด',/200,000 บาท/,/60 งวด/],
 ['กู้ภัยพิบัติต้องใช้เอกสารอะไรและผ่อนได้กี่งวด',/ความเสียหาย/,/120 งวด/]
];
const app=loadMemberEngine();let pass=0;
for(const [q,...patterns]of qualityCases){const r=app.answer(q);for(const p of patterns)assert.match(r.answer,p,q);assert.ok(r.sources.length,q);assert.doesNotMatch(r.answer,/ให้เปิดประกาศ.*เลือกแบบ/);pass++;}
let turn=app.conversationTurn(qualityCases[0][0]);turn=app.conversationTurn('พักจริง',turn.state,{continuation:true});assert.match(turn.result.answer,/อาศัยอยู่จริง/);assert.equal(turn.result.requiredFact,'ownership');assert.equal(turn.result.facts.residence,true);pass++;
turn=app.conversationTurn('บ้านของตนเอง',turn.state,{continuation:true});assert.match(turn.result.answer,/ยังไม่ถือเป็นผลอนุมัติ/);assert.equal(turn.result.facts.ownership,'member');assert.equal(turn.result.facts.residence,true);assert.equal(turn.result.requiredFact,null);pass++;
let docTurn=app.conversationTurn('ต้องใช้เอกสารอะไร',turn.state,{continuation:true});assert.match(docTurn.result.answer,/ประกาศพื้นที่ประสบภัย/);assert.notEqual(docTurn.result.requiredFact,'residence');pass++;
let switched=app.conversationTurn('กู้สามัญวงเงินเท่าไร',turn.state,{continuation:true});assert.match(switched.result.answer,/2,000,000 บาท/);assert.notEqual(switched.result.intent,'welfare_disaster');pass++;
let typoStart=app.conversationTurn(qualityCases[0][0]);let typoReply=app.conversationTurn('พักจิง',typoStart.state,{continuation:true});assert.equal(typoReply.result.facts.residence,true);assert.equal(typoReply.result.requiredFact,'ownership');pass++;
for(const q of ['ยอดหนี้ของผมเท่าไร','กู้ฉุกเฉิน ณ วันที่ 1 กันยายน 2569 ต้องใช้เอกสารอะไร','ขอสวัสดิการใหม่ตามระเบียบปี 2570 ได้เท่าไร']){const r=app.answer(q);assert.ok(r.privacy||/EVIDENCE|LOCK|MEMBER/.test(r.decision||'')||/ยืนยัน|ข้อมูล/.test(r.answer));pass++;}
console.log('EVIDENCE ANSWER QUALITY:',pass,'PASS / 0 FAIL');
