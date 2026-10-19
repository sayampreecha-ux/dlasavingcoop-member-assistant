import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
// Evidence-snapshot regression; does not change the runtime clock or production freshness.
const app=loadMemberEngine();
const cases=[
  {id:'T07',q:'ผมเป็นสมาชิกมา 8 เดือน ส่งหุ้น 8 งวด ต้องการกู้สามัญ 300,000 บาท มีผู้ค้ำประกัน 2 คน ระยะเวลาส่งหุ้นผ่านหรือไม่',expected:'NOT_YET_ELIGIBLE',required:/การส่งหุ้น.*8 งวด.*12 งวด/},
  {id:'T08',q:'ผมเป็นสมาชิกมา 8 เดือน ส่งหุ้น 8 งวด มีหุ้นสะสม 35,000 บาท ต้องการกู้สามัญ 300,000 บาท มีผู้ค้ำประกัน 2 คน ผ่านเกณฑ์หรือไม่',expected:'NOT_YET_ELIGIBLE',required:/การส่งหุ้น.*8 งวด.*12 งวด/},
  {id:'T09',q:'ผมเป็นสมาชิกมาแล้ว 18 เดือน ส่งหุ้นต่อเนื่อง 18 งวด มีหุ้นสะสม 40,000 บาท ต้องการกู้สามัญ 300,000 บาท มีผู้ค้ำประกัน 2 คน ไม่มีหนี้ค้างชำระ กรุณาประเมินระยะเวลาส่งหุ้นและทุนเรือนหุ้นแยกข้อ',expected:null,required:/การส่งหุ้น.*18 งวด.*12 งวด/},
  {id:'boundary-low-share',q:'สมาชิกมา 18 เดือน ส่งหุ้น 18 งวด มีหุ้นสะสม 29,999 บาท ขอกู้สามัญ 300,000 บาท มีผู้ค้ำ 2 คน ผ่านหรือไม่',expected:'NEED_INFO',required:/ทุนเรือนหุ้นสะสมขั้นต่ำ.*29,999.*30,000.*ขาด 1 บาท.*ข้อ 5\(2\)/},
  {id:'boundary-share-equal',q:'สมาชิกมา 18 เดือน ส่งหุ้น 18 งวด มีหุ้นสะสม 30,000 บาท ขอกู้สามัญ 300,000 บาท มีผู้ค้ำ 2 คน ประเมินทุนเรือนหุ้น',expected:null,required:/ทุนเรือนหุ้นสะสมขั้นต่ำ.*30,000.*30,000/}
];
for(const c of cases){
  const r=app.answer(c.q);
  if(c.expected)assert.equal(r.decision,c.expected,c.id+' '+r.answer);
  const details=[r.answer,...(r.details||[])].join(' ');
  assert.match(details,c.required,c.id+' missing verified rule-by-rule evaluation: '+details);
  assert.notEqual(r.decision,'PERSONAL_APPROVED',c.id);
  if(c.id==='boundary-low-share') assert.match(details,/นำเงินกู้มาซื้อหุ้นให้ครบเงื่อนไขได้/,'clause 5(2) top-up path must be explained');
}
console.log('LOAN ELIGIBILITY T07-T09 + SHARE BOUNDARIES PASS');


const ordinary=JSON.parse((await import('node:fs')).readFileSync(new URL('../data/official-rule-master.json',import.meta.url),'utf8')).rules.ordinaryLoanCurrent;
assert.equal(ordinary.membershipMinMonths,6);
assert.equal(ordinary.sharePaymentMinInstallments,6);
assert.equal(ordinary.remainingIncomeMinBaht,6000);
assert.equal(ordinary.remainingIncomeMinPercent,15);
assert.equal(ordinary.repeatOrdinaryMinInstallments,12);
const band=(amount)=>ordinary.amountBands.find(b=>amount>=(b.min??0)&&amount<=(b.max??Infinity));
const guarantors=(amount)=>ordinary.guarantorBands.find(b=>amount>=(b.min??0)&&amount<=(b.max??Infinity));
for(const [amount,months,sharePercent,guarantorCount] of [
 [200000,6,0,1],[200001,12,10,1],[500000,12,10,1],
 [500001,12,10,2],[1000000,12,10,2],[1000001,12,10,3]
]){
 const sb=band(amount),gb=guarantors(amount);
 assert.ok(sb&&gb,'missing authoritative amount band '+amount);
 assert.equal(sb.sharePaymentMinMonths,months,'share months '+amount);
 assert.equal(sb.minSharePercent??0,sharePercent,'share capital '+amount);
 assert.equal(gb.minGuarantors,guarantorCount,'guarantors '+amount);
}
const supplemental=[
 {id:'T01-membership-fail',q:'ผมเป็นสมาชิกมา 5 เดือน ส่งหุ้น 5 งวด ต้องการกู้สามัญ 200,000 บาท ผ่านหรือไม่',required:/สมาชิก.*5 เดือน.*6 เดือน/,decision:'NOT_YET_ELIGIBLE'},
 {id:'T02-membership-pass',q:'ผมเป็นสมาชิกมา 6 เดือน ส่งหุ้น 6 งวด ต้องการกู้สามัญ 200,000 บาท ประเมินคุณสมบัติ',required:/สมาชิก.*6 เดือน.*6 เดือน/},
 {id:'T03-shares-fail',q:'เป็นสมาชิก 18 เดือน ส่งหุ้น 11 งวด มีหุ้นสะสม 35,000 บาท ขอกู้สามัญ 300,000 บาท ผ่านหรือไม่',required:/การส่งหุ้น.*11 งวด.*12 งวด/,decision:'NOT_YET_ELIGIBLE'},
 {id:'T04-shares-pass',q:'เป็นสมาชิก 18 เดือน ส่งหุ้น 12 งวด มีหุ้นสะสม 35,000 บาท ขอกู้สามัญ 300,000 บาท ประเมินคุณสมบัติ',required:/การส่งหุ้น.*12 งวด.*12 งวด/},
 {id:'T05-guarantor-low',q:'เป็นสมาชิก 18 เดือน ส่งหุ้น 18 งวด มีหุ้นสะสม 60,000 บาท ขอกู้สามัญ 500,000 บาท ใช้บุคคลค้ำประกัน มีผู้ค้ำ 1 คน ประเมินจำนวนผู้ค้ำ',required:/ผู้ค้ำ.*1 คน/},
 {id:'T06-guarantor-high',q:'เป็นสมาชิก 18 เดือน ส่งหุ้น 18 งวด มีหุ้นสะสม 60,000 บาท ขอกู้สามัญ 500,001 บาท ใช้บุคคลค้ำประกัน มีผู้ค้ำ 1 คน ประเมินจำนวนผู้ค้ำ',required:/ผู้ค้ำ.*1 คน.*2 คน/,decision:'NOT_YET_ELIGIBLE'}
];
for(const c of supplemental){
 const v=app.answer(c.q),details=[v.answer,...(v.details||[])].join(' ');
 assert.match(details,c.required,c.id+' '+details);
 if(c.decision)assert.equal(v.decision,c.decision,c.id+' '+details);
 assert.notEqual(v.decision,'PERSONAL_APPROVED',c.id);
}
console.log('LOAN ELIGIBILITY T01-T09 + AUTHORITATIVE BOUNDARIES PASS');


