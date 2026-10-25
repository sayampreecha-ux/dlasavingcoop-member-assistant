import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const a=loadMemberEngine();
// Diagnostic coverage only: a nonempty response is NOT proof of correctness.
const scenarios=[["ordinary-loan",["เงินกู้สามัญกู้ได้ไหม","คุณสมบัติอะไรบ้าง","วงเงินสูงสุดเท่าไร","ผ่อนได้กี่งวด","ดอกเบี้ยเท่าไร","ต้องมีผู้ค้ำกี่คน","ใช้เอกสารอะไร","ยื่นที่ไหน","ใช้เวลาพิจารณาเท่าไร","มีข้อจำกัดอายุหรือไม่"]],["emergency-loan",["เงินกู้ฉุกเฉินกู้ได้ไหม","วงเงินสูงสุดเท่าไร","ต้องเป็นสมาชิกกี่เดือน","ผ่อนได้กี่งวด","ใช้คนค้ำไหม","ดอกเบี้ยเท่าไร","มีเอกสารอะไรบ้าง","ต้องยื่นที่ไหน","กู้ซ้ำได้ไหม","ถ้ายังมีหนี้อยู่ทำอย่างไร"]],["special-debt",["เงินกู้พิเศษรวมหนี้คืออะไร","ใครยื่นได้","วงเงินเท่าไร","ผ่อนได้กี่งวด","ต้องมีหลักประกันอะไร","ดอกเบี้ยเท่าไร","ใช้เอกสารอะไร","เปิดรับเมื่อไร","ต้องสมัครอย่างไร","มีหนี้เดิมยื่นได้ไหม"]],["shares",["การส่งหุ้นรายเดือน","ส่งหุ้นสูงสุดเท่าไร","เพิ่มหุ้นได้ไหม","ลดหุ้นได้ไหม","ต้องทำอย่างไร","ใช้เอกสารอะไร","ยื่นได้ที่ไหน","คืนหุ้นเมื่อไร","ถ้ามีหนี้ทำอย่างไร","ดูยอดหุ้นได้อย่างไร"]],["deposits",["เงินฝากออมทรัพย์พิเศษ","เปิดบัญชีอย่างไร","ฝากเพิ่มได้ไหม","ขั้นต่ำเท่าไร","ดอกเบี้ยเท่าไร","ถอนอย่างไร","ปิดบัญชีได้ไหม","มีค่าธรรมเนียมไหม","ใช้เอกสารอะไร","ต้องติดต่อที่ไหน"]],["welfare",["สวัสดิการคลอดบุตร","ได้รับเท่าไร","ใครมีสิทธิ","ต้องใช้เอกสารอะไร","ยื่นเมื่อไร","ยื่นที่ไหน","ต้องเป็นสมาชิกนานไหม","มีเงื่อนไขอะไร","ใช้เวลาพิจารณาเท่าไร","ติดตามผลอย่างไร"]],["scholarships",["ทุนการศึกษาบุตรสมาชิก","ใครมีสิทธิ","สมัครเมื่อไร","ได้ทุนเท่าไร","ใช้เอกสารอะไร","สมัครอย่างไร","ส่งที่ไหน","มีเงื่อนไขผลการเรียนไหม","ประกาศผลเมื่อไร","ติดตามผลได้อย่างไร"]],["guarantors",["ผู้ค้ำประกันเงินกู้ต้องมีคุณสมบัติอะไร","ต้องค้ำกี่คน","เกษียณแล้วค้ำได้ไหม","มีภาระค้ำเดิมได้ไหม","ต้องใช้เอกสารอะไร","เปลี่ยนผู้ค้ำได้ไหม","ยื่นเรื่องที่ไหน","ผู้ค้ำต้องรับผิดอะไร","ถ้าผู้กู้ผิดนัดทำอย่างไร","ขอปลดภาระค้ำได้ไหม"]],["notices",["ประกาศอนุมัติเงินกู้ล่าสุด","เป็นรอบไหน","วันโอนเมื่อไร","งวดแรกเมื่อไร","ดูเอกสารได้ที่ไหน","มีรายชื่อหรือไม่","ตรวจสถานะตัวเองได้ไหม","ถ้ายังไม่พบต้องทำอย่างไร","ต้องติดต่อใคร","มีประกาศใหม่หรือยัง"]],["membership",["สมัครสมาชิกสหกรณ์","คุณสมบัติอะไรบ้าง","ใช้เอกสารอะไร","สมัครได้ที่ไหน","มีค่าธรรมเนียมหรือไม่","ส่งหุ้นเมื่อไร","เปลี่ยนข้อมูลสมาชิกอย่างไร","ลาออกได้ไหม","ถ้ามีหนี้อยู่ทำอย่างไร","ติดตามคำขออย่างไร"]],["funeral",["สมาคมฌาปนกิจสงเคราะห์","สมัครอย่างไร","คุณสมบัติอะไรบ้าง","จ่ายเงินอย่างไร","ใช้เอกสารอะไร","แจ้งเสียชีวิตอย่างไร","ผู้รับผลประโยชน์ต้องทำอย่างไร","มีเอกสารเพิ่มเติมไหม","ติดต่อที่ไหน","ติดตามคำขอได้อย่างไร"]]];
const rows=[];
for(const [domain,questions] of scenarios){
 let state=undefined;
 for(let i=0;i<questions.length;i++){
  const q=questions[i];
  try{
   const t=a.conversationTurn(q,state,{continuation:i>0});
   assert.ok(t&&t.result&&typeof t.result.answer==='string'&&t.result.answer.trim(),'no answer');
   assert.ok(t.state&&typeof t.state.topic==='string','missing conversation topic');
   const answer=t.result.answer;
   rows.push({domain,turn:i+1,question:q,intent:t.result.intent||null,topic:t.state.topic,decision:t.result.decision||null,sourceCount:Array.isArray(t.result.sources)?t.result.sources.length:0,answerPreview:answer.slice(0,160),answerFull:answer,sourceRefs:(t.result.sources||[]).map(x=>({title:x.title,url:x.url})),runtime:'PASS',semantic:'NOT_VERIFIED'});
   state=t.state;
  }catch(e){rows.push({domain,turn:i+1,question:q,runtime:'FAIL',semantic:'NOT_VERIFIED',error:String(e.message||e)});state=undefined;}
 }
}
const failures=rows.filter(r=>r.runtime==='FAIL');
console.log(JSON.stringify({type:'sequential-domain-diagnostic',summary:{domains:scenarios.length,turns:rows.length,runtimeFailures:failures.length,semanticNote:'Not independently assessed; do not present as content correctness PASS'},rows}));
assert.equal(rows.length,110,'coverage count');
assert.equal(failures.length,0,'sequential runtime errors');
