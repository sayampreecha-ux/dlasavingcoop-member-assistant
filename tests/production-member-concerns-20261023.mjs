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
const closeoutRoutes=[
 ['โอนเงินซื้อหุ้นเพิ่มแล้วต้องทำอะไรต่อ','additional_share_post_payment',/ขั้นตอนหลังชำระ/],
 ['ซื้อหุ้นเพิ่มแจ้งกลุ่มไหน','additional_share_submission_channel',/ไม่ถือว่าห้องแชตนี้รับคำขอ/],
 ['กู้คุณภาพชีวิตเฟสสองส่งกี่งวดถึงกู้สามัญ','quality_phase_to_ordinary_interval',/เฟสที่ระบุ/],
 ['เรียนเพิ่งจบกู้การศึกษาได้ไหม','education_after_graduation',/ไม่เพียงพอยืนยันสิทธิย้อนหลัง/],
 ['ผ่อนบ้านชื่อสามี ยื่นกู้พิเศษได้ไหม','housing_spouse_title_review',/ชื่อคู่สมรส/],
 ['ปันผลปีนี้เดือนไหน','dividend_period_or_schedule',/ยังไม่ยืนยันวันจ่าย/],
 ['ปันผลรวมช่วง 9 เดือนกับ 15 เดือนไหม','dividend_period_or_schedule',/9\/15 เดือน/],
 ['โหลดคำขอซื้อหุ้นเพิ่มได้ที่ไหน','additional_share_purchase_form',/ไม่ใช้แบบเปลี่ยนค่าหุ้นรายเดือน/],
 ['เพิ่มหุ้นรายเดือนหักจากรายได้ใช่ไหม','monthly_share_payroll_deduction',/รายการหัก/],
 ['ลาออกแล้วหุ้นยังไม่ได้รับคืน','post_resignation_refund_review',/ไม่ต้องยื่นลาออกใหม่/],
 ['ลาออกแล้วยังมีรายชื่อให้หักเงินเดือนนี้','post_resignation_refund_review',/ยอดรอคืน/],
 ['ยื่นลาออกใช้เวลากี่วัน','resignation_processing_time',/ระยะโอนคืนหุ้น/],
 ['ไม่เคยเป็นสมาชิก เกษียณแล้วสมัครได้ไหม','retired_membership_application',/แบบสมัครอย่างเดียวไม่ยืนยัน/],
 ['ย้ายหน่วยงาน แจ้งหักเงินในนี้ได้ไหม','employer_transfer_service',/ไม่ถือว่าห้องแชตนี้รับแจ้ง/],
 ['ย้ายจากเทศบาลไปอบต สมัครสมาชิกอีกได้ไหม','employer_transfer_service',/ไม่ยืนยันสิทธิสมัครซ้ำ/],
 ['ยังไม่เป็นสมาชิกฌาปนกิจ สมัครพร้อมยื่นกู้ได้ไหม','funeral_and_loan_application',/สมาชิกสมาคมฌาปนกิจเมื่อใด/],
 ['สมาชิกประเภทสมทบรายใหม่บังคับเปิดบัญชีไหม','associate_mandatory_deposit',/ไม่ใช่หลักฐานว่าบังคับ/],
 ['กู้พัฒนาคุณภาพชีวิตสองแสนส่งกี่งวด','quality_scheme_term_intake',/ขอชื่อโครงการ/],
 ['จำนำสิทธิใช้ค้ำประกันใช่ไหม','pledged_rights_vs_guarantee',/คนละรูปแบบ/],
 ['กู้หุ้นค้ำต้องสมัครฌาปนกิจไหม','share_backed_funeral_requirement',/ไม่รับรองว่าสมัครแล้วกู้ผ่าน/],
 ['สงเคราะห์เสียชีวิตอนุมัติจ่ายทุกเดือนไหม','death_welfare_payment_schedule',/ยังยืนยันความถี่/],
 ['ฌาปนกิจเช็คครบกำหนดวันไหน','funeral_payment_due_lookup',/งวดที่เกี่ยวข้อง/],
 ['รายชื่ออนุมัติล่าสุดกี่ราย','public_approval_count_intake',/ไม่เดาจำนวน/],
 ['เอกสารลงรับก่อนสิ้นเดือนใช้เกณฑ์เดิมไหม','submission_transitional_rule',/บทเฉพาะกาล/]
];
for(const [q,intent,pattern]of closeoutRoutes)check('closeout '+intent,()=>{const r=app.answer(q);assert.equal(r.intent,intent);assert.match(text(r),pattern);assert.notEqual(r.decision,'ELIGIBLE_CONDITION');assert.ok(r.sources.length);});
check('bill payment is deposit increase, not opening',()=>{const r=app.answer('โอนเงินฝากเข้าออมทรัพย์พิเศษตรงจ่ายบิลใช่ไหม');assert.equal(r.intent,'deposit_special_add');assert.match(text(r),/7196/);assert.match(text(r),/0000011.*ไม่ใช้แทนบัญชีเดิม/);});
check('numeric cap plus interest keeps both concerns',()=>{const r=app.answer('กู้ฉุกเฉินกู้ได้ 60,000 บาทใช่ไหมดอกเท่าไหร่');assert.equal(r.intent,'emergency_limit_and_interest');assert.match(text(r),/30,000/);assert.match(text(r),/60,000/);assert.match(text(r),/7\.50/);assert.match(text(r),/ไม่ใช่วงเงินอนุมัติ/);});
check('retired guarantor needs complete rules and member record',()=>{
 const r=app.answer('ผู้ค้ำเกษียณแล้ว ยังเป็นผู้ค้ำเงินกู้สามัญได้หรือไม่');
 assert.equal(r.intent,'retired_guarantor_current');assert.equal(r.decision,'EVIDENCE_LOCK');
 assert.match(text(r),/ข้อ 6|คุณสมบัติ/);assert.match(text(r),/ฝ่ายสินเชื่อ/);
 assert.doesNotMatch(r.answer,/^ได้ครับ|ไม่ได้ตัดสิทธิ|ผ่านเงื่อนไข/);
});
check('associate phased project keeps membership class',()=>{
 const r=app.answer('สมาชิกสมทบจะกู้โครงการเฟส 2 ได้หรือไม่');
 assert.equal(r.intent,'associate_project_eligibility');assert.equal(r.decision,'EVIDENCE_LOCK');
 assert.match(r.answer,/สมาชิกสมทบ/);assert.match(r.answer,/ไม่ใช้สิทธิสมาชิกสามัญแทน/);assert.equal(r.requiredFact,'loanProject');
});
check('misspelled ordinary loan cutoff is a round-specific lookup',()=>{
 const r=app.answer('กูสามัญเดือนนี้กำหนดส่งเอกสารวันสุดท้ายวันไหน');
 assert.equal(r.intent,'ordinary_application_cutoff');assert.equal(r.decision,'EVIDENCE_LOCK');
 assert.match(r.answer,/รอบที่ผ่านมาไม่ใช่กำหนดรับรอบถัดไป/);assert.ok(r.actions.some(a=>a[1].includes('Category=loan')));
});
check('refund contact does not guess the currently assigned person',()=>{
 const r=app.answer('เกษียณหมดภาระค้ำ อยากถอนหุ้น ต้องติดต่อฝ่ายไหน');
 assert.equal(r.intent,'share_refund_contact');assert.equal(r.decision,'SAFE_HANDOFF');
 assert.match(r.answer,/ทะเบียนสมาชิกและการเงิน/);assert.match(r.answer,/ไม่ยืนยันชื่อหรือเบอร์/);assert.doesNotMatch(r.answer,/\d{3}-\d{3}-\d{4}/);
});
check('ambiguous mortgage interval offers a usable product clarification',()=>{
 const r=app.answer('จำนองอยู่ต้องกู้สามัญห่างกี่เดือน');
 assert.equal(r.intent,'mortgage_reapplication_interval');assert.equal(r.decision,'NEED_INFO');
 assert.ok(r.followups.includes('กู้ไถ่ถอนจำนอง'));assert.ok(r.followups.includes('กู้สามัญ'));
 for(const reply of r.followups){const first=app.conversationTurn('จำนองอยู่ต้องกู้สามัญห่างกี่เดือน');const next=app.conversationTurn(reply,first.state,{continuation:true});assert.equal(next.result.intent,'mortgage_interval_review');assert.equal(next.result.decision,'EVIDENCE_LOCK');assert.match(next.result.answer,/ระยะห่างจากสัญญาเดิม/);assert.doesNotMatch(next.result.answer,/หมายถึงจะกู้ไถ่ถอน/);}
});
check('welfare postal destination is distinct from electronic document acceptance',()=>{
 const r=app.answer('จะส่งจดหมายสวัสดิการทางไปรษณีย์ ขอที่อยู่จัดส่ง');
 assert.equal(r.intent,'welfare_postal_destination');assert.match(r.answer,/111\/1/);assert.match(r.answer,/12120/);
 assert.match(r.answer,/ยืนยันชื่อผู้รับ/);assert.doesNotMatch(r.answer,/ยังไม่ได้ยืนยันว่ารับไฟล์ PDF/);
 assert.equal(app.answer('ส่งเอกสารสวัสดิการคลอดบุตรเป็น PDF ได้ไหม').decision,'EVIDENCE_LOCK');
});
// A small quality-of-life project is distinct from the real-estate debt consolidation loan.
for(const q of ['กู้พัฒนาคุณภาพชีวิต สองแสน ผู้ค้ำหนึ่งคนค้ำได้กี่คน','กู้พัฒนาคุณภาพชีวิต 200,000 บาท ค้ำได้กี่สัญญา'])check('small quality project keeps evidence scope: '+q,()=>{
 const r=app.answer(q);assert.equal(r.intent,'quality_scheme_guarantee_intake');assert.equal(r.decision,'EVIDENCE_LOCK');
 assert.ok(r.sources.some(s=>s.url==='https://www.dlasavingcoop.com/show.php?No=774'));
 assert.ok(!r.sources.some(s=>s.url.includes('1Ek7aw6J')));
 assert.match(r.answer,/ชื่อโครงการ|เฟส/);assert.match(r.answer,/จำนวนคนที่ผู้ค้ำคนเดียวค้ำได้/);
});
check('small quality term and bounded membership never cite debt-consolidation entitlement',()=>{
 for(const q of ['กู้พัฒนาคุณภาพชีวิตสองแสนผ่อนกี่งวด','เป็นสมาชิกไม่ถึง 3 ปี จะกู้พัฒนาคุณภาพชีวิตได้ไหม']){
  const r=app.answer(q);assert.ok(!r.sources.some(s=>s.url.includes('1Ek7aw6J')));assert.ok(r.sources.some(s=>s.url==='https://www.dlasavingcoop.com/show.php?No=774'));
 }
});
// An evidence-locked handoff must not turn a navigation index into an unrelated share-rate PDF.
for(const [q,intent] of [['กู้ทุนเรือนหุ้นต้องสมัครฌาปนกิจก่อนหรือไม่','share_backed_funeral_requirement'],['อยากดาวน์โหลดคำขอซื้อหุ้นเพิ่มแบบครั้งคราว','additional_share_purchase_form'],['แบบฟอร์มเปลี่ยนหุ้นรายเดือนส่งไลน์ได้ไหม','share_change_submission_channel']])check('locked handoff navigation scope: '+intent,()=>{
 const r=app.answer(q);assert.equal(r.intent,intent);assert.equal(r.decision,'EVIDENCE_LOCK');
 assert.ok(!r.sources.some(s=>s.url.includes('1035C9')));
 assert.ok(r.sources.some(s=>/show\.php\?(?:No=772|Category=procedure)/.test(s.url)&&s.sourceState==='NAVIGATION'));
 assert.ok([...r.actions,...(r.extraActions||[])].some(a=>a[1].includes('Category=contact')));
});
console.log(JSON.stringify({suite:'production-member-concerns-20261023',checks,passed:checks-failures.length,failed:failures.length,failures},null,2));
if(failures.length)process.exitCode=1;
