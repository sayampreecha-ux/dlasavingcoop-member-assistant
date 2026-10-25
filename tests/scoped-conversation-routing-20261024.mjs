import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const app=loadMemberEngine();
const cases=[
 {name:'childbirth',start:'สวัสดิการคลอดบุตร',prefix:['ได้รับเท่าไร'],questions:['ใครมีสิทธิ','ยื่นเมื่อไร','ยื่นที่ไหน','ต้องเป็นสมาชิกนานไหม','มีเงื่อนไขอะไร','ใช้เวลาพิจารณาเท่าไร'],intent:'childbirth_scoped_followup',topic:'welfare:childbirth',scope:/สวัสดิการคลอดบุตร/},
 {name:'scholarship',start:'ทุนการศึกษาบุตรสมาชิก',questions:['ใครมีสิทธิ','ส่งที่ไหน','มีเงื่อนไขผลการเรียนไหม'],intent:'scholarship_scoped_followup',topic:'scholarship',scope:/ทุน.*(?:การศึกษา|บุตร)|ทุนส่งเสริมการศึกษา/},
 {name:'membership',start:'สมัครสมาชิกสหกรณ์',questions:['สมัครได้ที่ไหน','มีค่าธรรมเนียมหรือไม่'],intent:'membership_scoped_followup',topic:'membership-apply',scope:/สมัครสมาชิกสหกรณ์/},
 {name:'public-notice',start:'ประกาศอนุมัติเงินกู้ล่าสุด',questions:['เป็นรอบไหน','วันโอนเมื่อไร','งวดแรกเมื่อไร','ดูเอกสารได้ที่ไหน','มีรายชื่อหรือไม่','ตรวจสถานะตัวเองได้ไหม','ถ้ายังไม่พบต้องทำอย่างไร','ต้องติดต่อใคร','มีประกาศใหม่หรือยัง'],intent:'approval_public_scoped_followup',topic:'approval-public',scope:/ประกาศอนุมัติเงินกู้สาธารณะ/},
 {name:'guarantor',start:'ผู้ค้ำประกันเงินกู้ต้องมีคุณสมบัติอะไร',questions:['ต้องค้ำกี่คน','มีภาระค้ำเดิมได้ไหม','ต้องใช้เอกสารอะไร','ยื่นเรื่องที่ไหน','ถ้าผู้กู้ผิดนัดทำอย่างไร','ขอปลดภาระค้ำได้ไหม'],intent:'guarantor_scoped_followup',topic:'guarantor-guidance',scope:/ค้ำประกันเงินกู้/}
];
let n=0;
for(const spec of cases){
 let t=app.conversationTurn(spec.start);
 for(const q of spec.prefix||[])t=app.conversationTurn(q,t.state,{continuation:true});
 for(const q of spec.questions){
  t=app.conversationTurn(q,t.state,{continuation:true});
  const officialNoticeDocs=spec.name==='public-notice'&&q==='ดูเอกสารได้ที่ไหน';
  if(officialNoticeDocs){
    assert.equal(t.result.intent,'approval_public_documents_verified',spec.name+': '+q+' direct intent');
    assert.equal(t.result.decision,'PROCEDURE_INFORMATION',spec.name+': '+q+' must answer public-document location');
    assert.match(t.result.answer,/ประกาศผลอนุมัติเงินกู้/,spec.name+': '+q+' relevant answer');
    assert.ok(t.result.sources.some(x=>x.url==='https://www.dlasavingcoop.com/list.php?Category=loan'),spec.name+': '+q+' official source');
    assert.doesNotMatch(t.result.answer,/เลขประจำตัวประชาชน\s*\d{13}/,spec.name+': '+q+' privacy');
  }
  const scholarshipDirect=spec.name==='scholarship';
  if(!officialNoticeDocs)assert.equal(t.result.intent,scholarshipDirect?(q==='มีเงื่อนไขผลการเรียนไหม'?'scholarship_verified_grades':'scholarship'):spec.intent,spec.name+': '+q+' intent');
  if(officialNoticeDocs){}else if(scholarshipDirect)assert.notEqual(t.result.decision,'SAFE_HANDOFF',spec.name+': '+q+' should use verified public rules');
  else assert.equal(t.result.decision,'SAFE_HANDOFF',spec.name+': '+q+' decision');
  assert.equal(t.state.topic,spec.topic,spec.name+': '+q+' topic');
  if(!officialNoticeDocs)assert.match(t.result.answer,spec.scope,spec.name+': '+q+' service');
  assert.ok(t.result.sources.some(s=>s.url?.startsWith('https://')),spec.name+': '+q+' source');
  assert.doesNotMatch(t.result.answer,/เป็นเงินกู้ประเภทไหนครับ|ข้อความนี้ยังไม่พอระบุคำถาม|ต้องการส่งหรือขอเอกสารเรื่องใดครับ/,spec.name+': '+q);
  n++;
 }
}
// Explicit service switches must still work.
let sw=app.conversationTurn('สวัสดิการคลอดบุตร');
sw=app.conversationTurn('เงินฝากออมทรัพย์พิเศษ',sw.state,{continuation:true});
assert.notEqual(sw.state.topic,'welfare:childbirth');
assert.equal(n,26);
console.log('Scoped multi-turn semantic routing: '+n+'/'+n+' targeted checks PASS; verified scholarship facts and privacy-safe handoffs');
