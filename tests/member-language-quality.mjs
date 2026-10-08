import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';

// Public synthetic usability cases, independent of the private acceptance corpus.
export const languageCases=[
 ['อยากกู้เงินสามัน ต้องเตรียมไรบ้าง',/เครดิตบูโร/,/ย้อนหลัง 3 เดือน/],
 ['จะเอาเงินฉุกเฉีนต้องทำไง',/เอกสาร/,/ติดตามผล/],
 ['กู้ฉุกเฉินใช้ไรบ้าง',/หนังสือรับรองเงินเดือน/,/เดือนปัจจุบัน/],
 ['กู้เรียนต้องเตรียมไร',/สถานศึกษา/],
 ['กู้สามัญได้เท่าไหร่ ผ่อนนานแค่ไหน ใช้เอกสารไร',/2,000,000 บาท/,/240 งวด/,/เครดิตบูโร/],
 ['กู้ฉุกเฉินดอกเท่าไร แล้วผ่อนกี่งวด',/7.50%/,/15 งวด/],
 ['กู้บ้านกับรวมหนี้ต่างกันยังไง',/กู้เคหะ/,/กู้พัฒนาคุณภาพชีวิต/,/360 งวด/],
 ['กู้ซื้อบ้านเริ่มยังไง',/ขั้นตอน/,/เครดิตบูโร/,/3,000,000 บาท/],
 ['กู้รวมหนี้ต้องเตรียมเอกสารอะไร',/รายงานเครดิตบูโร/,/สัญญาจำนอง/],
 ['กู้ไถ่ถอนจำนองต้องเตรียมไรบ้าง',/ใบเสร็จงวดสุดท้ายย้อนหลัง 3 เดือน/,/สัญญากู้เดิม/],
 ['คลอดลูกขอเงินทำไง',/ขั้นตอน/,/สูติบัตร/,/120 วัน/],
 ['แต่งงานต้องใช้หลักฐานอะไร',/ทะเบียนสมรสหน้าและหลัง/],
 ['เรียนจบขอเงินทำไง',/ขั้นตอน/,/หนังสือรับรอง/,/มหาวิทยาลัย/],
 ['แม่เสียต้องเตรียมไรบ้าง',/มรณบัตร/,/คู่สมรส/,/120 วัน/],
 ['บวชต้องใช้เอกสารอะไร',/ศาสนกิจ/,/รับรอง/],
 ['สมาชิกเสียชีวิตต้องใช้เอกสารอะไร',/มรณบัตร/,/2 ชุด/,/ผู้รับโอนประโยชน์/],
 ['ขอเงินค่าเทอมให้ลูกต้องใช้อะไรบ้าง',/เงินกู้เพื่อการศึกษา/,/สวัสดิการทุนการศึกษาบุตร/,/ขอแยกก่อน/],
 ['ต้องส่งหุ้นเดือนละเท่าไหร่',/เงินได้รายเดือน/,/ไม่ต้องส่งเลขสมาชิก/]
];
const app=loadMemberEngine();let pass=0;
for(const [q,...patterns] of languageCases){const r=app.answer(q);for(const p of patterns)assert.match(r.answer,p,q);assert.notEqual(r.intent,'fallback',q);pass++;}
for(const q of ['คลอดลูกขอเงินทำไง','แต่งงานต้องใช้หลักฐานอะไร','เรียนจบขอเงินทำไง','แม่เสียต้องเตรียมไรบ้าง']){
 const t=app.conversationTurn(q),next=app.conversationTurn('ต้องใช้เอกสารอะไร',t.state,{continuation:true});
 assert.equal(next.result.intent,t.result.intent);assert.match(next.result.answer,/เอกสาร/);assert.ok(next.result.sources.length);pass++;
 const switched=app.conversationTurn('กู้ฉุกเฉินผ่อนกี่งวด',next.state,{continuation:true});assert.match(switched.result.answer,/15 งวด/);pass++;
}
const shares=app.conversationTurn(languageCases.at(-1)[0]);
assert.equal(shares.result.requiredFact,'grossMonthlyIncome');pass++;
assert.match(app.conversationTurn('32000',shares.state,{continuation:true}).result.answer,/130 หุ้น/);pass++;
assert.equal(app.conversationTurn('15000',shares.state,{continuation:true}).result.decision,'EVIDENCE_LOCK');pass++;
const education=app.conversationTurn(languageCases.at(-2)[0]);
assert.equal(education.result.requiredFact,'educationPurpose');pass++;
assert.match(app.conversationTurn('กู้เพื่อการศึกษา',education.state,{continuation:true}).result.answer,/สถานศึกษา/);pass++;
for(const q of ['ยอดหนี้ของผมเท่าไร','กู้สามัญอนุมัติวันไหน','กู้เคหะ ณ วันที่ 1 กันยายน 2569 ต้องใช้เอกสารอะไร','คลอดลูกตามระเบียบปี 2570 ต้องใช้เอกสารอะไร']){
 const r=app.answer(q);assert.ok(r.privacy||/LOCK|LIVE|MEMBER|VERIFY/.test(r.decision||''));assert.doesNotMatch(r.answer,/อนุมัติแน่นอน|เงินเข้าแน่นอน/);pass++;
}
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const expired=loadMemberEngine(html.replace(/(const SERVICE_EVIDENCE=\{[^\n]*?"reviewedAt":)"[^"]+"/,'$1"2000-01-01T00:00:00Z"'));
assert.equal(expired.answer('คลอดลูกต้องใช้เอกสารอะไร').decision,'EVIDENCE_LOCK');pass++;
const stale=loadMemberEngine(html.replace(/"lastSuccessfulCheck":"[^"]+"/g,'"lastSuccessfulCheck":"2000-01-01T00:00:00Z"'));
for(const q of ['บวชต้องใช้เอกสารอะไร','สมาชิกเสียชีวิตต้องใช้เอกสารอะไร','เรียนจบต้องใช้เอกสารอะไร']){const r=stale.answer(q);assert.match(r.decision,/LOCK/);assert.doesNotMatch(r.answer,/สูติบัตร|มรณบัตร|120 วัน/);pass++;}
assert.match(app.answer('บ้านโดนน้ำท่วม ขอเงินช่วยเหลือยังไง').answer,/แบบสำรวจ/);pass++;
console.log('MEMBER LANGUAGE QUALITY:',pass,'PASS / 0 FAIL');
