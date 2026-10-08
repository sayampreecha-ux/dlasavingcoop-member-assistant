import fs from 'node:fs';
import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const a=loadMemberEngine();
let pass=0;
function check(q,verify){const r=a.answer(q);assert.ok(r?.answer,'EMPTY '+q);verify(r);pass++;}
const primary='https://drive.google.com/file/d/1035C9tf9AU--HHJFq581v9uCwsF6ANL_/view';
for(const [salary,amt] of [[14999,'500'],[15001,'700'],[20000,'700'],[20001,'900'],[25000,'900'],[25001,'1,100'],[30000,'1,100'],[30001,'1,300'],[35000,'1,300'],[35001,'1,500'],[40000,'1,500'],[40001,'1,700'],[45000,'1,700'],[45001,'1,900'],[50000,'1,900'],[50001,'2,100']]){
 check('เงินเดือน '+salary+' บาท ปัจจุบันต้องถือหุ้นเดือนละเท่าไร',r=>{assert.match(r.answer,new RegExp(amt+' บาท'));assert.equal(r.decision,'CURRENT_RULE');assert.ok(r.sources?.some(s=>s.url===primary));});
}
check('เงินเดือน 15000 บาท ปัจจุบันต้องถือหุ้นเดือนละเท่าไร',r=>{assert.equal(r.decision,'EVIDENCE_LOCK');assert.doesNotMatch(r.answer,/ต้องถือหุ้น.*(?:500|700) บาท/);});
check('ยอดหุ้นของผมเท่าไร',r=>{assert.notEqual(r.decision,'CURRENT_RULE');assert.ok(r.actions?.length);});
check('เปลี่ยนอัตราหุ้นรายเดือน',r=>{assert.ok(r.actions?.some(a=>a[1].includes('177gzqKCqFxgaQM69cUfvcI40Xf9t7ESf')));});
check('กู้สามัญวงเงินสูงสุดเท่าไร',r=>{assert.ok(r.answer.length>20);assert.ok(r.sources?.length||r.actions?.length);});
console.log('FOUR GATES QA: '+pass+' focused evidence and privacy tests PASS');
