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

// Verified Answer Engine gate: loan answers must expose evidence and explain the no-guess boundary.
for(const q of ['กู้การศึกษาเพิ่มได้ไหม','เงินเหลือห้าพันกู้ได้มั้ย','สามัญกลบคุณภาพชีวิตไหม','คุณภาพชีวิตกี่งวดกู้ฉุกเฉินได้','กู้ฉุกเฉิน']){
 const r=globalThis.COOP_APP.answer(q);
 const detail=(r.details||[]).join(' ');
 const hasEvidence=/หลักฐานที่ใช้ตอบ/.test(detail);
 const hasInterpretation=/การตีความ/.test(detail);
 const hasOfficialSource=(r.sources||[]).some(s=>/^https?:/.test(s.url||''));
 if(!hasEvidence||!hasInterpretation||!hasOfficialSource) failures.push({q,group:'verified-answer-gate',hasEvidence,hasInterpretation,hasOfficialSource});
}

const compoundCases=[
 ['มีสามัญเดิมกับคุณภาพชีวิต ถ้าจะกู้สามัญใหม่ต้องปิดตัวไหน','loan_compound_reasoning'],
 ['มีหนี้สามัญและคุณภาพชีวิต เงินเดือนเหลือไม่มาก จะกู้ใหม่ได้ไหม','loan_compound_reasoning'],
 ['กู้ฉุกเฉินอยู่และมีหนี้สามัญ จะกู้เพิ่มได้ไหม','loan_compound_reasoning'],
 ['สามัญใหม่ต้องใช้ผู้ค้ำและหักกลบคุณภาพชีวิตอย่างไร','loan_compound_reasoning']
];
for(const [q,expected] of compoundCases){
 const r=globalThis.COOP_APP.answer(q);
 const d=(r.details||[]).join(' ');
 if(r.intent!==expected||!/หลายเงื่อนไข/.test(d)||!(r.sources||[]).length) failures.push({q,expected,actual:r.intent,group:'compound-reasoning'});
}

const smartCases=[
 ['มีหนี้สามัญและคุณภาพชีวิต เงินเดือนเหลือไม่มาก จะกู้ใหม่ได้ไหม',['OFFICIAL_EVIDENCE','ข้อมูลที่ยังขาด']],
 ['สามัญใหม่ต้องใช้ผู้ค้ำและหักกลบคุณภาพชีวิตอย่างไร',['OFFICIAL_EVIDENCE','ข้อมูลที่ยังขาด']],
 ['กู้สามัญ',['OFFICIAL_EVIDENCE','สถานะหลักฐาน']],
 ['รอบอนุมัติฉุกเฉินวันไหน',['LIVE_OFFICIAL','สถานะหลักฐาน']]
];
for(const [q,[evidence,phrase]] of smartCases){
 const r=globalThis.COOP_APP.answer(q);
 const detail=(r.details||[]).join(' ');
 if(r.evidence!==evidence||!detail.includes(phrase)||!r.confidence) failures.push({q,group:'smart-evidence',expectedEvidence:evidence,actualEvidence:r.evidence,confidence:r.confidence,detail});
}

const guidedCases=[
 ['มีหนี้สามัญและคุณภาพชีวิต เงินเดือนเหลือไม่มาก จะกู้ใหม่ได้ไหม','ไม่จำเป็นต้องเปิดเอกสารเอง'],
 ['สามัญใหม่ต้องใช้ผู้ค้ำและหักกลบคุณภาพชีวิตอย่างไร','ผู้ค้ำรายนี้มีภาระค้ำเงินกู้อื่นอยู่หรือไม่'],
 ['ถามเรื่องสิทธิที่ไม่เคยมีในระบบ','ไม่ต้องไปค้นเอกสารเอง']
];
for(const [q,phrase] of guidedCases){
 const r=globalThis.COOP_APP.answer(q);
 const all=[r.answer,...(r.details||[]),...(r.followups||[])].join(' ');
 if(!all.includes(phrase)) failures.push({q,group:'guided-until-resolved',phrase,intent:r.intent,all});
}

const zeroApiGuided=[
 ['กู้ได้ไหม','loan_need_type','ประเภทเงินกู้'],
 ['กู้ฉุกเฉินกู้ซ้ำได้ไหม','loan_need_installments','ชำระมาแล้วกี่งวด'],
 ['คุณภาพชีวิตกู้ใหม่ได้ไหม','loan_need_installments','ชำระมาแล้วกี่งวด']
];
for(const [q,expected,phrase] of zeroApiGuided){
 const r=globalThis.COOP_APP.answer(q);
 if(r.intent!==expected||![r.answer,...(r.details||[])].join(' ').includes(phrase)) failures.push({q,group:'zero-api-guided',expected,actual:r.intent});
}

const freshnessCases=[
 ['หลักเกณฑ์เดิมก่อน 30 มิถุนายน เงินเหลือเท่าไร','loan_ordinary_legacy_balance','5,000 บาท'],
 ['เงินเหลือห้าพันกู้ได้มั้ย','loan_living_balance',null]
];
for(const [q,expected,must] of freshnessCases){
 const r=globalThis.COOP_APP.answer(q);
 if(r.intent!==expected||(must&&!r.answer.includes(must))) failures.push({q,group:'rule-freshness',expected,actual:r.intent,answer:r.answer});
}
const spokenLoanCases=[
 ['ฉุกเฉินเพิ่มวงเงินได้มั้ย','loan_emergency_repeat'],
 ['เงินกู้ฉุกเฉินเพิ่มวงเงินได้ไหม','loan_emergency_repeat'],
 ['ผ่อนฉุกเฉินมา 6 งวด ขอเพิ่มได้มั้ย','loan_emergency_repeat'],
 ['กู้ฉุกเฉินซ้ำได้มั้ย','loan_need_installments']
];
for(const [q,expected] of spokenLoanCases){
 const r=globalThis.COOP_APP.answer(q);
 if(r.intent!==expected) failures.push({q,group:'spoken-loan',expected,actual:r.intent,answer:r.answer});
}
// UX contract: guided answers must be renderable with an inline free-text reply field.
const pageSource=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const token of ['follow-input','ตอบข้อมูลเพิ่มตรงนี้…','ตอบข้อมูลเพิ่มเติม']){
 if(!pageSource.includes(token)) failures.push({group:'inline-followup-ui',missing:token});
}
if(failures.length){console.error(JSON.stringify({ok:false,failures},null,2));process.exit(1);}
console.log(JSON.stringify({ok:true,cases:cases.length+conversational.length,real:cases.length,conversational:conversational.length},null,2));