// Behavior assertions: decision and per-criterion state, not numeric mentions alone.
const behavior=[
 {id:'membership-years',q:'เป็นสมาชิก 1 ปี ส่งหุ้นต่อเนื่อง 12 งวด หุ้นสะสม 40,000 บาท ขอกู้สามัญ 300,000 บาท ใช้หลักประกันบุคคล มีผู้ค้ำ 1 คน กู้ครั้งแรก',checks:[/อายุสมาชิก:.*\\[PASS\\]/,/การส่งหุ้น:.*\\[PASS\\]/],decision:'NEED_INFO'},
 {id:'membership-unknown',q:'ส่งหุ้นต่อเนื่อง 18 งวด มีหุ้นสะสม 40,000 บาท ขอกู้สามัญ 300,000 บาท ใช้หลักประกันบุคคล มีผู้ค้ำ 1 คน กู้ครั้งแรก',checks:[/อายุสมาชิก.*\\[NEED_FACT\\]/],decision:'NEED_INFO'},
 {id:'share-noncontinuous',q:'เป็นสมาชิก 18 เดือน ส่งหุ้นไม่ต่อเนื่อง 18 งวด หุ้นสะสม 40,000 บาท ขอกู้สามัญ 300,000 บาท กู้ครั้งแรก',checks:[/ความต่อเนื่องการส่งหุ้น.*\\[FAIL\\]/],decision:'NOT_YET_ELIGIBLE'},
 {id:'collateral-nonperson',q:'เป็นสมาชิก 18 เดือน ส่งหุ้นต่อเนื่อง 18 งวด หุ้นสะสม 40,000 บาท ขอกู้สามัญ 300,000 บาท ใช้เงินฝากค้ำประกัน กู้ครั้งแรก',checks:[/หลักประกันอื่น.*\\[NEED_FACT\\]/],decision:'NEED_INFO'},
 {id:'income-ratio-fail',q:'เป็นสมาชิก 18 เดือน ส่งหุ้นต่อเนื่อง 18 งวด หุ้นสะสม 40,000 บาท ขอกู้สามัญ 300,000 บาท เงินได้รายเดือน 100,000 บาท รายได้คงเหลือ 7,000 บาท กู้ครั้งแรก',checks:[/รายได้คงเหลือขั้นต่ำ.*7\\.00%.*\\[FAIL\\]/],decision:'NOT_YET_ELIGIBLE'},
 {id:'income-ratio-unknown',q:'เป็นสมาชิก 18 เดือน ส่งหุ้นต่อเนื่อง 18 งวด หุ้นสะสม 40,000 บาท ขอกู้สามัญ 300,000 บาท รายได้คงเหลือ 7,000 บาท กู้ครั้งแรก',checks:[/รายได้คงเหลือขั้นต่ำ.*\\[NEED_FACT\\]/],decision:'NEED_INFO'}
];
for(const c of behavior){
 const r=app.answer(c.q),all=[r.answer,...(r.details||[])].join(' ');
 assert.equal(r.decision,c.decision,c.id+' '+all);
 for(const expression of c.checks)assert.match(all,expression,c.id+' '+all);
 assert.notEqual(r.decision,'PERSONAL_APPROVED',c.id);
}
console.log('ORDINARY LOAN INDEPENDENT STATUS + DECISION CASES PASS');
