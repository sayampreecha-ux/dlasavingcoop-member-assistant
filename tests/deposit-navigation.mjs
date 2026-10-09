import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const app=loadMemberEngine();let pass=0;
for(const q of ['เงินฝาก','เปิดบัญชีเงินฝากอย่างไร','ฝากเพิ่มอย่างไร','ถอนเงินฝากอย่างไร']){const menu=app.depositNavigation(q,app.answer(q));assert.deepEqual(Array.from(menu.items,x=>x[0]),['ออมทรัพย์พิเศษ','ประเภทอื่น / ไม่แน่ใจ']);pass++;}
const destinations=[['เปิดบัญชีออมทรัพย์พิเศษ','deposit_open'],['ออมทรัพย์พิเศษฝากเพิ่ม','deposit_special_add'],['ออมทรัพย์พิเศษถอนเงิน','deposit_special_withdraw'],['ออมทรัพย์พิเศษปิดบัญชี','deposit_special_close'],['ออมทรัพย์พิเศษดอกเบี้ย','deposit_special_interest']];
for(const [q,intent]of destinations){const r=app.answer(q);assert.equal(r.intent,intent);assert.deepEqual(Array.from(app.depositNavigation(q,r).items,x=>x[0]),['เปิดบัญชี','ฝากเพิ่ม','ถอน','ปิดบัญชี','ดอกเบี้ย','กลับเมนูเงินฝาก']);pass++;}
for(const q of ['ยอดเงินฝากของผมเท่าไร','ออมทรัพย์พิเศษ OTP 123456','ออมทรัพย์พิเศษค้ำอยู่ถอนได้ไหม','ยอดหุ้นของผมเท่าไร','กู้สามัญ']){assert.equal(app.depositNavigation(q,app.answer(q)),null);pass++;}
const snapshot=app.getSourceRegistry();snapshot.documents.push({id:'navigation-new-member-deposit-rule',title:'ระเบียบเงินฝากสมาชิกฉบับแก้ไข',affects:['deposits'],type:'REGULATION',status:'PENDING',mayAffectRules:true,originalUrl:'https://www.dlasavingcoop.com/show.php?No=807',linkVerified:true});app.applySourceMonitor(snapshot);
for(const [q]of destinations){const r=app.answer(q);assert.equal(r.decision,'EVIDENCE_LOCK');assert.doesNotMatch(r.answer,/500 บาท|1%|3\.25%/);assert.equal(app.depositNavigation(q,r).items.length,6);pass++;}
console.log('DEPOSIT NAVIGATION:',pass,'PASS / 0 FAIL; choices never promote evidence or expose personal data');
