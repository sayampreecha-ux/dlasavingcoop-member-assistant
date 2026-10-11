import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const app=loadMemberEngine();
const queries=['หุ้นและทุนเรือนหุ้น','เพิ่มหุ้นรายเดือนได้ไหม','ลดหุ้นรายเดือนได้ไหม','ซื้อหุ้นเพิ่มเติม','คืนหุ้นได้กรณีใด','วิธีตรวจสอบยอดหุ้นของฉัน','ระเบียบหุ้นและฉบับแก้ไข','ข้อบังคับสหกรณ์','ประกาศเกี่ยวกับหุ้น'];
for(const q of queries){const r=app.answer(q);assert.ok(r.followups?.includes('เพิ่มหุ้นรายเดือนได้ไหม'),q);assert.ok(r.followups?.includes('วิธีตรวจสอบยอดหุ้นของฉัน'),q);}
assert.match(app.answer(queries[1]).answer,/5,000 หุ้น/);
assert.match(app.answer(queries[2]).answer,/6 เดือน/);
assert.equal(app.answer(queries[3]).intent,'share_purchase');
assert.equal(app.answer(queries[5]).privacy,true);
const bylaws=app.answer('ข้อบังคับสหกรณ์');assert.ok(bylaws.actions.some(x=>/ฉบับที่ 17/.test(x[0])));assert.ok(!bylaws.actions.some(x=>x[1].includes('1035C9')));
const notices=app.answer('ประกาศเกี่ยวกับหุ้น');assert.ok(!notices.actions.some(x=>/Category=notice/.test(x[1])));assert.match(notices.answer,/ยังไม่มี.*ตรวจยืนยัน/);
console.log('SHARE NAVIGATION: 15 checks PASS');
