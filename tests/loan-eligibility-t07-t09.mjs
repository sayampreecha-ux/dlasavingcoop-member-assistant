import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
// Evidence-snapshot regression; does not change the runtime clock or production freshness.
const app=loadMemberEngine();
const cases=[
  {id:'T07',q:'ผมเป็นสมาชิกมา 8 เดือน ส่งหุ้น 8 งวด ต้องการกู้สามัญ 300,000 บาท มีผู้ค้ำประกัน 2 คน ระยะเวลาส่งหุ้นผ่านหรือไม่',expected:'NOT_YET_ELIGIBLE',required:/การส่งหุ้น.*8 งวด.*12 งวด/},
  {id:'T08',q:'ผมเป็นสมาชิกมา 8 เดือน ส่งหุ้น 8 งวด มีหุ้นสะสม 35,000 บาท ต้องการกู้สามัญ 300,000 บาท มีผู้ค้ำประกัน 2 คน ผ่านเกณฑ์หรือไม่',expected:'NOT_YET_ELIGIBLE',required:/การส่งหุ้น.*8 งวด.*12 งวด/},
  {id:'T09',q:'ผมเป็นสมาชิกมาแล้ว 18 เดือน ส่งหุ้นต่อเนื่อง 18 งวด มีหุ้นสะสม 40,000 บาท ต้องการกู้สามัญ 300,000 บาท มีผู้ค้ำประกัน 2 คน ไม่มีหนี้ค้างชำระ กรุณาประเมินระยะเวลาส่งหุ้นและทุนเรือนหุ้นแยกข้อ',expected:null,required:/การส่งหุ้น.*18 งวด.*12 งวด/},
  {id:'boundary-low-share',q:'สมาชิกมา 18 เดือน ส่งหุ้น 18 งวด มีหุ้นสะสม 29,999 บาท ขอกู้สามัญ 300,000 บาท มีผู้ค้ำ 2 คน ผ่านหรือไม่',expected:'NOT_YET_ELIGIBLE',required:/ทุนเรือนหุ้นสะสมขั้นต่ำ.*29,999.*30,000/},
  {id:'boundary-share-equal',q:'สมาชิกมา 18 เดือน ส่งหุ้น 18 งวด มีหุ้นสะสม 30,000 บาท ขอกู้สามัญ 300,000 บาท มีผู้ค้ำ 2 คน ประเมินทุนเรือนหุ้น',expected:null,required:/ทุนเรือนหุ้นสะสมขั้นต่ำ.*30,000.*30,000/}
];
for(const c of cases){
  const r=app.answer(c.q);
  if(c.expected)assert.equal(r.decision,c.expected,c.id+' '+r.answer);
  const details=[r.answer,...(r.details||[])].join(' ');
  assert.match(details,c.required,c.id+' missing verified rule-by-rule evaluation: '+details);
  assert.notEqual(r.decision,'PERSONAL_APPROVED',c.id);
}
console.log('LOAN ELIGIBILITY T07-T09 + SHARE BOUNDARIES PASS');
