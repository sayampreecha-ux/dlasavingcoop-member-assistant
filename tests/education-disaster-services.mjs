import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
// Public synthetic scenarios grounded in the complete 2569 announcements and
// official form checklists. Require facts in the primary answer itself.
export const educationDisasterCases=[
 ['กู้เพื่อการศึกษา',/200,000 บาท/,/60 งวด/,/บุตรบุญธรรม/,/2,000,000 บาท/],
 ['หลักเกณฑ์กู้การศึกษา',/6 เดือน/,/6 งวด/,/15%/,/6,000 บาท/],
 ['กู้เพื่อการศึกษาวงเงินสูงสุดเท่าไร',/200,000 บาท/,/2,000,000 บาท/],
 ['กู้สามัญเพื่อการศึกษาผ่อนได้กี่งวด',/60 งวด/,/75 ปี/],
 ['กู้เพื่อการศึกษาต้องใช้เอกสารอะไร',/สถานศึกษา/,/ค่าใช้จ่าย/,/ย้อนหลัง 3 เดือน/],
 ['กู้เพื่อการศึกษาคนค้ำต้องมีหุ้นกี่เดือน',/6 เดือน/,/ไม่ใช่คู่สมรส/,/ไม่เกิน 3 คน/],
 ['กู้เพื่อการศึกษาต้องใช้ผู้ค้ำกี่คน',/อย่างน้อย 1 คน/],
 ['กู้เพื่อการศึกษาส่งทางไหน',/ไปรษณีย์/,/Mobile\/Web Application/],
 ['กู้ภัยพิบัติ',/300,000 บาท/,/120 งวด/,/180 วัน/,/2,000,000 บาท/],
 ['กู้น้ำท่วม',/300,000 บาท/,/120 งวด/,/180 วัน/],
 ['กู้ไฟไหม้',/300,000 บาท/,/บิดา/,/มารดา/],
 ['กู้ช่วยเหลือกรณีภัยพิบัติผ่อนได้กี่งวด',/120 งวด/,/75 ปี/],
 ['กู้ช่วยเหลือภัยพิบัติต้องยื่นภายในกี่วัน',/180 วัน/,/นับตั้งแต่วันที่เกิดภัย/,/หนังสือรับรอง/],
 ['กู้ภัยพิบัติได้เท่าไร',/300,000 บาท/,/2,000,000 บาท/],
 ['กู้ภัยพิบัติต้องใช้เอกสารอะไร',/ภาพถ่ายความเสียหาย/,/แบบ ปภ./,/ทะเบียนบ้านที่เสียหาย/],
 ['กู้ภัยพิบัติผู้ค้ำต้องเป็นสมาชิกกี่เดือน',/6 เดือน/,/ไม่ใช่คู่สมรส/,/ไม่เกิน 3 คน/],
 ['กู้ภัยพิบัติเงินเหลือต้องเท่าไร',/15%/,/6,000 บาท/],
 ['กู้ภัยพิบัติส่งทางไหน',/ไปรษณีย์/,/Mobile\/Web Application/]
];
if(process.argv[1]===new URL(import.meta.url).pathname){
 const app=loadMemberEngine();let pass=0;
 const fireInsurance=app.answer('กู้สามัญประกันไฟไหม้กี่ปี');assert.equal(fireInsurance.domain,'ordinaryLoanCurrent');assert.ok(!app.freshnessStatus('กู้สามัญประกันไฟไหม้กี่ปี').domains.includes('disasterLoan'));pass++;
 for(const [q,...checks]of educationDisasterCases){const r=app.answer(q);assert.equal(r.decision,'RULE_INFORMATION',q);for(const check of checks)assert.match(r.answer,check,q);assert.ok(r.sources.length);assert.doesNotMatch(r.answer,/undefined|NaN|กู้ได้แน่นอน/);pass++;}
 for(const key of ['education','disaster']){
  const prefix=key==='education'?'กู้เพื่อการศึกษา':'กู้ภัยพิบัติ';
  let t=app.conversationTurn(prefix);t=app.conversationTurn('ผ่อนได้กี่งวด',t.state);assert.match(t.result.answer,key==='education'?/60 งวด/:/120 งวด/);pass++;
  const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),reg=loadMemberEngine().getSourceRegistry();
  reg.ruleVersions.find(v=>v.ruleId===key&&v.status==='CURRENT').values.maxAmountBaht=187654;
  const changed=loadMemberEngine(html.replace(/globalThis\.OFFICIAL_SOURCE_REGISTRY=.*?;\n/,'globalThis.OFFICIAL_SOURCE_REGISTRY='+JSON.stringify(reg)+';\n'));assert.match(changed.answer(prefix).answer,/187,654 บาท/);pass++;
  for(const pendingReason of ['PRIMARY_LINK_REMOVED','PRIMARY_DOCUMENT_BYTES_CHANGED']){
   const a=loadMemberEngine(),snapshot=a.getSourceRegistry(),v=snapshot.ruleVersions.find(v=>v.ruleId===key&&v.status==='CURRENT'),doc=snapshot.documents.find(d=>d.id===v.documentId);
   Object.assign(doc,{status:'PENDING',mayAffectRules:true,pendingReason,contentHash:'changed-unreviewed-content'});a.applySourceMonitor(snapshot);const r=a.answer(prefix);assert.equal(r.decision,'EVIDENCE_LOCK');assert.doesNotMatch(r.answer,/200,000|300,000|60 งวด|120 งวด/);pass++;
  }
  assert.equal(app.answer(prefix+' วันที่ 1 กันยายน 2569 วงเงินเท่าไร').decision,'EVIDENCE_LOCK');pass++;
 }
 console.log('EDUCATION DISASTER SERVICES:',pass,'PASS / 0 FAIL; actual primary answers, follow-up, version changes and evidence locks verified');
}
