import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
// Deterministic evidence snapshot, NOT a production freshness override.
const RealDate=globalThis.Date;
globalThis.Date=class extends RealDate { constructor(...a){super(...(a.length?a:['2026-10-10T12:00:00Z']));} static now(){return new RealDate('2026-10-10T12:00:00Z').getTime();} };
try {
 const app=loadMemberEngine();
 const cases=[
 ['กู้รวมหนี้ต้องทำประกันชีวิตไหม',/ตลอดอายุสัญญา.*สหกรณ์.*ผู้รับประโยชน์/],
 ['กู้สามัญปรับโครงสร้างหนี้ต้องส่งกี่งวดก่อนกู้สามัญใหม่',/24 งวด/],
 ['กู้เคหะชำระต้นดอกแบบไหน',/ต้นเงินและดอกเบี้ยรวมกัน.*เท่ากัน/,/ต้นเงินรายเดือนเท่ากันพร้อมดอกเบี้ย/],
 ['กู้รวมหนี้ชำระต้นดอกแบบไหน',/ต้นเงินรายเดือนเท่ากันพร้อมดอกเบี้ย/],
 ['กู้ไถ่ถอนจำนองชำระต้นดอกแบบไหน',/ต้นเงินรายเดือนเท่ากันพร้อมดอกเบี้ย/],
 ['กู้ไถ่ถอนจำนองต้องทำประกันอัคคีภัยไหม',/3 ปี/,/ยังไม่มี|ก่อนยืนยัน/],
 ['ผู้ค้ำกู้สามัญต้องส่งหุ้นกี่เดือน',/6 เดือน/,/อายุสมาชิก\/หุ้น.*ต้องตรวจ/],
 ['คุณสมบัติผู้ค้ำกู้สามัญ',/ไม่ใช่คู่สมรส/],
 ['คุณสมบัติผู้ค้ำกู้สามัญ',/เจ้าหน้าที่สหกรณ์.*3 ปี/],
 ['กู้รวมหนี้หักเงินเดือนอย่างไร',/หรือวิธีอื่น.*รายกรณี/],
 ['กู้สามัญใหม่ต้องหักกลบกู้เคหะด้วยไหม',/ยกเว้น.*เคหะ/,/ขอ.*งวด|ชำระ.*กี่งวด/]
 ];
 for(const [q,yes,no] of cases){const r=app.answer(q);assert.equal(r.decision,'RULE_INFORMATION',q);assert.match(r.answer,yes,q);if(no)assert.doesNotMatch(r.answer,no,q);}
 const master=JSON.parse(fs.readFileSync(new URL('../data/official-rule-master.json',import.meta.url)));
 assert.equal(master.rules.ordinaryLoanCurrent.restructuredOrdinaryMinInstallments,24);
 assert.equal(master.rules.emergencyLoanCurrent.restructuredOrdinaryMinInstallments,12);
 assert.equal(master.rules.qualityOfLifeCurrent.lifeInsuranceRequired,true);
 assert.ok(!('deathBeforeContractEnd' in master.rules.specialHousingCurrent));
 const housingActions=app.answer('กู้เคหะ').actions;
 assert.ok(housingActions.some(([label,url])=>/หน้ารวมแบบฟอร์ม/.test(label)&&!/drive.google.com/.test(url)));
 assert.ok(housingActions.some(([label,url])=>/หลักเกณฑ์/.test(label)&&url.includes('1PDrTLU46Q8y9qJju6KixhU4atYjDCLkn')));
 const registry=app.getSourceRegistry();
 for(const id of ['ordinaryLoanCurrent','specialHousingCurrent','qualityOfLifeCurrent','redeemMortgageCurrent']){
  assert.deepEqual(JSON.parse(JSON.stringify(registry.ruleVersions.find(v=>v.ruleId===id&&v.status==='CURRENT').values)),master.rules[id]);
 }
 const locked=loadMemberEngine(), pending=locked.getSourceRegistry();
 const current=pending.ruleVersions.find(v=>v.ruleId==='ordinaryLoanCurrent'&&v.status==='CURRENT');
 Object.assign(pending.documents.find(d=>d.id===current.documentId),{status:'PENDING',mayAffectRules:true,pendingReason:'PRIMARY_DOCUMENT_BYTES_CHANGED',contentHash:'fixture-changed-unreviewed-bytes'});
 locked.applySourceMonitor(pending);
 assert.equal(locked.answer('กู้สามัญใหม่ต้องหักกลบกู้เคหะด้วยไหม').decision,'EVIDENCE_LOCK');
 assert.equal(locked.answer('กู้สามัญปรับโครงสร้างหนี้ต้องส่งกี่งวดก่อนกู้สามัญใหม่').decision,'EVIDENCE_LOCK');
 globalThis.Date=class extends RealDate { constructor(...a){super(...(a.length?a:['2026-10-20T12:00:00Z']));} static now(){return new RealDate('2026-10-20T12:00:00Z').getTime();} };
 assert.equal(loadMemberEngine().answer('กู้เคหะชำระต้นดอกแบบไหน').decision,'EVIDENCE_LOCK');
 console.log('LOAN PRIMARY AUDIT: repayment, guarantors, insurance, offset, version parity and stale lock PASS');
} finally {globalThis.Date=RealDate;}
