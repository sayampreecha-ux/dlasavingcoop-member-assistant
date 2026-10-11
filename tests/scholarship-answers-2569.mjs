import assert from 'node:assert/strict';import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const app=loadMemberEngine();
const checks=[
 ['ทุนการศึกษาบุตร',[/4,000 บาท/,/3,000 บาท/,/2,500 บาท/,/1,500 บาท/,/6 เดือน/,/ไม่รวมบุตรบุญธรรม/,/2567 หรือ 2568/,/31 สิงหาคม 2569/,/สิ้นสุดกำหนด/,/ทะเบียนบ้าน/]],
 ['ทุนบุตรใครขอได้',[/สมาชิกสามัญ/,/ไม่ค้าง/,/ภาคเรียนที่ 1/,/กรรมการดำเนินการ/]],
 ['ทุนบุตรใช้เอกสารอะไร',[/สูติบัตร/,/หนังสือรับรองสถานศึกษา/,/รับรองสำเนา/,/คำรับรองของผู้บังคับบัญชา/]],
 ['ทุนบุตรสมัครอย่างไร',[/111\/1/,/12120/,/ประทับตราส่ง/,/สิ้นสุดกำหนด/]],
 ['ทุนบุตรคู่สมรสขอทั้งสองคนได้ไหม',[/บุตรคนเดียวกัน/,/1 ประเภทและ 1 ทุน/]],
 ['ทุนบุตรประกาศผลเมื่อไร',[/90 วัน/,/นับถัดจากวันสิ้นสุด/,/ไม่ยืนยันผลเฉพาะราย/]],
 ['ทุนบุตรเคยได้ทุนปี 2568 ขอได้ไหม',[/ไม่ได้รับทุนนี้ในปี 2567 หรือ 2568/,/ไม่ใช่การรับรองสิทธิ/]],
];let count=0;
for(const [q,res]of checks){const r=app.answer(q);assert.equal(r.intent,/ประกาศผล/.test(q)?'live_schedule':'scholarship',q);for(const re of res){assert.match(r.answer,re,q);count++;}assert.ok(r.sources.some(x=>x.url.includes('1_7VIQigZV7SFCH7QOdZGkvTfs-8SHsjt')));}
assert.equal(app.answer('ทุนบุตรปี 2570').decision,'EVIDENCE_LOCK');count++;
let t=app.conversationTurn('ทุนการศึกษาบุตร');t=app.conversationTurn('ใช้เอกสารอะไร',t.state);assert.match(t.result.answer,/สูติบัตร/);count++;
t=app.conversationTurn('กู้เพื่อการศึกษา',t.state);assert.equal(t.result.domain,'education');assert.match(t.result.answer,/200,000 บาท/);count++;
console.log('SCHOLARSHIP PRIMARY ANSWERS:',count,'checks PASS');
