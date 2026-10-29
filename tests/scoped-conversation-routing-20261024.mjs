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
  else assert.equal(t.result.decision,spec.name==='childbirth'&&['ใครมีสิทธิ','ยื่นเมื่อไร','ต้องเป็นสมาชิกนานไหม','มีเงื่อนไขอะไร'].includes(q)?'RULE_INFORMATION':'SAFE_HANDOFF',spec.name+': '+q+' decision');
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

// Published childbirth rules must answer public facts directly, without handing off.
for(const [q,required] of [['ใครมีสิทธิ',/สมาชิกสมทบ/],['ยื่นเมื่อไร',/120 วัน.*วันแจ้งเกิด/],['ต้องเป็นสมาชิกนานไหม',/6 เดือน/],['มีเงื่อนไขอะไร',/เพียงคนเดียว/]]){
 const start=app.conversationTurn('สวัสดิการคลอดบุตร');
 const t=app.conversationTurn(q,start.state,{continuation:true});
 assert.equal(t.result.decision,'RULE_INFORMATION');
 assert.match(t.result.answer,required);
 assert.ok(t.result.sources.some(s=>s.url.includes('1gYxKLW')));
}
// Association follow-up must use its beneficiary declaration, not member registry.
{
 let t=app.conversationTurn('สมาคมฌาปนกิจสงเคราะห์');
 t=app.conversationTurn('ผู้รับผลประโยชน์ต้องทำอย่างไร',t.state,{continuation:true});
 assert.equal(t.state.topic,'funeral-association');
 assert.match(t.result.answer,/ผู้รับเงินสงเคราะห์สมาคมฌาปนกิจ/);
 assert.ok(t.result.sources.some(s=>s.url.includes('1sxikYqV')));
 assert.equal(t.result.decision,'EVIDENCE_LOCK');
}

// Existing-debt questions need the public rule rather than another fact prompt.
{
 const t=app.conversationTurn('ถ้ายังมีหนี้อยู่ทำอย่างไร',app.conversationTurn('เงินกู้ฉุกเฉินกู้ได้ไหม').state,{continuation:true});
 assert.equal(t.result.intent,'emergency_existing_debt_public_rule');
 assert.equal(t.result.decision,'RULE_INFORMATION');
 assert.match(t.result.answer,/3 งวด.*หักกลบ/);
 assert.ok(t.result.sources.some(x=>x.url.includes('1XZYfuX')));
}
for(const start of ['สวัสดิการคลอดบุตร','ทุนการศึกษาบุตรสมาชิก','สมัครสมาชิกสหกรณ์']){
 const t=app.conversationTurn('ติดตามผลอย่างไร',app.conversationTurn(start).state,{continuation:true});
 assert.equal(t.result.intent,'scoped_application_tracking_handoff');
 assert.equal(t.result.decision,'SAFE_HANDOFF');
 assert.doesNotMatch(t.result.answer,/เป็นเอกสารเรื่องใด|บริการใด|ต้องการติดตามเอกสาร/);
}
{
 const t=app.conversationTurn('คุณสมบัติอะไรบ้าง',app.conversationTurn('เงินกู้สามัญกู้ได้ไหม').state,{continuation:true});
 assert.match(t.result.answer,/ประกันชีวิต/);
 assert.match(t.result.answer,/สหกรณ์อื่น/);
}

// Real approval-index path must keep the selected notice, not just offline topic.
{
 const fs=await import('node:fs');const d=JSON.parse(fs.readFileSync(new URL('../data/current-events.json',import.meta.url),'utf8'));
 const a=loadMemberEngine();a.setApprovalIndex(d.approvalIndex,d.lastCheckedAt);
 let t=a.conversationTurn('ประกาศผลอนุมัติเงินกู้สามัญล่าสุด');assert.equal(t.state.noticeId,'official-4946');
 for(const [q,must] of [['เป็นรอบไหน',/15 ตุลาคม 2569/],['วันโอนเมื่อไร',/30 ตุลาคม 2569/],['งวดแรกเมื่อไร',/พฤศจิกายน 2569/],['ดูเอกสารได้ที่ไหน',/ประกาศสาธารณะ/],['มีรายชื่อหรือไม่',/ไม่ยืนยันว่าผู้ถามได้รับอนุมัติ/],['ตรวจสถานะตัวเองได้ไหม',/ยังยืนยันสถานะของคุณไม่ได้/],['ถ้ายังไม่พบต้องทำอย่างไร',/ยังไม่ใช่ผลปฏิเสธ/],['ต้องติดต่อใคร',/ฝ่ายสินเชื่อ/],['มีประกาศใหม่หรือยัง',/ข้อมูลตรวจสอบล่าสุด/]]){
  t=a.conversationTurn(q,t.state,{continuation:true});assert.equal(t.state.topic,'approval-announcement');assert.match(t.result.answer,must,q);assert.equal(t.state.noticeId,'official-4946','notice product/round must remain ordinary');
  assert.doesNotMatch(t.result.answer,/ข้อความนี้ยังไม่พอระบุคำถาม|ต้องการส่งหรือขอเอกสารเรื่องใด|เป็นเงินกู้ประเภทไหนครับ/);
  assert.ok(t.result.sources.length>0);
 }
}

// Production manual QA: a named funeral service must escape every primary loan.
{
 const fs=await import('node:fs');const monitor=JSON.parse(fs.readFileSync(new URL('../data/official-source-monitor.json',import.meta.url),'utf8'));
 for(const useMonitor of [false,true])for(const start of ['เงินกู้สามัญกู้ได้ไหม','เงินกู้ฉุกเฉินกู้ได้ไหม','เงินกู้พิเศษรวมหนี้คืออะไร']){
  const a=loadMemberEngine();if(useMonitor)a.applySourceMonitor(monitor);
  let t=a.conversationTurn(start);t=a.conversationTurn('ดอกเบี้ยเท่าไร',t.state);
  t=a.conversationTurn('สมาคมฌาปนกิจสงเคราะห์',t.state);
  assert.equal(t.state.topic,'funeral-association',start+' named topic switch');
  assert.match(t.result.answer,/เลือกเรื่องฌาปนกิจ/);assert.doesNotMatch(t.result.answer,/ประเด็น association|แบบคำขอ.*เงินกู้/);
  t=a.conversationTurn('ผู้รับผลประโยชน์ต้องทำอย่างไร',t.state);
  assert.equal(t.state.topic,'funeral-association');assert.match(t.result.answer,/ผู้รับเงินสงเคราะห์สมาคมฌาปนกิจ/);
  assert.ok(t.result.sources.some(x=>x.url.includes('1sxikYqV')));assert.equal(t.result.decision,'EVIDENCE_LOCK');
 }
 const a=loadMemberEngine();let t=a.conversationTurn('เงินกู้สามัญกู้ได้ไหม');
 t=a.conversationTurn('เงินกู้สามัญต้องเป็นสมาชิกสมาคมฌาปนกิจไหม',t.state);
 assert.equal(t.state.topic,'ordinaryLoanCurrent','explicit loan association condition must stay in loan');
}
