import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const app=loadMemberEngine();
const reg='https://drive.google.com/file/d/1035C9tf9AU--HHJFq581v9uCwsF6ANL_/view';
const form='https://drive.google.com/file/d/177gzqKCqFxgaQM69cUfvcI40Xf9t7ESf/view';
const purchase='https://drive.google.com/file/d/1PHYOgJQqlL-dQfD13sgEzoxo0Oi2gp3V/view';
const bylaws='https://drive.google.com/file/d/1UVoCHBoB4ybnJjHzgCc7aTy6aiAzRfki/view';
let count=0;
for(const q of ['เพิ่มหุ้นรายเดือนได้ไหม','เพิ่มค่าหุ้นรายเดือน','ซื้อหุ้นเพิ่มรายเดือน','ซื้อหุ้นเพิ่มทุกเดือน','ซื้อหุ้นเพิ่มเดือนละ 1000 บาท','เพิ่มหุ้นรายเดือน 5,000 หุ้น','เพิ่มหุ้นรายเดือน 5,001 หุ้น']){
 const r=app.answer(q);assert.equal(r.intent,'share_change_rate',q);
 assert.match(r.answer,/อัตราใหม่ต้องไม่เกิน 5,000 หุ้นต่อเดือน/,q);
 assert.match(r.answer,/ไม่ใช่การเพิ่มอีก 5,000 หุ้น/,q);
 assert.match(r.answer,/1 ตุลาคม 2569/);assert.match(r.answer,/ยังไม่ยืนยันว่ามอบอำนาจแล้ว/);
 assert.ok(r.sources.some(x=>x.url===reg&&/หน้า 1/.test(x.note)));
 assert.ok(r.actions.some(x=>x[1]===form));assert.ok(r.details.some(x=>/ลงลายมือชื่อ/.test(x)));
 count++;
}
for(const q of ['ลดหุ้นรายเดือนได้ไหม','ลดค่าหุ้นรายเดือน','ลดหุ้นหลัง 5 เดือน','ลดหุ้นครบ 6 เดือน','ลดหุ้นต่ำกว่าอัตราประกาศ']){
 const r=app.answer(q);assert.equal(r.intent,'share_change_rate',q);
 assert.match(r.answer,/ไม่น้อยกว่า 6 เดือนนับแต่วันที่เปลี่ยนอัตรา/);assert.match(r.answer,/ไม่ต่ำกว่าอัตราที่ประกาศ/);
 assert.match(r.answer,/ความเห็นชอบของคณะกรรมการ/);assert.ok(!/มีหนี้.*ลดไม่ได้/.test(r.answer));count++;
}
for(const q of ['เปลี่ยนอัตราหุ้นรายเดือน','เปลี่ยนการส่งค่าหุ้น']){
 const r=app.answer(q);assert.equal(r.intent,'share_change_rate',q);assert.match(r.answer,/5,000 หุ้นต่อเดือน/);assert.match(r.answer,/6 เดือน/);
 assert.ok(r.evidenceLocks.includes('actual_effective_month'));assert.ok(r.details.some(x=>/เอกสารแนบเพิ่มเติม/.test(x)));count++;
}
for(const q of ['ซื้อหุ้นเพิ่มเติม','ซื้อหุ้นเพิ่ม','ซื้อหุ้นพิเศษ','ซื้อหุ้นเป็นครั้งคราว']){
 const r=app.answer(q);assert.equal(r.intent,'share_purchase',q);assert.equal(r.decision,'EVIDENCE_LOCK');
 assert.ok(r.sources.some(x=>x.url===purchase));assert.ok(r.actions.some(x=>x[1]===purchase));
 assert.match(r.answer,/ยังยืนยันไม่ได้/);assert.match(r.answer,/อย่าโอนเงิน/);assert.doesNotMatch(r.answer,/^การซื้อหุ้นเพิ่มเติมเป็นครั้งคราวปิดรับแล้ว/);assert.equal(r.availability.state,'EVIDENCE_PENDING');assert.ok(r.evidenceLocks.includes('current_official_closure_notice'));assert.equal(r.availability.provenance,'USER_REPORTED');assert.equal(r.availability.officiallyVerified,false);assert.ok(!/ต้องการตรวจประกาศ.*รอบใด/.test(r.answer));assert.ok(r.details.some(x=>/31 กรกฎาคม 2569/.test(x)));assert.ok(r.evidenceLocks.includes('current_purchase_window'));
 assert.ok(!r.sources.some(x=>x.url===form),'monthly form must not prove a one-off purchase');count++;
}
for(const q of ['คืนทุนเรือนหุ้น','ถอนทุนเรือนหุ้น','คืนหุ้นได้กรณีใด','มีหนี้ถอนหุ้นได้ไหม']){
 const r=app.answer(q);assert.equal(r.intent,'share_refund',q);assert.equal(r.decision,'EVIDENCE_LOCK');
 assert.ok(r.sources.some(x=>x.url===bylaws));assert.ok(!r.sources.some(x=>x.url===form));
 assert.ok(r.details.some(x=>/ข้อ 47/.test(x)));assert.ok(r.evidenceLocks.includes('complete_current_bylaws'));count++;
}
assert.equal(app.answer('ยอดหุ้นของผมเท่าไร').intent,'member_self_service');count++;
console.log('SHARE FIVE EVIDENCE GATE:',count,'cases PASS; current purchase and refund rights remain explicitly locked');
