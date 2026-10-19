import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';

// 100 actual engine executions; no mocked replies or bypass of evidence/decision gates.
const app=loadMemberEngine();
const observations=[];
const base=[
  ['01','ผมเป็นสมาชิก 8 เดือน ส่งหุ้นต่อเนื่อง 8 เดือน ขอเงินกู้สามัญ 200,000 บาทได้ไหม'],
  ['02','ผมส่งหุ้นต่อเนื่อง 11 เดือน มีหุ้นสะสม 50,000 บาท ขอสามัญ 300,000 บาทได้ไหม'],
  ['03','ส่งหุ้นต่อเนื่อง 12 เดือน มีหุ้นสะสม 29,999 บาท ขอสามัญ 300,000 บาท ต้องทำอย่างไร'],
  ['04','ส่งหุ้นต่อเนื่อง 12 เดือน มีหุ้นสะสม 30,000 บาท ขอสามัญ 300,000 บาท หุ้นพอไหม'],
  ['05','ส่งหุ้นต่อเนื่อง 12 เดือน หุ้นสะสม 40,000 บาท ขอสามัญ 500,001 บาท ได้ไหม']
];
const variants=[
  [200000,8,50000],[200001,11,50000],[300000,12,29999],[300000,12,30000],
  [500001,12,40000],[500000,12,50000],[1000000,12,90000],[1000001,12,100001],
  [300000,6,40000],[300000,18,40000],[300000,24,40000],[300000,12,29998],
  [200000,5,10000],[300000,13,35000],[500001,18,60000],[200001,12,20001],
  [500000,11,50000],[1000000,24,100000],[1000001,18,120000]
];
const groups=[
  (amount,months,shares)=>`เป็นสมาชิก 18 เดือน ส่งหุ้นต่อเนื่อง ${months} เดือน มีหุ้นสะสม ${shares.toLocaleString('en-US')} บาท ขอกู้สามัญ ${amount.toLocaleString('en-US')} บาทได้ไหม`,
  (amount,months,shares)=>`เป็นสมาชิก 2 ปี ส่งหุ้นต่อเนื่อง ${months} งวด หุ้นสะสม ${shares.toLocaleString('en-US')} บาท ขอกู้สามัญครั้งแรก ${amount.toLocaleString('en-US')} บาท ใช้หลักประกันอสังหาริมทรัพย์ ประเมินเงื่อนไข`,
  (amount,months,shares)=>`สมาชิก 18 เดือน ส่งหุ้นต่อเนื่อง ${months} เดือน หุ้นสะสม ${shares.toLocaleString('en-US')} บาท ขอกู้สามัญ ${amount.toLocaleString('en-US')} บาท เงินได้รายเดือน 40,000 บาท เหลือ 6,000 บาท กู้ครั้งแรก`,
  (amount,months,shares)=>`สมาชิก 18 เดือน ส่งหุ้นไม่ต่อเนื่อง ${months} งวด หุ้นสะสม ${shares.toLocaleString('en-US')} บาท ขอสามัญ ${amount.toLocaleString('en-US')} บาท ประเมินสิทธิ`,
  (amount,months,shares)=>`สมาชิก 18 เดือน ส่งหุ้นต่อเนื่อง ${months} เดือน หุ้นสะสม ${shares.toLocaleString('en-US')} บาท ขอสามัญ ${amount.toLocaleString('en-US')} บาท ใช้บุคคลค้ำประกัน มีผู้ค้ำ 1 คน ประเมิน`
];
for(const [id,q] of base)observations.push({id:'real-'+id,q});
for(let i=0;i<variants.length;i++)for(let g=0;g<groups.length;g++){
  observations.push({id:'variant-'+String(i+1).padStart(2,'0')+'-'+g,q:groups[g](...variants[i])});
}
assert.equal(observations.length,100);
const outcomes={PASS:0,PARTIAL:0,FAIL:0,BLOCKED:0};
for(const item of observations){
  try{
    const r=app.answer(item.q);
    assert.ok(r&&typeof r.answer==='string'&&r.answer.length>10,item.id+' empty answer');
    assert.notEqual(r.decision,'PERSONAL_APPROVED',item.id+' unsafe personal approval');
    assert.ok(Array.isArray(r.details),item.id+' missing retained detail evidence');
    if(r.intent==='loan_compound_reasoning'){
      assert.ok(/(?:✓|✗|\? ).*(?:หุ้น|สมาชิก|หลักประกัน|รายได้|วงเงิน|การส่ง)/.test(r.answer),
        item.id+' first answer lacks actual criterion: '+r.answer);
    }
    const details=[r.answer,...r.details].join(' ');
    if(item.id==='real-02')assert.match(r.answer,/11.*12|12.*11/,item.id+' missing 11/12 month shortfall');
    if(item.id==='real-03')assert.match(r.answer,/29,999.*30,000|ขาด 1 บาท/,item.id+' missing share shortfall');
    if(item.id==='real-04')assert.match(r.answer,/30,000/,item.id+' missing share amount');
    if(item.id==='real-05')assert.match(r.answer,/40,000|50,000/,item.id+' missing deficient capital');
    if(r.decision==='EVIDENCE_LOCK'||r.decision==='UNVERIFIED_RULE')outcomes.BLOCKED++;
    else if(r.decision==='NEED_INFO'||r.decision==='NOT_YET_ELIGIBLE'||r.decision==='RULE_INFORMATION'||r.decision==='ELIGIBLE_CONDITION')outcomes.PASS++;
    else outcomes.PARTIAL++;
  }catch(err){outcomes.FAIL++;console.error('FAIL',item.id,item.q,String(err));}
}
console.log('ORDINARY ANSWER FIRST 100 ENGINE SCENARIOS',JSON.stringify(outcomes));
assert.equal(outcomes.FAIL,0,'Answer-first 100-case verification failed');
