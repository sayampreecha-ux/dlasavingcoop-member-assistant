import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const app=loadMemberEngine();
const cases=[
  {domain:'ordinary-loan',start:'เงินกู้สามัญกู้ได้ไหม',follow:['คุณสมบัติอะไรบ้าง','วงเงินสูงสุดเท่าไร','ผ่อนได้กี่งวด'],final:/240\s*งวด/,reject:/ยังอ่านค่านั้นไม่ชัด|เป็นสมาชิกสหกรณ์มาแล้วกี่เดือน/},
  {domain:'welfare-childbirth',start:'สวัสดิการคลอดบุตร',follow:['ได้รับเท่าไร'],final:/1,?000\s*บาท/,reject:/เงินกู้ประเภทไหน/},
  {domain:'scholarship',start:'ทุนการศึกษาบุตรสมาชิก',follow:['ได้ทุนเท่าไร'],final:/ทุน|การศึกษา|เกณฑ์|ประกาศ/,reject:/เงินกู้ประเภทไหน/}
];
for(const spec of cases){
 let t=app.conversationTurn(spec.start);
 for(const q of spec.follow)t=app.conversationTurn(q,t.state,{continuation:true});
 assert.doesNotMatch(t.result.answer,spec.reject,spec.domain+': wrong-topic answer');
 assert.match(t.result.answer,spec.final,spec.domain+': missing relevant answer');
 console.log(JSON.stringify({domain:spec.domain,status:'PASS',intent:t.result.intent,topic:t.state.topic}));
}
console.log('Semantic multi-turn acceptance PASS');
