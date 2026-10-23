import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.equal(scripts.length,3);
new Function(scripts[0])();
new Function(scripts[1])();
const answer=globalThis.COOP_APP.answer;
const cases=[
  ['มีหนี้หลายแห่ง อยากรวมให้เหลือที่เดียว ต้องทำอย่างไร','loan_special_quality_consolidation_navigation','EVIDENCE_LOCK'],
  ['กู้รวมหนิ้ เอาที่ดินค้ำได้ก่อ','loan_special_quality_consolidation_navigation','EVIDENCE_LOCK'],
  ['เงินกู้สามัญพัฒนาคุณภาพชีวิตระยะ 2 ยังสมัครได้ไหม','ordinary_quality_phase2_archived','HISTORICAL_INFORMATION'],
  ['สมาชิกไม่ครบ 3 ปี กู้ระยะ 2 ได้ไหม','ordinary_quality_phase2_archived','HISTORICAL_INFORMATION'],
  ['เงินกู้พิเศษรวมหนี้กับเงินกู้สามัญระยะ 2 ต่างกันอย่างไร','quality_loan_products_comparison','EVIDENCE_LOCK']
];
for(const [q,intent,decision] of cases){
  const r=answer(q);
  assert.equal(r.intent,intent,q);
  assert.equal(r.decision,decision,q);
  assert.ok(!/อนุมัติแล้ว|กู้ได้แน่นอน/.test(r.answer),q);
}
const guarded=answer('กู้รวมหนี้ได้สูงสุดกี่บาท');
assert.ok(['EVIDENCE_LOCK','RULE_INFORMATION'].includes(guarded.decision));
if(guarded.decision==='RULE_INFORMATION'){
  assert.ok(Array.isArray(guarded.sources)&&guarded.sources.length>0,'rule response requires a source');
  assert.ok(guarded.ruleVersion || guarded.evidenceState==='PRIMARY_VERIFIED_CURRENT','numeric rule response requires versioned, verified evidence');
  assert.ok(/ไม่ใช่ผลอนุมัติ|ไม่ใช่วงเงินอนุมัติ|ต้องตรวจ|หลักเกณฑ์/.test(guarded.answer),'must not approve an individual');
}else{
  assert.ok(!/กู้ได้แน่นอน|อนุมัติแล้ว/.test(guarded.answer));
}
const welfare=answer('ส่งเอกสารสวัสดิการคลอดบุตรเป็น PDF ได้ไหม');
assert.ok(!/loan_special_quality|quality_phase2/.test(welfare.intent||''));
console.log('Quality-loan focused routing: 7/7 PASS');
