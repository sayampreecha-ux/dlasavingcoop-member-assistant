import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const app=loadMemberEngine();let pass=0;
const checkEntry=()=>{const r=app.depositEntry('เงินฝาก');assert.equal(r.decision,'NAVIGATION_ONLY');assert.equal(r.status,'เลือกประเภทเงินฝาก');assert.match(r.answer,/ต้องการทำรายการเงินฝากประเภทใด/);assert.doesNotMatch(r.answer,/ยืนยันหลักฐาน|500|3\.25|1%/);assert.equal(r.actions.length,0);assert.equal(r.sources.length,0);assert.equal(app.depositNavigation('เงินฝาก',r).items.length,2);pass++;};
checkEntry();
for(const q of ['ออมทรัพย์พิเศษ','เปิดบัญชีเงินฝาก','เงินฝากถอนขั้นต่ำเท่าไร','เงินฝากยอดของผม','เงินฝาก OTP 123456','เงินฝากสมาคมฌาปนกิจ','เงินฝาก ณ ปี 2565']){assert.equal(app.depositEntry(q),null);pass++;}
const snapshot=app.getSourceRegistry();snapshot.documents.push({id:'entry-pending-member-deposit-rule',title:'ระเบียบรับฝากเงินสมาชิกฉบับใหม่',affects:['deposits'],type:'REGULATION',status:'PENDING',mayAffectRules:true,originalUrl:'https://www.dlasavingcoop.com/show.php?No=807',linkVerified:true});app.applySourceMonitor(snapshot);
checkEntry();
for(const q of ['เปิดบัญชีออมทรัพย์พิเศษ','ออมทรัพย์พิเศษฝากเพิ่ม','ออมทรัพย์พิเศษถอนเงิน','ออมทรัพย์พิเศษปิดบัญชี','ออมทรัพย์พิเศษดอกเบี้ย']){assert.equal(app.depositEntry(q),null);const r=app.answer(q);assert.equal(r.decision,'EVIDENCE_LOCK');assert.doesNotMatch(r.answer,/500 บาท|3\.25%|1%/);pass++;}
assert.equal(app.answer('ฝากพิเศษ OTP 123456 ช่วยตรวจยอด').decision,'SAFE_HANDOFF');pass++;
console.log('DEPOSIT ENTRY:',pass,'PASS / 0 FAIL; category navigation is not a rule claim, destinations retain evidence/privacy gates');
