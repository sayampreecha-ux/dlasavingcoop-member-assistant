import assert from 'node:assert/strict';
import fs from 'node:fs';
import F from '../scripts/official-freshness.js';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const corpus=JSON.parse(fs.readFileSync(new URL('../data/legacy-line-69-corpus.json',import.meta.url),'utf8'));
const app=loadMemberEngine(),registry=app.getSourceRegistry();let pass=0,numeric=0;
const master=JSON.parse(fs.readFileSync(new URL('../data/official-rule-master.json',import.meta.url),'utf8'));
// Questions and intent persist. Expected evidence and numeric facts are resolved from
// the dated, reviewed version, independently of legacy_answer/pattern_assertions.
for(const row of corpus.records){
 for(const raw of row.question_patterns){
  const q=row.expected_rule?app.contextualize(raw,row.expected_rule):raw,r=app.answer(q),check=app.freshnessStatus(q);
  assert.ok(r.answer?.length>5);assert.notEqual(r.intent,'fallback');
  if(!check.allowed){assert.equal(r.decision,'EVIDENCE_LOCK');pass++;continue;}
  if(row.expected_rule&&registry.ruleVersions.some(v=>v.ruleId===row.expected_rule)){
   const v=F.versionAt(registry,row.expected_rule,check.date);assert.equal(v.status,'CURRENT');
   const R=v.values,expectedSource=/ดอกเบี้ย|ดอก.*(?:เท่า|กี่|เปอร์เซ็นต์)/.test(q)?master.interestRatesCurrent.source:R.source;assert.ok(r.sources.some(s=>F.canonical(s.url)===F.canonical(expectedSource)),'Current primary source must replace obsolete expected URLs');
   const all=[r.answer,...(r.details||[])].join(' '),contains=value=>assert.ok(all.includes(String(value))||all.includes(Number(value).toLocaleString('th-TH')),'Missing CURRENT fact '+value);
   if(/ผ่อน.*(?:กี่งวด|สูงสุด|กี่ปี)|จำนวนงวดสูงสุด/.test(q)&&!/มาก่อน|สัญญาเดิม|หักกลบ/.test(q)&&R.maxTermInstallments){contains(R.maxTermInstallments);numeric++;}
   if(/วงเงินสูงสุด|กู้.*สูงสุด.*เท่า|กู้.*มากสุด.*เท่า/.test(q)&&R.maxAmountBaht){contains(R.maxAmountBaht);numeric++;}
   if(/เงิน.*(?:คงเหลือ|ต้องเหลือ|เหลือ.*เท่า)/.test(q)&&R.remainingIncomeMinBaht){contains(R.remainingIncomeMinBaht);numeric++;}
   if(/รายได้.*เหลือ|เงินเดือน.*เหลือ/.test(q)&&R.remainingIncomeMinBaht){contains(R.remainingIncomeMinBaht);numeric++;}
   if(/ต้องเป็นสมาชิกกี่เดือน/.test(q)&&R.membershipMinMonths){contains(R.membershipMinMonths);numeric++;}
  }
  assert.ok(!r.sources.some(s=>/facebook|line\.me|board_content/.test(s.url)));
  pass++;
 }
}
// Simulated real-member questions from the cooperative LINE discussion.
const pilotCases=[
 {question:'กู้พัฒนาคุณภาพชีวิตแล้ว ส่งเงินต้นเพิ่ม 3 งวด จะกู้เพื่อการศึกษาได้เลยไหม',intent:'quality_life_to_education_loan_review',lock:'EVIDENCE_LOCK'},
 {question:'เงินกู้สามัญ ผู้ค้ำประกันต้องเป็นสมาชิกประเภทสามัญหรือไม่',intent:'ordinary_guarantor_membership_type_review',lock:'EVIDENCE_LOCK'},
 {question:'ผู้ค้ำกู้สามัญต้องเป็นสมาชิกกี่เดือน',notIntent:'ordinary_guarantor_membership_type_review'},
 {question:'ค้ำกู้สามัญต้องเป็นสมาชิกกี่เดือน',notIntent:'ordinary_guarantor_membership_type_review'}
];
for(const item of pilotCases){
 const result=app.answer(item.question);
 assert.ok(result.answer?.length>15,'Empty member answer: '+item.question);
 if(item.intent)assert.equal(result.intent,item.intent,'Wrong member routing: '+item.question);
 if(item.notIntent)assert.notEqual(result.intent,item.notIntent,'Existing duration routing overridden');
 if(item.lock)assert.equal(result.decision,item.lock,'Unsafe loan eligibility claim');
 assert.ok(result.sources?.length,'Missing official source: '+item.question);
}
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert.ok(!html.includes('ค้นหาประกาศทางการและเปิดอ่าน (ทุกเมนู)'),'Removed clutter panel returned');
console.log('LINE PILOT SIMULATION: 4 member questions + clean UI assertions PASS');
assert.equal(corpus.records.length,69);assert.equal(pass,306);assert.ok(numeric>=20,'Numeric expectations must actually execute');
console.log('CURRENT RULE CORPUS:',pass,'patterns PASS,',numeric,'numeric contracts from CURRENT versions; 69 permanent records retained');
