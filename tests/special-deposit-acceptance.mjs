import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
export const depositCases=[
 ['เปิดบัญชีเงินฝากออมทรัพย์พิเศษยังไง','deposit_open',/500 บาท/],
 ['เปิดบัญชีฝากพิเศษขั้นต่ำกี่บาท','deposit_open',/500 บาท/],
 ['ฝากพิเศษฝากเพิ่มขั้นต่ำเท่าไหร่','deposit_special_add',/ฝากเพิ่มแต่ละครั้งไม่น้อยกว่า 500 บาท/],
 ['วิธีฝากเงินออมทรัพย์พิเศษผ่านกรุงไทย','deposit_special_add',/7196/],
 ['ถอนเงินฝากพิเศษได้เดือนละกี่ครั้ง','deposit_special_withdraw',/ครั้งที่ 2/,/1%/,/100 บาท/],
 ['ฝากพิเศษถอนครั้งที่สองเสียเท่าไหร่','deposit_special_withdraw',/1%/,/100 บาท/],
 ['เงินฝากออมทรัพย์พิเศษปิดบัญชียังไง','deposit_special_close',/ไปรษณีย์/,/สมุดบัญชีเล่มสีเขียว/],
 ['ฝากพิเศษปิดบัญชีดอกเบี้ยคิดถึงวันไหน','deposit_special_close',/วันก่อนวันทำรายการ/],
 ['ฝากพิเศษดอกเบี้ยปัจจุบันเท่าไร','deposit_special_interest',/3.25%/,/ยังไม่ได้ยืนยัน/,/ทบต้นทุกสิ้นเดือน/],
 ['ออมทรัพย์พิเศษค้ำอยู่ เปลี่ยนหลักประกันแล้วถอนได้เลยไหม','deposit_collateral_release',/ปลด/,/เจ้าหน้าที่/],
 ['ฝากพิเศษยอดของผมเหลือเท่าไร','member_self_service',/ยืนยันตัวตน/],
 ['ฝากพิเศษ OTP 123456 ช่วยตรวจยอด','member_self_service',/ไม่ต้องส่ง/],
 ['ฝากพิเศษเงินโอนแล้วขึ้นสถานะเมื่อไหร่','member_self_service',/ระบบสมาชิก/],
 ['ฝากพิเศษเสาร์อาทิตย์ได้ไหม','deposit_special_schedule',/ยังไม่ได้ยืนยัน/],
 ['ฝากพิเศษใช้กู้สามัญได้แน่นอนไหม','deposit_loan_review',/ไม่สรุป/]
];
const app=loadMemberEngine(),text=r=>[r.answer,...r.details||[]].join(' ');let pass=0;
for(const [q,intent,...patterns] of depositCases){const r=app.answer(q);assert.equal(r.intent,intent,q);for(const p of patterns)assert.match(text(r),p,q);assert.ok(r.sources.length);pass++;}
for(const q of ['ฝากพิเศษยอดของผมเหลือเท่าไร','ฝากพิเศษ OTP 123456 ช่วยตรวจยอด']){const r=app.answer(q);assert.equal(r.privacy,true);assert.ok(r.actions.some(a=>a[1]==='https://member.dlasavingcoop.com/coop/'));assert.doesNotMatch(text(r),/123456/);pass++;}
const opening=app.answer('เปิดบัญชีฝากพิเศษ');assert.ok(opening.sources.some(s=>s.url.includes('No=3993')));assert.ok(opening.sources.every(s=>!s.url.includes('No=2959')));pass++;
const rate=app.answer('ฝากพิเศษดอกเบี้ยเท่าไร');assert.equal(rate.decision,'EVIDENCE_LOCK');pass++;
let turn=app.conversationTurn('ฝากพิเศษ');for(const [q,p]of [['ฝากเพิ่มขั้นต่ำเท่าไร',/ฝากเพิ่มแต่ละครั้งไม่น้อยกว่า 500 บาท/],['ถอนครั้งที่สองเสียเท่าไร',/1%/],['ปิดบัญชีใช้เอกสารอะไร',/ไปรษณีย์/]]){turn=app.conversationTurn(q,turn.state,{continuation:true});assert.match(text(turn.result),p);pass++;}
turn=app.conversationTurn('ยอดหุ้นของผมเท่าไร',turn.state,{continuation:true});assert.equal(turn.result.intent,'member_self_service');pass++;
const pending=loadMemberEngine(),snapshot=pending.getSourceRegistry();snapshot.documents.push({id:'synthetic-new-deposit-rule',title:'ระเบียบเงินฝากสมาชิกฉบับแก้ไข',affects:['deposits'],type:'REGULATION',status:'PENDING',mayAffectRules:true,originalUrl:'https://www.dlasavingcoop.com/show.php?No=807',linkVerified:true});pending.applySourceMonitor(snapshot);for(const q of ['เปิดบัญชีฝากพิเศษขั้นต่ำกี่บาท','ฝากพิเศษฝากเพิ่ม','ฝากพิเศษถอนเงิน']){const r=pending.answer(q);assert.equal(r.decision,'EVIDENCE_LOCK');assert.doesNotMatch(r.answer,/500 บาท|1%/);pass++;}
const association=loadMemberEngine(),other=association.getSourceRegistry();other.documents.push({id:'synthetic-association-deposit',title:'ระเบียบว่าด้วยการรับฝากเงินจากสมาคมฌาปนกิจสงเคราะห์',affects:['deposits'],type:'REGULATION',status:'PENDING',mayAffectRules:true,originalUrl:'https://www.dlasavingcoop.com/show.php?Category=procedure',linkVerified:true});association.applySourceMonitor(other);assert.equal(association.answer('เปิดบัญชีเงินฝากออมทรัพย์พิเศษขั้นต่ำกี่บาท').intent,'deposit_open');assert.equal(association.answer('เงินฝากสมาคมฌาปนกิจใช้หลักเกณฑ์อะไร').decision,'EVIDENCE_LOCK');pass+=2;
console.log('SPECIAL DEPOSIT ACCEPTANCE:',pass,'PASS / 0 FAIL; numeric rules, routing, privacy, conversation and new-evidence locks');
