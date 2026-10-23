// Synthetic, public-only reproductions of audited failure classes. No LINE export or member identifiers.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const html=process.env.QA_HTML?fs.readFileSync(process.env.QA_HTML,'utf8'):undefined;
const app=loadMemberEngine(html);
app.applySourceMonitor(JSON.parse(fs.readFileSync(new URL('../data/official-source-monitor.json',import.meta.url))));
const failures=[];let checks=0;
function check(name,fn){checks++;try{fn();}catch(e){failures.push({name,error:e.message});}}
const text=r=>[r.answer,...(r.details||[])].join(' ');
for(const duration of ['ไม่ถึง 3 ปี','ยังไม่ครบ 3 ปี','น้อยกว่า 36 เดือน','เกิน 3 ปี','มากกว่า 3 ปี','ไม่เกิน 3 ปี'])check('bounded membership: '+duration,()=>{
 const r=app.answer('จะขอกู้พัฒนาคุณภาพชีวิต เป็นสมาชิก'+duration+' มีฉุกเฉินอยู่ แต่ไม่มีกู้สามัญ');
 assert.equal(r.decision,'NEED_INFO');assert.equal(r.domain,'qualityOfLifeCurrent');
 assert.ok(r.facts.membershipDurationBound);assert.equal(r.facts.membershipMonths,undefined);
 assert.doesNotMatch(text(r),/✓.*อายุสมาชิก|อายุสมาชิก[^\n]*\[PASS\]|ผ่านเงื่อนไขที่ตรวจได้/);
});
check('exact member duration keeps existing assessment',()=>{const r=app.answer('เป็นสมาชิก 6 เดือน กู้สามัญได้ไหม');assert.match(text(r),/6 เดือน/);assert.notEqual(r.intent,'membership_duration_bound');});
check('negated existing product is not fabricated in scenario',()=>{
 const r=app.answer('เป็นสมาชิก 2 ปี มีฉุกเฉินอยู่ ไม่มีกู้สามัญ จะกู้พัฒนาคุณภาพชีวิตได้ไหม');
 assert.equal(r.domain,'qualityOfLifeCurrent');assert.doesNotMatch(r.answer,/และ กู้สามัญอยู่/);assert.ok(!r.scenario?.existing?.includes('ordinaryLoanCurrent'));
});
for(const q of ['เปิดบัญชีออมทรัพย์ต้องทำอย่างไร','ถอนเงินฝากต้องใช้เอกสารใด','ดอกเบี้ยเงินฝากปีนี้เท่าไร','มีแบบโอนเงินฝากมาซื้อหุ้นหรือไม่'])check('member deposits avoid association rule: '+q,()=>{
 const r=app.answer(q);assert.doesNotMatch(text(r),/พบเอกสารทางการที่อาจเปลี่ยนเงื่อนไข/);
 assert.ok(!(r.sources||[]).some(s=>/รับฝากเงินจากสมาคมฌาปนกิจ/.test(s.title)));
});
check('association deposit itself stays locked',()=>{assert.equal(app.freshnessStatus('เงินฝากจากสมาคมฌาปนกิจ').allowed,false);});
check('new member-account evidence still locks',()=>{
 const other=loadMemberEngine(html),snapshot=other.getSourceRegistry();
 snapshot.documents.push({id:'member-deposit-new-pending',title:'ระเบียบรับฝากเงินจากสมาชิก แก้ไขใหม่',type:'REGULATION',originalUrl:'https://www.dlasavingcoop.com/show.php?No=99999',officialIndexUrl:'https://www.dlasavingcoop.com/show.php?Category=procedure',linkVerified:true,status:'PENDING',mayAffectRules:true,affects:['deposits'],pendingReason:'NEW_OFFICIAL_DOCUMENT'});
 other.applySourceMonitor(snapshot);assert.equal(other.freshnessStatus('ออมทรัพย์พิเศษ เปิดบัญชี').allowed,false);
});
const routes=[
 ['จะลาออกแต่ยังค้ำประกันให้ผู้อื่นอยู่','resignation_guarantee_review',/ลาออก/],
 ['ฉุกเฉินอยากชำระเพิ่มจากที่หน่วยงานหัก ต้องทำอย่างไร','payment_extra',/ชำระ/],
 ['กู้เพื่อไถ่ถอนขอเพิ่มวงเงินได้ไหม','redeem_additional_loan_review',/ไถ่ถอน/],
 ['ค่ารายปีคู่สมรสหักจากปันผลหรือไม่','funeral_annual_fee_deduction',/ค่ารายปี/],
 ['สมัครฌาปนกิจให้คู่สมรสได้หรือไม่','funeral_spouse_membership',/สมาคม/],
 ['ส่งเอกสารสวัสดิการคลอดบุตรเป็น PDF ได้ไหม','welfare_document_channel',/PDF/],
 ['ส่งคำขอเปลี่ยนค่าหุ้นรายเดือนทางไลน์ได้หรือไม่','share_change_submission_channel',/คนละแบบ/],
 ['ปิดหนี้ฉุกเฉินแล้ว ต้องรอหน้าฎีการอบใหม่ถึงจะยื่นได้ไหม','post_closure_reapplication',/ยื่น/],
 ['เอกสารปิดสินเชื่อธนาคารต้องใช้หนังสือรับรองยอดหนี้ไหม','external_debt_certificate',/ธนาคารเจ้าหนี้/],
 ['ปันผลหุ้นกับเฉลี่ยคืนเท่ากับปีที่แล้วไหม','dividend_year_comparison',/แต่ละปี/],
 ['กู้รวมหนี้หลักทรัพย์ไม่พอ ใช้ผู้ค้ำเพิ่มได้ไหม','quality_collateral_shortfall',/ไม่ใช้จำนวนผู้ค้ำของกู้สามัญ/],
 ['กู้พัฒนาคุณภาพชีวิตดูเครดิตบลูโรไหม','quality_credit_requirement',/เครดิตบูโร/],
 ['เอกสารแบบฟอร์มผิดต้องส่งใหม่ทั้งชุดหรือไม่','document_correction_or_cancellation',/หน่วยรับเอกสาร/]
];
for(const [q,intent,pattern]of routes)check(intent,()=>{const r=app.answer(q);assert.equal(r.intent,intent);assert.match(text(r),pattern);assert.ok(r.sources.length);assert.notEqual(r.decision,'ELIGIBLE_CONDITION');});
check('installment follow-up keeps original amount and asks term',()=>{
 const first=app.conversationTurn('ขอกู้เงิน 100,000 บาท ต้องผ่อนเดือนเท่าไหร่',{});
 const next=app.conversationTurn('กู้สามัญ',first.state,{continuation:true});
 assert.equal(next.result.intent,'installment_term_intake');assert.equal(next.result.facts.requestAmount,100000);assert.equal(next.result.requiredFact,'installmentTerm');
 const third=app.conversationTurn('60 งวด',next.state,{continuation:true});assert.match(text(third.result),/100,000/);assert.match(text(third.result),/60 งวด/);assert.doesNotMatch(text(third.result),/อนุมัติแล้ว|ผ่านแน่นอน/);
});
check('PDF follow-up stays document channel',()=>{
 const first=app.conversationTurn('ส่งเอกสารคลอดบุตรเป็นไฟล์ PDF ได้ไหม',{});
 const next=app.conversationTurn('สมาชิกสามัญ',first.state,{continuation:true});
 assert.equal(next.result.intent,'welfare_document_channel');assert.match(next.result.answer,/PDF/);assert.equal(next.result.flowId,null);
});
check('opening account follow-up keeps operation',()=>{
 const first=app.conversationTurn('ต้องการเปิดบัญชีออมทรัพย์',{});
 const next=app.conversationTurn('ออมทรัพย์พิเศษ',first.state,{continuation:true});
 assert.equal(next.result.intent,'deposit_open');assert.match(text(next.result),/เปิดบัญชี/);assert.notEqual(next.result.decision,'ELIGIBLE_CONDITION');
});
for(const q of ['ส่ง OTP ให้ช่วยดูยอดเงินฝาก','รหัสผ่านใช้ดูสถานะลาออกติดค้ำได้ไหม'])check('secrets keep privacy route',()=>{const r=app.answer(q);assert.equal(r.privacy,true);assert.doesNotMatch(r.answer,/กรุณาส่ง|ขอรหัสผ่าน/);});
console.log(JSON.stringify({suite:'production-member-concerns-20261023',checks,passed:checks-failures.length,failed:failures.length,failures},null,2));
if(failures.length)process.exitCode=1;
