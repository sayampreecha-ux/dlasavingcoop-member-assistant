import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
export const groups=[
 ['advance',/สำรอง.*สงเคราะห์|สำรองไว้จ่าย/,['เงินสงเคราะห์ล่วงหน้าคืออะไร','ฌาปนกิจเงินสำรองคืออะไร','ฌาปนกิจล่วงหน้ากี่บาท','ฌาปณกิจล่วงหน้าเท่าไร','ฌาปนกิจเก็บศพละเท่าไร','ฌาปนกิจสงเคราะห์ล่วงหน้าใช้ทำอะไร']],
 ['annual',/50 บาท.*2568.*450 บาท.*2569.*ไม่ได้/,['ค่าบำรุงรายปีฌาปนกิจเท่าไร','ฌาปนกิจปีหนึ่งเสียล่วงหน้ากี่บาท','ฌาปนกิจปีนึงจ่ายกี่บาท','ฌาปนกิจทุกปีเท่าไร','ชาปนกิจประจำปี 2569 จ่ายเท่าไหร่','ฌาปนกิจปีละ450ใช่ไหม']],
 ['entry',/ค่าสมัคร 100 บาท.*ปีละ 50 บาท.*500 บาท.*ไม่ใช่การยืนยัน/,['ฌาปนกิจแรกเข้าเท่าไร','ค่าสมัครฌาปนกิจเท่าไร','ฌาปนกิจค่าเข้าเท่าไร','ฌาปนกิจสมัครกี่บาท','ชาปนกิจค่าสมัครกี่บาท','ฌาปนกิจค่าสมัครรวมล่วงหน้าไหม']],
 ['claim',/จำนวนสมาชิก.*ไม่ใช่วงเงินตายตัว.*ยังไม่ยืนยันยอดรับสุทธิ/,['ฌาปนกิจเสียชีวิตจ่ายเท่าไร','ฌาปนกิจถึงแก่กรรมได้รับกี่บาท','ฌาปนกิจตายแล้วจ่ายเท่าไร','เงินค่าจัดการศพขออย่างไร','เงินสงเคราะห์ครอบครัวได้เท่าไร','สมาชิกฌาปนกิจเสียชีวิต ขอรับเงิน']],
 ['beneficiary',/ไม่ถือว่าผู้รับโอนประโยชน์ของสหกรณ์.*โดยอัตโนมัติ/,['ฌาปนกิจผู้รับประโยชน์คือใคร','ฌาปนกิจผู้รับผลประโยชน์ต้องทำอย่างไร','ฌาปนกิจเปลี่ยนผู้รับประโยชน์อย่างไร','ฌาปนกิจผู้รับโอนประโยชน์ใช้คนเดียวกันไหม','ฌาปนกิจใครรับเงิน','ฌาปนกิจเปลี่ยนคนรับอย่างไร']],
 ['debt',/แยกหนี้สมาคม.*หนี้เงินกู้สหกรณ์.*ยังสรุปไม่ได้.*หนังสือยินยอม/,['ฌาปนกิจหักหนี้สหกรณ์ไหม','ฌาปนกิจมีหนี้ทำอย่างไร','ฌาปนกิจเสียชีวิตแล้วหักหนี้ทั้งหมดไหม','เงินสงเคราะห์ครอบครัวชำระหนี้ก่อนหรือไม่','ฌาปนกิจหนี้สมาคมกับหนี้สหกรณ์ต่างกันไหม','ฌาปนกิจผู้รับประโยชน์มีหนี้ต้องหักไหม']],
 ['refund',/คนละรายการ.*ไม่ใช่คืนเงินทุกประเภท.*ยอดคงเหลือจริง/,['ฌาปนกิจลาออกคืนเงินไหม','ฌาปนกิจขอคืนเงินล่วงหน้า','ฌาปนกิจเงินเหลือได้คืนไหม','เงินสงเคราะห์ล่วงหน้าคืนเต็มจำนวนไหม','ฌาปนกิจยอดคงเหลือขอคืนอย่างไร','ฌาปนกิจคืนเงินค่าสมัครด้วยไหม']],
 ['payment',/ใบแจ้งยอดปี.*ชื่อบัญชี.*ไม่ถือว่า.*ชำระสำเร็จแล้ว/,['ชำระเงินฌาปนกิจ','ฌาปนกิจจ่ายเงินอย่างไร','ฌาปนกิจโอนเงินไปไหน','ฌาปนกิจเลขบัญชีอะไร','ฌาปนกิจเรียกเก็บตรวจที่ไหน','ฌาปนกิจโอนเงินแล้วสำเร็จไหม']],
 ['apply',/สมัครฌาปนกิจ/,['สมัครฌาปนกิจ','ฌาปนกิจสมัครอย่างไร','ชาปนกิจสมัครอย่างไร','ฌาปณกิจสมัครอย่างไร','ใบสมัครฌาปนกิจอยู่ไหน','ฌาปนกิจเข้าเป็นสมาชิกอย่างไร']],
 ['approval',/ตรวจผลอนุมัติ.*เลขสมาชิก/,['ตรวจผลอนุมัติฌาปนกิจ','ฌาปนกิจตรวจผล','ฌาปนกิจเลขสมาชิกดูที่ไหน','ฌาปนกิจอนุมัติสมาชิกหรือยัง','ฌาปนกิจผลสมัครอยู่ไหน','ฌาปนกิจตรวจสมาชิกอย่างไร']]
];
export function verify(r,facet,pattern){
 assert.equal(r.intent,'funeral'); assert.match(r.answer,pattern);
 assert.ok(r.sources.length>0);assert.ok(r.actions.length>0);
 if(!['apply','approval'].includes(facet)){
  assert.equal(r.concern,'funeral_'+facet);assert.equal(r.decision,'EVIDENCE_LOCK');
  assert.equal(r.evidenceState,'PRIMARY_2567_READ_CURRENT_AMENDMENT_UNVERIFIED');
  assert.match(r.details.join(' '),/วันจดทะเบียน.*ไม่.*กำหนดวันมีผลขึ้นเอง/);
  assert.doesNotMatch(r.answer,/ต้องการสมัคร ชำระเงิน หรือสอบถามสิทธิ/);
  assert.ok(r.sources.some(x=>x.url.includes('11EjAArj')));
 }
}
if(process.argv[1]?.endsWith('funeral-facets-semantic-20261024.mjs')){
 const app=loadMemberEngine(),rows=[];
 for(const [facet,pattern,questions]of groups)for(const q of questions){const r=app.answer(q);if(q==='ฌาปนกิจเลขสมาชิกดูที่ไหน'){assert.equal(r.intent,'member_identifier_lookup');assert.equal(r.decision,'VERIFY_MEMBER_IDENTITY');assert.ok(r.privacy);assert.match(r.answer,/เลขสมาชิกสมาคมฌาปนกิจ.*ติดต่อสมาคม/);}else verify(r,facet,pattern);rows.push({question:q,facet,intent:r.intent,decision:r.decision,answer:r.answer,sources:r.sources,status:'PASS'});}
 assert.equal(rows.length,60);
 // Explicit follow-up buttons remain usable without modifying PR #166 context handling.
 const first=app.conversationTurn('ฌาปนกิจค่าบำรุงรายปีเท่าไร');
 for(const q of first.result.followups){const r=app.conversationTurn(q,first.state,{continuation:true}).result;assert.equal(r.intent,'funeral');assert.equal(r.decision,'EVIDENCE_LOCK');assert.ok(r.concern);}
 // Existing routes must keep their own authority, including association deposits and loan requirements.
 for(const q of ['กู้หุ้นค้ำต้องสมัครฌาปนกิจไหม','สมัครฌาปนกิจให้คู่สมรสได้หรือไม่','ค่ารายปีคู่สมรสหักจากปันผลหรือไม่','ฌาปนกิจเช็คครบกำหนดวันไหน','เงินฝากสมาคมฌาปนกิจใช้หลักเกณฑ์อะไร'])assert.notEqual(app.answer(q).evidenceState,'PRIMARY_2567_READ_CURRENT_AMENDMENT_UNVERIFIED',q);
 for(const q of ['ฌาปนกิจยอดคงเหลือของผมเท่าไร เลขสมาชิก 123456','ฌาปนกิจโอนเงิน OTP 123456']){const r=app.answer(q);assert.ok(r.privacy);assert.doesNotMatch(r.answer,/123456/);}
 // Current collection report is found; a draft amendment is not an enacted rule.
 for(const q of ['ฌาปนกิจปี 2569 จ่ายเท่าไร','ฌาปนกิจปีละ440ใช่ไหม','ฌาปนกิจปีละ200ใช่ไหม']){
  const r=app.answer(q);assert.equal(r.concern,'funeral_annual');assert.equal(r.decision,'EVIDENCE_LOCK');
  assert.match(r.answer,/2569 รอบสิงหาคม.*440 บาทและ 200 บาท.*ห้ามเหมารวม/);
  assert.match(r.answer,/ขีด.*ไม่ใช่หลักฐานว่ายกเลิกค่าบำรุง/);
  assert.ok(r.sources.some(x=>x.url.includes('1BG3EIKS')));assert.ok(r.sources.some(x=>x.url.includes('No=4904')));
 }
 for(const q of ['ฌาปนกิจแรกเข้าเท่าไร','เงินสงเคราะห์ล่วงหน้าคืออะไร','ชำระเงินฌาปนกิจ','ฌาปนกิจลาออกคืนเงินไหม']){
  const r=app.answer(q);assert.equal(r.decision,'EVIDENCE_LOCK');
  assert.match(r.details.join(' '),/ร่างแก้ไข.*500 เป็น 1,000 บาท.*ช่องมติ วันที่ และลายมือชื่อในร่างยังว่าง.*ไม่ใช้ร่างนี้รับรอง/);
  assert.ok(r.sources.some(x=>x.url.includes('1LVWkPbe')));
 }
 // Published beneficiary form establishes a conditional debt order, not universal signed consent.
 for(const q of ['ฌาปนกิจหักหนี้สหกรณ์ไหม','ฌาปนกิจผู้รับผลประโยชน์ต้องทำอย่างไร','ฌาปนกิจเสียชีวิตแล้วหักหนี้ทั้งหมดไหม']){
  const r=app.answer(q);assert.equal(r.decision,'EVIDENCE_LOCK');
  assert.match(r.answer,/แบบ.*ข้อบังคับ พ.ศ. 2565/);
  assert.match(r.answer,/ลำดับที่ 1.*ก่อน.*(?:เหลือ|ลำดับที่ 2)/);
  assert.match(r.answer,/หนังสือที่.*ลงนามฉบับล่าสุด/);
  assert.ok(r.sources.some(x=>x.url.includes('1sxikYqV3')));
  assert.ok(r.actions.some(x=>x[1].includes('1sxikYqV3')));
 }
 assert.match(app.answer('ฌาปนกิจหักหนี้สหกรณ์ไหม').answer,/ไม่ถือว่าสมาชิกทุกคนลงนามแบบนี้แล้ว/);
 // Registration is confirmed by the user; document-text uncertainty must not become a non-registration claim.
 for(const [, ,qs] of groups.slice(0,8))for(const q of qs){const r=app.answer(q);assert.doesNotMatch(JSON.stringify(r),/ยังไม่ยืนยันการจดทะเบียน|ยังไม่พบหลักฐานวันจดทะเบียน|ต้องตรวจฉบับลงนามและหลักฐานนายทะเบียนรับจดทะเบียนก่อน/);assert.ok(r.actions.some(a=>a[1].includes('No=4904')));}
 assert.match(app.answer('เงินสงเคราะห์ล่วงหน้าคืออะไร').details.join(' '),/ไม่ใช่ข้อสรุปว่ายังไม่ได้จดทะเบียน/);
 for(const q of ['เงินสงเคราะห์ล่วงหน้าคืออะไร','ฌาปนกิจผู้รับประโยชน์คือใคร'])assert.match(app.answer(q).details.join(' '),/วันถัดจากวันที่นายทะเบียนรับจดทะเบียน/);
 if(process.env.FUNERAL_QA_OUTPUT)fs.writeFileSync(process.env.FUNERAL_QA_OUTPUT,JSON.stringify({semantic:60,rows},null,2));
 console.log('FUNERAL SEMANTIC: 60/60; five explicit follow-up buttons; scope/privacy guards PASS');
}
