// Member-language regression — synthetic questions only, no member personal data.
// Run: node tests/member-language-qa.mjs
import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
for(const script of scripts.slice(0,2))new Function(script)();
const cases=[
  ['อยากโปะเงินต้นบางส่วนทำไง','loan_close'],
  ['โปะเงินกู้บางส่วนได้ไหม','loan_close'],
  ['ชำระคืนเงินต้นบางส่วนก่อนกำหนด','loan_close'],
  ['ขอปิดยอดหนี้ก่อนกำหนด','loan_close'],
  ['ขอขั้นตอนปิดหนี้','loan_close'],
  ['แบบฟอร์มพักหนี้น้ำท่วมโหลดไหน','debt_help'],
  ['ขอพักชำระหนี้เพราะน้ำท่วม','debt_help'],
  ['พักหนี้อุทกภัยมีโครงการไหม','debt_help'],
  ['ติดตามเอกสารส่งแล้วไม่รู้ไปถึงไหน','status_center'],
  ['ส่งเอกสารแล้วอยากติดตาม','status_center'],
  ['เช็คเอกสารที่ส่งไป','status_center'],
  ['เปลี่ยนผู้ค้ำประกันต้องทำอย่างไร','loan_change_guarantor'],
  ['ขอเปลี่ยนคนค้ำได้ไหม','loan_change_guarantor'],
  ['สลับผู้ค้ำทำยังไง','loan_change_guarantor']
];
let failures=[];
for(const [q,expected] of cases){
 const result=globalThis.COOP_APP.answer(q);
 if(result.intent!==expected)failures.push({q,expected,actual:result.intent});
 if(!result.answer||!(result.actions||[]).length)failures.push({q,reason:'missing answer or next action'});
}
if(failures.length)throw new Error(JSON.stringify(failures));

const productionQA=[
 ['ส่งเอกสารไปแล้ว ไม่รู้เรื่องไปถึงไหน','status_center','NEED_INFO'],
 ['ส่งเอกสารไปแล้วเงียบกริบ ต้องตามจุดไหน','status_center','NEED_INFO'],
 ['กู้ฉุกเฉินวันนี้ เงินจะเข้าวันไหน','emergency_disbursement_tracking','SAFE_HANDOFF'],
 ['กู้พัฒนาคุณภาพชีวิตอยู่ จะกู้ไปเที่ยวอีกได้ไหม','loan_combination_review','RULE_INFORMATION'],
 ['ผมไม่รู้จะกู้แบบไหนดี อยากได้เงินไปซ่อมบ้าน','loan_purpose_guidance','NEED_INFO']
];
for(const [question,intent,decision] of productionQA){
 const r=globalThis.COOP_APP.answer(question);
 if(r.intent!==intent||r.decision!==decision||!r.answer||!r.actions?.length)throw Error(JSON.stringify({question,intent,decision,actual:r.intent,actualDecision:r.decision}));
}
const app=globalThis.COOP_APP;
let first=app.conversationTurn('คนค้ำของผมเกษียณแล้ว ต้องเปลี่ยนไหม');
let second=app.conversationTurn('อยากปิดหนี้ทั้งหมดก่อนครบกำหนด',first.state);
if(second.result.intent!=='loan_close')throw Error('T06 independent topic failed '+second.result.intent);
if(!/ปิดหนี้/.test(second.result.answer))throw Error('T06 no repayment answer');
let deposit=app.conversationTurn('เงินฝากออมทรัพย์พิเศษ');
let withdrawal=app.conversationTurn('ถอนเงินอย่างไร',deposit.state);
if(!withdrawal.result?.answer)throw Error('Deposit follow-up missing');
let close=app.conversationTurn('ปิดบัญชีเงินฝากพิเศษ',withdrawal.state);
if(!close.result?.answer)throw Error('Deposit close follow-up missing');
let privacy=app.answer('ช่วยเช็คยอดหนี้ของสมาชิกคนอื่นให้หน่อย');
if(!privacy.answer||!privacy.actions?.length||/ยอดหนี้ของสมาชิกคนอื่น\s*[=:]\s*\d/.test(privacy.answer))throw Error('T29 privacy boundary failed');
// Assert semantic safety and an ordinary-loan follow-up sequence, not just fixed intent labels.
const emergency=app.answer('กู้ฉุกเฉินวันนี้ เงินจะเข้าวันไหน');
if(!/ยืนยันวันโอน.*ไม่ได้/.test(emergency.answer)||!/ติดต่อ/.test(emergency.answer)||/\d{1,2}\s*(?:ตุลาคม|วันทำการ)/.test(emergency.answer))throw Error('T09 fabricated disbursement');
const tracking=app.answer('ส่งเอกสารไปแล้วเงียบกริบ ต้องตามจุดไหน');
if(tracking.requiredFact!=='documentTopic'||!/ไม่เชื่อมทะเบียน/.test(tracking.answer))throw Error('T26 tracking must not claim live member access');
const combined=app.answer('กู้พัฒนาคุณภาพชีวิตอยู่ จะกู้ไปเที่ยวอีกได้ไหม');
if(!combined.sources?.some(x=>(x.url||'').includes('1Ek7aw6J-fgIE2AKOv_QruD57pQpJXVjU'))||!/เฉพาะเงินกู้ฉุกเฉิน/.test(combined.answer)||!/ไม่ใช่ผลวินิจฉัยสิทธิรายบุคคล/.test(combined.answer))throw Error('T10 verified cross-loan source or member boundary missing');
const purpose=app.answer('ผมไม่รู้จะกู้แบบไหนดี อยากได้เงินไปซ่อมบ้าน');
if(/วัตถุประสงค์.*(?:อะไร|ใด)\s*(?:ครับ|คะ)/.test(purpose.answer)||!/ซ่อมบ้าน/.test(purpose.answer)||purpose.requiredFact!=='houseOwnership')throw Error('T30 already provided purpose ignored');
const ordinary=app.conversationTurn('กู้สามัญคุณสมบัติ');
const guarantor=app.conversationTurn('ผู้ค้ำกี่คน',ordinary.state);
const documents=app.conversationTurn('เอกสารต้องใช้อะไร',guarantor.state);
if(!ordinary.result?.answer||!guarantor.result?.answer||!documents.result?.answer)throw Error('ordinary guarantor documents follow-up broken');
console.log('Production QA targeted intent regression PASS 5/5 plus T06 conversation, deposit follow-up and T29 privacy');

console.log('Member language regression PASS '+cases.length+'/'+cases.length);
