import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
export const depositCases=[
 ['เปิดบัญชีเงินฝากออมทรัพย์พิเศษยังไง',/500 บาท/,/0000011/,/ครั้งแรก/],
 ['ฝากพิเศษเริ่มต้นกี่บาท',/500 บาท/],
 ['ฝากพิเศษฝากเพิ่มขั้นต่ำกี่บาท',/ครั้งละ 500 บาท/,/ข้อ 13/],
 ['ฝากพิเศษฝากเพิ่มยังไง',/7196/,/ไม่ใช้แทนบัญชีเดิม/],
 ['ฝากพิเศษดอกเบี้ยปัจจุบันเท่าไร',/3.25%/,/ยังไม่ได้ยืนยัน/,/ทุกสิ้นเดือน/],
 ['ฝากพิเศษถอนเงินได้ไหม',/คำขอถอน/,/เดือนละ 1 ครั้ง/,/1%/,/100 บาท/],
 ['ฝากพิเศษถอนครั้งที่สองเสียค่าธรรมเนียมไหม',/1%/,/100 บาท/],
 ['ปิดบัญชีฝากพิเศษต้องใช้อะไร',/เล่มสีเขียว/,/ไปรษณีย์/,/วันก่อน/],
 ['ฝากพิเศษถอนแล้วต้องเหลือยอดขั้นต่ำเท่าไร',/500 บาท/,/เว้นแต่.*ปิดบัญชี/],
 ['ฝากพิเศษยอดของผมเหลือเท่าไร',/ยืนยันตัวตน/,/ไม่ส่ง/],
 ['ฝากพิเศษส่ง OTP ให้ดูยอดได้ไหม',/ไม่ส่ง/,/OTP/],
 ['ออมทรัพย์พิเศษค้ำอยู่ เปลี่ยนหลักประกันแล้วถอนได้เลยไหม',/ยังไม่ยืนยัน/,/หลักประกัน/]
];
const app=loadMemberEngine();
for(const [q,...patterns]of depositCases){const r=app.answer(q);for(const p of patterns)assert.match(r.answer,p,q);assert.ok(r.sources.length);}
for(const q of ['ฝากพิเศษยอดของผมเหลือเท่าไร','ฝากพิเศษส่ง OTP ให้ดูยอดได้ไหม']){const r=app.answer(q);assert.equal(r.privacy,true);assert.ok(r.actions.some(x=>x[1]==='https://member.dlasavingcoop.com/coop/'));}
for(const q of ['ฝากพิเศษฝากเพิ่มขั้นต่ำกี่บาท','ฝากพิเศษถอนแล้วต้องเหลือยอดขั้นต่ำเท่าไร'])assert.ok(app.answer(q).sources.some(x=>x.url.includes('1tclgFXrZjamcjLeOk2Wu4TeTRksUZwFL')));
assert.equal(app.answer(depositCases.at(-1)[0]).intent,'deposit_collateral_release');
assert.equal(app.answer(depositCases[4][0]).decision,'EVIDENCE_LOCK');
assert.match(app.answer(depositCases[0][0]).intent,/deposit_open/);
console.log('SPECIAL DEPOSIT AUTHORITY: 12 questions + 7 authority/privacy/routing assertions PASS');

// Reproduce the live monitor's association-deposit discovery. It does not govern a member savings account.
const monitored=loadMemberEngine(),snapshot=monitored.getSourceRegistry();
snapshot.documents.push({id:'association-deposit-scope-fixture',title:'ระเบียบว่าด้วยการรับฝากเงินจากสมาคมฌาปนกิจสงเคราะห์ พ.ศ. 2569',type:'REGULATION',originalUrl:'https://drive.google.com/file/d/1p2B8nBrWoLELvfaorf3QX9ku3kzYQTrF/view',officialIndexUrl:'https://www.dlasavingcoop.com/show.php?Category=procedure',linkVerified:true,status:'PENDING',mayAffectRules:true,affects:['deposits','welfare'],pendingReason:'NEW_OFFICIAL_DOCUMENT'});
monitored.applySourceMonitor(snapshot);
for(const [q,...patterns]of depositCases){const r=monitored.answer(q);for(const p of patterns)assert.match(r.answer,p,'live monitor scope: '+q);}
assert.equal(monitored.freshnessStatus('เงินฝากจากสมาคมฌาปนกิจ').allowed,false);
console.log('SPECIAL DEPOSIT MONITOR SCOPE: member savings remains usable; association deposit remains locked PASS');
