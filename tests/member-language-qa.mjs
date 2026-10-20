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
console.log('Member language regression PASS '+cases.length+'/'+cases.length);
