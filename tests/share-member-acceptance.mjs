import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const app=loadMemberEngine();
const kb=JSON.parse(fs.readFileSync(new URL('../data/share-rules-2569.review.json',import.meta.url),'utf8'));
const documentUrl=kb.source_documents[0].url, formUrl=kb.form.url;
const cases=[
 ['หุ้นและทุนเรือนหุ้น','share_all'],
 ['เปลี่ยนอัตราหุ้นรายเดือน','share_change_rate'],
 ['ซื้อหุ้นเพิ่ม','share_purchase'],
 ['ถอนหุ้นได้ไหม','share_refund'],
 ['ยอดหุ้นของผมเท่าไร','member_self_service'],
];
let count=0;
for(const [q,intent] of cases){
 const a=app.answer(q);
 assert.equal(a.intent,intent,JSON.stringify({q,got:a.intent}));
 assert.ok(a.answer?.length>20, 'empty answer: '+q);
 count++;
}
for(const q of ['เปลี่ยนอัตราหุ้นรายเดือน','เพิ่มอัตราหุ้น','ลดอัตราหุ้น']){
 const a=app.answer(q);
 assert.equal(a.intent,'share_change_rate',q);
 assert.ok(a.actions?.some(x=>x[1]===formUrl), 'no direct form: '+q);
 assert.ok(a.sources?.some(x=>x.url===documentUrl), 'no direct regulation: '+q);
 count++;
}
const rates=[
 ['เงินเดือน 14,999 บาท ปัจจุบันต้องถือหุ้นเดือนละเท่าไร',/500 บาท/],
 ['เงินเดือน 32,000 บาท ปัจจุบันต้องถือหุ้นเดือนละเท่าไร',/1,300 บาท/],
 ['เงินเดือน 50,001 บาท ปัจจุบันต้องถือหุ้นเดือนละเท่าไร',/2,100 บาท/],
];
for(const [q,re] of rates){
 const a=app.answer(q);
 assert.match(a.answer,re,q);
 assert.ok(a.sources?.some(x=>x.url===documentUrl), 'missing primary: '+q);
 count++;
}
const gap=app.answer('เงินเดือน 15,000 บาท ปัจจุบันต้องถือหุ้นเดือนละเท่าไร');
assert.ok(gap.decision==='EVIDENCE_LOCK'||!/(?:500|700) บาท/.test(gap.answer),'must not infer rate at missing interval');count++;
console.log('MEMBER SHARE ACCEPTANCE: '+count+' cases PASS');
