import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
export const depositCases=[
 ['เปิดบัญชีเงินฝากออมทรัพย์พิเศษยังไง',/500 บาท/,/0000011/,/ครั้งแรก/],
 ['ฝากพิเศษเริ่มต้นกี่บาท',/500 บาท/],
 ['ฝากพิเศษฝากเพิ่มขั้นต่ำกี่บาท',/ฝากเพิ่มแต่ละครั้งขั้นต่ำ 500 บาท/,/ข้อ 13/],
 ['ฝากพิเศษฝากเพิ่มยังไง',/7196/,/ไม่ใช้แทนบัญชีเดิม/],
 ['ฝากพิเศษดอกเบี้ยปัจจุบันเท่าไร',/3.25%/,/ยังไม่ได้ยืนยัน/,/2565/],
 ['ฝากพิเศษถอนเงินได้ไหม',/คำขอถอน/,/เดือนละ 1 ครั้ง/,/1%/,/100 บาท/],
 ['ฝากพิเศษถอนครั้งที่สองเสียค่าธรรมเนียมไหม',/1%/,/100 บาท/],
 ['ปิดบัญชีฝากพิเศษต้องใช้อะไร',/เล่มสีเขียว/,/ไปรษณีย์/,/วันก่อน/],
 ['ฝากพิเศษถอนแล้วต้องเหลือยอดขั้นต่ำเท่าไร',/500 บาท/,/เว้นแต่ถอนปิดบัญชี/,/ข้อ 13/],
 ['ฝากพิเศษดอกเบี้ยจ่ายวันไหน',/ทุกวันสิ้นเดือน/,/ต่ำกว่า 500 บาท/,/ไม่คิดดอกเบี้ย/],
 ['ฝากพิเศษยอดของผมเหลือเท่าไร',/ยืนยันตัวตน/,/ไม่ส่ง/],
 ['ฝากพิเศษส่ง OTP ให้ดูยอดได้ไหม',/ไม่ส่ง/,/OTP/],
 ['ออมทรัพย์พิเศษค้ำอยู่ เปลี่ยนหลักประกันแล้วถอนได้เลยไหม',/ยังไม่ยืนยัน/,/หลักประกัน/]
];
const app=loadMemberEngine();let pass=0;
for(const [q,...patterns] of depositCases){const r=app.answer(q);for(const p of patterns)assert.match(r.answer,p,q);assert.ok(r.sources.length);pass++;}
for(const q of ['ฝากพิเศษยอดของผมเหลือเท่าไร','ฝากพิเศษส่ง OTP ให้ดูยอดได้ไหม']){const r=app.answer(q);assert.equal(r.privacy,true);assert.ok(r.actions.some(x=>x[1]==='https://member.dlasavingcoop.com/coop/'));pass++;}
assert.equal(app.answer(depositCases.at(-1)[0]).intent,'deposit_collateral_release');pass++;
assert.equal(app.answer(depositCases[4][0]).decision,'EVIDENCE_LOCK');pass++;
assert.match(app.answer(depositCases[0][0]).intent,/deposit_open/);pass++;
assert.equal(app.answer(depositCases[2][0]).intent,'deposit_special_add');pass++;
const pending=loadMemberEngine(),snapshot=pending.getSourceRegistry();snapshot.documents.push({id:'synthetic-deposit-change',title:'ประกาศเงินฝากฉบับใหม่',affects:['deposits'],type:'ANNOUNCEMENT',status:'PENDING',mayAffectRules:true,originalUrl:'https://www.dlasavingcoop.com/show.php?No=3964',officialIndexUrl:'https://www.dlasavingcoop.com/show.php?No=3964',linkVerified:true,pendingReason:'NEW_OFFICIAL_DOCUMENT'});pending.applySourceMonitor(snapshot);assert.equal(pending.answer('เปิดบัญชีฝากพิเศษขั้นต่ำกี่บาท').decision,'EVIDENCE_LOCK');pass++;
const association=loadMemberEngine(),associationSnapshot=association.getSourceRegistry();associationSnapshot.documents.push({id:'synthetic-funeral-deposit',title:'ระเบียบว่าด้วยการรับฝากเงินจากสมาคมฌาปนกิจสงเคราะห์ พ.ศ. 2569',affects:['deposits'],type:'REGULATION',status:'PENDING',mayAffectRules:true,originalUrl:'https://drive.google.com/file/d/1p2B8nBrWoLELvfaorf3QX9ku3kzYQTrF/view',officialIndexUrl:'https://www.dlasavingcoop.com/show.php?Category=procedure',linkVerified:true,pendingReason:'NEW_OFFICIAL_DOCUMENT'});association.applySourceMonitor(associationSnapshot);assert.equal(association.answer('เปิดบัญชีเงินฝากออมทรัพย์พิเศษยังไง').decision,'PROCEDURE_INFORMATION');assert.equal(association.freshnessStatus('สมาคมฌาปนกิจฝากเงินได้ไหม').allowed,false);pass+=2;
console.log('SPECIAL DEPOSIT RELEASE:',pass,'PASS / 0 FAIL');
