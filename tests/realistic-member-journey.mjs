import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
// Synthetic public wording and interaction contracts from the actual failed UI
// journey. Existing tests, private questions and expectations remain untouched.
export const realisticFixCases=[
 ['บ้านโดนน้ำท่วม อยากกู้ซ่อมบ้าน','disaster',/300,000 บาท/,/120 งวด/,/180 วัน/],
 ['ไฟไหม้บ้านแม่ อยากกู้ซ่อมบ้าน','disaster',/300,000 บาท/,/มารดา/],
 ['อยากกู้ค่าเทอมให้ลูก ต้องทำยังไง','education',/ขั้นตอนยื่น/,/สถานศึกษา/,/ไปรษณีย์/,/ติดตามคำขอ/],
 ['อยากกู้ค่าเล่าเรียนของตัวเอง ทำอย่างไร','education',/ขั้นตอนยื่น/,/กรอกแบบคำขอ/,/Mobile\/Web Application/],
 ['กู้ค่าเทอม','education',/200,000 บาท/,/60 งวด/],
 ['กู้ค่าเล่าเรียน','education',/200,000 บาท/,/60 งวด/],
 ['กู้ภัยพิบัติมีขั้นตอนยื่นอย่างไร','disaster',/ขั้นตอนยื่น/,/180 วัน/,/ภาพถ่ายความเสียหาย/],
 ['กู้เคหะต้องทำประกันไฟไหม้ไหม','specialHousingCurrent',/ประกันอัคคีภัย/,/3 ปี/],
 ['บ้านน้ำท่วม แต่ถามวงเงินกู้ฉุกเฉินสูงสุดเท่าไร','emergencyLoanCurrent',/60,000 บาท/]
];
export const completeLoanChoices=[['กู้ฉุกเฉิน',/60,000 บาท/],['กู้สามัญ',/2,000,000 บาท/],['กู้พัฒนาคุณภาพชีวิต',/5,000,000 บาท/],['กู้เคหะ',/3,000,000 บาท/],['กู้เพื่อการศึกษา',/200,000 บาท/],['กู้ภัยพิบัติ',/300,000 บาท/],['กู้ไถ่ถอนจำนอง',/3,000,000 บาท/]];
if(process.argv[1]===new URL(import.meta.url).pathname){
 const app=loadMemberEngine();let pass=0;
 for(const [q,domain,...checks]of realisticFixCases){const r=app.answer(q);assert.equal(r.domain,domain,q);for(const p of checks)assert.match(r.answer,p,q);assert.ok(r.sources.length);assert.doesNotMatch(r.answer,/undefined|NaN|กู้ได้แน่นอน/);pass++;}
 for(const [q,...checks]of [['อยากกู้ค่าเทอมให้ลูก ต้องทำยังไง',/6 เดือน/,/15%/,/6,000 บาท/],['กู้ภัยพิบัติมีขั้นตอนยื่นอย่างไร',/180 วัน/]]){const r=app.answer(q);assert.equal(r.decision,'PROCEDURE_INFORMATION');for(const p of checks)assert.match(r.answer,p);assert.ok(r.sources.some(s=>s.url.includes('drive.google.com')));pass++;}
 for(const q of ['เงินกู้มีกี่แบบ','เรื่องเงินกู้','อยากกู้เงินแต่ไม่รู้ต้องเลือกแบบไหน']){const r=app.answer(q);assert.equal(r.requiredFact,'loanProduct');for(const [choice]of completeLoanChoices)assert.ok(r.followups.includes(choice),q+': missing '+choice);pass++;}
 for(const [choice,p]of completeLoanChoices){let t=app.conversationTurn('เงินกู้มีกี่แบบ');t=app.conversationTurn(choice,t.state,{continuation:true});assert.match(t.result.answer,p);pass++;}
 let t=app.conversationTurn('กู้เพื่อการศึกษา');for(const [q,p]of [['ผ่อนได้กี่งวด',/60 งวด/],['ใช้เอกสารอะไร',/สถานศึกษา/],['ดอกเบี้ยเท่าไร',/ต่อปี/]]){t=app.conversationTurn(q,t.state,{continuation:true});assert.match(t.result.answer,p);pass++;}
 t=app.conversationTurn('คลอดบุตรได้สวัสดิการเท่าไร',t.state,{continuation:true});assert.match(t.result.answer,/1,000 บาท/);pass++;
 assert.equal(app.answer('กู้ค่าเล่าเรียน ณ วันที่ 1 กันยายน 2569 วงเงินเท่าไร').decision,'EVIDENCE_LOCK');pass++;
 assert.ok(!app.freshnessStatus('ขอทุนการศึกษาลูก').domains.includes('educationLoan'));pass++;
 console.log('REALISTIC MEMBER JOURNEY:',pass,'PASS / 0 FAIL; failed wording, procedures, seven choices and repeated follow-up verified');
}
