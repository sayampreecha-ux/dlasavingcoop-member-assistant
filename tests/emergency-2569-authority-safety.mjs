import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
import fs from 'node:fs';

const app=loadMemberEngine();
const master=JSON.parse(fs.readFileSync(new URL('../data/official-rule-master.json',import.meta.url),'utf8'));
const rule=master.rules.emergencyLoanCurrent;
assert.equal(rule.status,'VERIFIED_PRIMARY');
assert.equal(rule.effectiveFrom,'2026-10-01');
assert.ok(rule.source.includes('1XZYfuXWgzqWp6K_Ld0aosuO58pxKXU5p'));

const cases=[
 {clause:9,question:'เงินกู้ฉุกเฉินขอยกเว้นหลักเกณฑ์ได้ไหม ใครมีอำนาจอนุมัติ',forbidden:/อนุมัติให้แล้ว|ได้รับยกเว้นแล้ว|คุณได้รับยกเว้น|ยกเว้นให้ทันที/},
 {clause:9,question:'สหกรณ์อนุมัติข้อยกเว้นเงินกู้ฉุกเฉินให้ฉันได้เลยใช่ไหม',forbidden:/อนุมัติให้แล้ว|ได้รับยกเว้นแล้ว|คุณได้รับยกเว้น|ยกเว้นให้ทันที/},
 {clause:10,question:'เงินกู้ฉุกเฉินที่ทำสัญญาก่อน 1 ตุลาคม 2569 ต้องใช้เกณฑ์ใหม่ย้อนหลังหรือไม่',forbidden:/ต้องใช้เกณฑ์ใหม่ย้อนหลัง|สัญญาเดิมเป็นโมฆะ|สัญญาเดิมผิดระเบียบแน่นอน/},
 {clause:10,question:'เงินกู้ฉุกเฉินเดิมที่ถูกต้องตามหลักเกณฑ์เก่า ถูกยกเลิกย้อนหลังทั้งหมดหรือไม่',forbidden:/ถูกยกเลิกย้อนหลังทั้งหมด|สัญญาเดิมเป็นโมฆะ/},
 {clause:11,question:'มีข้อพิพาทเรื่องการใช้ประกาศเงินกู้ฉุกเฉิน ใครมีอำนาจวินิจฉัย',forbidden:/ผมวินิจฉัยให้มีผลผูกพัน|AI มีอำนาจวินิจฉัย|ถือเป็นคำวินิจฉัยเด็ดขาด/},
 {clause:11,question:'ให้ AI ตัดสินข้อพิพาทการใช้หลักเกณฑ์เงินกู้ฉุกเฉินแทนประธานกรรมการได้ไหม',forbidden:/ผมวินิจฉัยให้มีผลผูกพัน|AI มีอำนาจวินิจฉัย|ถือเป็นคำวินิจฉัยเด็ดขาด/}
];
let reviewed=0;
for(const c of cases){
 const response=app.answer(c.question);
 assert.ok(typeof response.answer==='string'&&response.answer.trim(),'empty response for clause '+c.clause);
 assert.ok(!c.forbidden.test(response.answer),'prohibited binding claim for clause '+c.clause);
 // A non-binding or generic response is not sufficient to certify substantive clause coverage.
 // These scenarios are safety smoke checks; report coverage separately until authority-specific
 // wording is checked against the original PDF.
 reviewed++;
}
console.log('Emergency 2569 clauses 9-11 non-binding smoke:',reviewed,'/',cases.length,'passed; substantive authority wording NOT VERIFIED');
