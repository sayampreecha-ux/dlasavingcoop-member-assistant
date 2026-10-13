import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';

// Phase-1 regression: de-identified loan question patterns already represented
// in the existing member-real-questions suite. No raw LINE sender/message data.
const app=loadMemberEngine();
const cases=[
  {question:'กู้ฉุกเฉินส่งมาแล้ว 6 งวด กู้ฉุกเฉินอีกได้ไหม',intent:'decision_emergency_repeat'},
  {question:'กู้เพื่อการศึกษาไปแล้ว อยากกู้เพิ่มสำหรับลูกคนที่สอง ยื่นเพิ่มได้ไหม',intent:'decision_education_repeat'},
  {question:'ค้ำโครงการกู้พัฒนาคุณภาพชีวิตไปแล้ว 1 คน จะค้ำเพิ่มอีก 1 คนได้ไหม',intent:'guarantor_quality_capacity'},
  {question:'มีสามัญเดิมกับคุณภาพชีวิต ถ้าจะกู้สามัญใหม่ต้องปิดตัวไหน',intent:'loan_compound_reasoning'},
  {question:'ทำไมผู้ค้ำของผมไม่ผ่าน',intent:'personal_handoff'}
];
let passed=0;
for(const {question,intent} of cases){
 const response=app.answer(question);
 assert.equal(response.intent,intent,'incorrect intent: '+question);
 assert.ok(typeof response.answer==='string'&&response.answer.trim(),'empty answer: '+question);
 assert.ok(!/กู้ได้แน่นอน|อนุมัติแล้ว/.test(response.answer),'unverified approval claim');
 if(intent==='personal_handoff'){
   assert.ok(!/เลขสมาชิก|เลขบัตรประชาชน.*(?:ส่ง|กรอก)/.test(response.answer),'unsafe request for identity in chat');
 }else{
   assert.ok((response.sources||[]).some(x=>/^https:\/\//.test(x.url||'')) ||
     (response.actions||[]).some(x=>Array.isArray(x)&&/^https:\/\//.test(x[1]||'')),
     'missing official source/action: '+question);
 }
 passed++;
}
console.log('No-API phase-1 loan question regression:',passed,'/',cases.length,'passed');
