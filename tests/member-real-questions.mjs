import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
if(scripts.length!==3) throw new Error(`expected 3 inline scripts, got ${scripts.length}`);
new Function(scripts[0])();
new Function(scripts[1])();
new Function(scripts[2]);

const cases=[
 ['กู้เพื่อการศึกษาไป 140000 ปัจจุบันผ่อนไป 7 งวด อยากกู้เพิ่มสำหรับลูกคนที่สอง ยื่นเพิ่มได้มั้ยคะ','loan_education_topup'],
 ['ค้ำโครงการกู้พัฒนาคุณภาพชีวิตไปแล้ว 1 คน จะค้ำเพิ่มอีก 1 คนได้ไหม','guarantor_quality_capacity'],
 ['เงินเดือนเหลือ 5 พัน กู้ไม่ได้ใช่ไหม','loan_living_balance'],
 ['กู้สามัญหักกลบคุณภาพชีวิตได้ไหม','loan_cross_offset'],
 ['มีกู้สามัญเดิม และกู้เพื่อพัฒนาคุณภาพชีวิต ถ้าจะกู้สามัญใหม่ ต้องหักกลบสามัญเดิมและพัฒนาคุณภาพชีวิตด้วยไหม','loan_cross_offset'],
 ['กู้ฉุกเฉินส่งมาแล้ว 6 งวด กู้ฉุกเฉินอีกได้ไหม','loan_emergency_repeat'],
 ['กู้ฉุกเฉินไว้สามหมื่น ปัจจุบันเหลือเงินเยอะขึ้น ขอเพิ่มวงเงินได้ไหม','loan_emergency_repeat'],
 ['ต้องส่งเงินพัฒนาคุณภาพชีวิตกี่งวดถึงจะยื่นกู้สามัญได้','loan_cross_wait'],
 ['ต้องรอกู้พัฒนาคุณภาพชีวิตกี่งวดถึงจะกู้ฉุกเฉินได้','loan_cross_wait'],
 ['ขอทราบรอบการอนุมัติเงินฉุกเฉินต่อจากรอบนี้ประมาณวันที่เท่าไร','live_schedule'],
 ['สวัสดิการการศึกษาบุตรจะประกาศผลเดือนไหน','live_schedule'],
 ['เช็คเพื่อชำระบัตรเครดิตส่งมาหรือยัง ไปรับเองได้ไหม','live_schedule'],
 ['ลาออกจากการเป็นสมาชิก ต้องทำอย่างไร','resignation'],
 ['ทำไมผู้ค้ำของผมไม่ผ่าน','personal_handoff'],
 ['ซื้อหุ้นเพิ่มได้อยู่หรือเปล่า','share_purchase'],
 ['เงินเฉลี่ยคืนต่างจากปันผลยังไง','dividend']
];

const failures=[];
for(const [q,expected] of cases){
 const r=globalThis.COOP_APP.answer(q);
 if(r.intent!==expected) failures.push({q,expected,actual:r.intent,answer:r.answer});
 if(!r.answer||!/./.test(r.answer)) failures.push({q,group:'empty-answer'});
 if((/loan_|guarantor_/.test(expected)) && !['personal_handoff','live_schedule'].includes(expected)){
   const hasAuthority=(r.actions||[]).some(x=>Array.isArray(x)&&/^https?:/.test(x[1]));
   if(!hasAuthority) failures.push({q,group:'missing-authority-action'});
 }
}

const conversational=[
 ['กู้การศึกษาเพิ่มได้ไหม','loan_education_topup'],
 ['ลูกคนที่สองกู้การศึกษาได้มั้ย','loan_education_topup'],
 ['ค้ำคุณภาพชีวิตเพิ่มได้ไหม','guarantor_quality_capacity'],
 ['เงินเหลือห้าพันกู้ได้มั้ย','loan_living_balance'],
 ['สามัญกลบคุณภาพชีวิตไหม','loan_cross_offset'],
 ['คุณภาพชีวิตส่งกี่งวดกู้สามัญได้','loan_cross_wait'],
 ['คุณภาพชีวิตกี่งวดกู้ฉุกเฉินได้','loan_cross_wait'],
 ['รอบอนุมัติฉุกเฉินวันไหน','live_schedule'],
 ['เงินฉุกเฉินโอนวันไหน','live_schedule'],
 ['ทุนบุตรประกาศเมื่อไหร่','live_schedule'],
 ['เช็คบัตรเครดิตถึงหรือยัง','live_schedule'],
 ['ผู้ค้ำผมไม่ผ่านเพราะอะไร','personal_handoff']
];
for(const [q,expected] of conversational){
 const r=globalThis.COOP_APP.answer(q);
 if(r.intent!==expected) failures.push({q,expected,actual:r.intent,group:'conversational'});
}

if(failures.length){console.error(JSON.stringify({ok:false,failures},null,2));process.exit(1);}
console.log(JSON.stringify({ok:true,cases:cases.length+conversational.length,real:cases.length,conversational:conversational.length},null,2));
