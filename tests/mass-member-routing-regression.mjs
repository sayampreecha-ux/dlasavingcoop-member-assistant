import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const app=loadMemberEngine();
// Paraphrased representatives of observed failure patterns; no raw chat records.
const cases=[
 ['เอกสารกู้ถึงหรือยัง เงินจะเข้าวันไหน','status_center',/ระบบสมาชิก|เจ้าหน้าที่/],
 ['ดูลำดับเอกสารจากที่ไหน','status_center',/ระบบสมาชิก|เจ้าหน้าที่/],
 ['จัดส่งเอกสารพรุ่งนี้ จะทันรอบเดือนนี้ไหม','status_center',/ไม่ทราบ|ไม่เดา|ตรวจ/],
 ['ในระบบรอตรวจสอบ นานไหมถึงจะทราบผล','status_center',/ตรวจ/],
 ['เอกสารเพิ่มเติมลงรับหรือยัง','status_center',/ตรวจ/],
 ['งวดที่สิบสองหักแล้วแต่สหกรณ์ยังไม่ตัดชำระ ถือว่าครบไหม','status_center',/ตรวจ/],
 ['กูสามัญต้องใช้เอกสารอะไร',null,/กู้|หลักเกณฑ์|เอกสาร/],
 ['ปิดฉุกเฉินได้ไหม',null,/กู้|ชำระ|ปิด/],
 ['รีฉุกเฉินต้องส่งกี่งวด',null,/งวด|ข้อมูล|หลักเกณฑ์/],
 ['สามัญยื่นใหม่ได้ไหม',null,/กู้|หลักเกณฑ์|ข้อมูล/],
 ['ประกันของเงินกู้มีเอกสารให้อ่านที่ไหน',null,/ประกัน/],
 ['ขอแบบฟอร์มประกัน',null,/ประกัน/],
 ['การค้ำประกันนับแบบบุคคลหรือนับสัญญาค้ำ','guarantor_center',/ผู้ค้ำ|ค้ำ/],
 ['ขอบัญชีชำระค่าหุ้น',null,/หุ้น|ชำระ/],
 ['ขอเอกสารส่งไปรษณีย์ต้องเขียนหน้าซองอย่างไร','document_need_topic',/เรื่องใด/],
 ['ต้องใช้เอกสารตัวไหน ส่งที่ไหน','document_need_topic',/เรื่องใด/],
 ['ใช้เงินฝากค้ำเงินกู้แล้ว ซื้อหุ้นเพิ่มจะถอนเงินฝากได้ไหม','deposit_collateral_release',/หลักประกัน|สัญญา/],
 ['ต้องการปลดเงินฝากที่เป็นหลักประกัน','deposit_collateral_release',/ตรวจ/],
 ['ออมทรัพย์พิเศษค้ำอยู่ เปลี่ยนหลักประกันแล้วถอนได้เลยไหม','deposit_collateral_release',/ยังไม่ยืนยัน|ไม่ได้ยืนยัน/],
 ['กู้ไม่ผ่าน เงินฝากที่ใช้ประกอบคำขอถอนออกได้ไหม','deposit_collateral_release',/หลักประกัน/],
 ['สมาชิกไม่สะดวกรับสาย เป็นเหตุผลไม่อนุมัติกู้หรือไม่','personal_handoff',/เหตุผล|คำชี้แจง/],
 ['อีกกี่วันได้เงิน','live_schedule',/รายการจริง|ระบบสมาชิก/],
 ['โอนก่อนบ่ายสามโมงไหม','live_schedule',/เวลา|รอบ/],
 ['สหกรณ์เปิดทำการวันนี้ไหม','service_availability',/ยังไม่ยืนยัน/],
 ['เว็บไซต์สหกรณ์เข้าได้ปกติไหม','service_availability',/เหตุขัดข้อง|ช่องทางติดต่อ/],
 ['เว็บล่มไหม','service_availability',/เหตุขัดข้อง|ช่องทางติดต่อ/],
 ['ขออีเมลสหกรณ์','official_contact_request',/ไม่เดา|ติดต่อทางการ/],
 ['มีอีเมล์สหกรณ์ไหม','official_contact_request',/ติดต่อทางการ/],
 ['ตรวจบูโรไหม','credit_rule_clarification',/ประเภทเงินกู้/],
 ['วงเงินห้าแสนต้องแนบบูโรไหม','credit_rule_clarification',/ยังไม่ยืนยัน/],
 ['มีโครงการพักหนี้ไหม','member_case_review',/ยังไม่ยืนยัน/],
 ['หนี้ประณีประนอมขอปิดได้ไหม','member_case_review',/เจ้าหน้าที่/],
 ['ถอนด้วยตนเองได้ไหม','withdrawal_need_asset',/เงินฝากหรือคืนค่าหุ้น/],
 ['กู้ ฉฉ ต้องส่งกี่งวด',null,/งวด|ฉุกเฉิน/],
 ['กู้พัฒนาชีวิตต้องใช้หลักประกันอะไร',null,/หลักประกัน|ประเมิน|คุณภาพชีวิต/],
 ['ขอกู้รีไฟแนนบ้านใช้แบบอะไร',null,/ไถ่ถอน|จำนอง/],
 ['ทุนเรือนหุ่นเพิ่มได้ไหม',null,/หุ้น/],
 ['อีกกี่วันได้ เงิน','live_schedule',/รายการจริง|ระบบสมาชิก/],
 ['จะทันรอบนี้ไหม','status_center',/ตรวจระบบสมาชิก|ไม่ทราบ/],
 ['ได้รอบนี้ไหม','status_center',/ตรวจระบบสมาชิก|ไม่ทราบ/],
 ['เข้าดูผลการยื่นกู้ยังไง','status_center',/ระบบสมาชิก/],
 ['ยื่นกู้เหตุพิเศษอยู่ในช่วงพิจารณา ทราบผลวันไหน','status_center',/ไม่ทราบ|รายการ/],
 ['สหกรณ์หยุดวันพรุ่งนี้ไหม','service_availability',/ยังไม่ยืนยัน|ประกาศ/],
 ['ขอปรึกษางานกู้ทางไลน์ส่วนตัวได้ไหม','official_contact_request',/ช่องทางส่วนตัว|ติดต่อทางการ/],
 ['พยานในคำขอต้องเป็นสมาชิกไหม','document_execution_review',/ยังไม่ยืนยัน|ต้นฉบับ/],
 ['ทำหนังสือชี้แจงถึงใคร','document_execution_review',/ผู้รับหนังสือ|แบบ/],
 ['เป็นสมาชิกสหกรณ์อื่นไม่มีหนี้ สมัครสหกรณ์นี้ได้ไหม','membership_other_cooperative_review',/ยังไม่เพียงพอ|ข้อบังคับ/],
 ['กู้เฟส 2 ใช้แบบเดียวกับเฟส 1 ไหม','loan_phase_review',/ยังไม่ยืนยัน|ประกาศ/],
 ['กู้เฟส 1 ไม่เต็มวงเงิน ขอเพิ่มเฟส 2 ได้ไหม','loan_phase_review',/ยังไม่ยืนยัน|เงื่อนไข/],
 ['กู้สามัญเฟส 2 ใช้แบบอะไร','loan_phase_review',/ยังไม่ยืนยัน|แบบ/],
 ['ชำระหนี้ด้วยตนเองได้ไหม',null,/ชำระ|เงินกู้/],
 ['หนี้เสียสหกรณ์แก้ยังไง','debt_help',/สถานะจริง|โครงสร้างหนี้/],
 ['เป็นสมาชิกสหกรณ์ออมทรัพย์อื่น ไม่มีหนี้ สมัครที่นี่ได้ หรือ ไม่','membership_other_cooperative_review',/ยังไม่เพียงพอ|ข้อบังคับ/],
 ['เป็นสมาชิกสหกรณ์ออมทรัพย์ อื่น สมัครเพิ่มได้ไหม','membership_other_cooperative_review',/ฝ่ายทะเบียน/],
 ['ชำระงวดครบกำหนดวันที่ 5 ตรงวันอาทิตย์ เลื่อนได้ไหม','payment_deadline_review',/ยังไม่ยืนยัน|ก่อนครบกำหนด/],
 ['กำหนดจ่ายตรงวันหยุดต้องจ่ายวันไหน','payment_deadline_review',/ช่องทาง|ข้อกำหนด/],
 ['ที่อยู่ส่งถึงสหกรณ์นี้ถูกต้องหรือไม่','official_delivery_contact',/ยืนยันที่อยู่|ประเภทใด/],
 ['ผลประชุมล่าสุดดูจากที่ไหน','current_notice_review',/ประกาศปัจจุบัน|ผลมติ/],
 ['เลือกตั้งมีผู้สมัครประธานกี่คน','current_notice_review',/ยังไม่ยืนยันรายชื่อ/],
 ['เงินรางวัลเข้าวันไหน','current_notice_review',/กำหนดจ่าย|รายการเฉพาะราย/],
 ['กรมธรรม์อ่านได้ที่ไหน',null,/ประกัน/],
 ['ได้รับเงินกู้วันไหน','live_schedule',/ไม่ทราบเวลา|รายการจริง/],
 ['เงินที่นำส่งเกิน จะโอนคืนวันไหน','live_schedule',/ระบบสมาชิก|รอบโอน/],
 ['ยื่นกู้ไป จะทราบตอนไหนว่าผ่าน','status_center',/ไม่ทราบ|คำถามนี้ต้องตรวจ/],
 ['ฝากไปแล้วแต่ยังไม่เห็นปรับยอด ติดต่อไม่ได้','member_ledger_review',/ยอดฝาก|ลงบัญชี|หลักฐาน/],
 ['อยากทราบยอดหนี้คงเหลือของสมาชิก','member_balance_lookup',/ข้อมูลของตนเอง|ข้อมูลของผู้อื่น/],
 ['อยากทราบผลการประชุมโครงการช่วยเหลือสมาชิก','current_notice_review',/ผลมติ|ประกาศปัจจุบัน/],
 ['ได้รางวัลเสื้อ ต้องแจ้งขนาดอย่างไร','current_notice_review',/ยังไม่ยืนยัน|เจ้าหน้าที่/],
 ['สอบถามค่ะ กู้สัญญาเดิม คือวงเงินเดิมเหรอ','loan_product_clarification',/ประเภท|ยังใช้ยืนยันสิทธิ/],
 ['หนังสือสัญญาเงินกู้กรอกจำนวนเงินเองไหม','document_execution_review',/ยังไม่ยืนยันว่าช่องใด|ต้นฉบับปัจจุบัน/],
 ['เลขสมาชิกฌาปนกิจดูได้ที่ไหน','member_identifier_lookup',/สมาคม|ของตนเอง/],
 ['รหัสสมาชิกได้มาจากไหน','member_identifier_lookup',/ข้อมูลของผู้อื่น|ไม่ตรวจเลข/],
 ['กู้ตัวนี้ติดต่อเบอร์โทรอะไร','official_work_contact',/ฝ่ายเงินกู้|ไม่เดาเบอร์/],
 ['ผมยังไม่เป็นสมาชิก สมัครอย่างไร',null,/สมัคร|สมาชิก/],
 ['เฟสแรกกู้ไม่เต็ม ขอเฟสสองได้ไหม','loan_phase_review',/ยังไม่ยืนยัน/],
 ['ส่งเงินกู้ไม่เกินวันที่5 ติดเสาร์อาทิตต้องส่งก่อนไหม','payment_deadline_review',/ก่อนครบกำหนด|ข้อกำหนด/],
 ['คือต้องมีเงินคงเหลือหลังหักหนี้6000ใช่มั้ย','loan_product_clarification',/ประเภท|ยังใช้ยืนยันสิทธิ/],
 ['สั่งจ่ายในนามเจ้าหนี้ ต้องชำระก่อนใช่มั้ย','disbursement_method_review',/ยังไม่ยืนยัน|ชำระล่วงหน้า/],
 ['โครงการใหม่ตรวจเครดิตไหม','credit_rule_clarification',/ประเภทเงินกู้|ยังไม่ยืนยัน/],
 ['มีโครงการสำหรับสมาชิกสองปีไหม','member_policy_notice_review',/ยังไม่ยืนยัน|ชื่อโครงการ/],
 ['ขยายอายุสมาชิกได้มั้ย','member_policy_notice_review',/ยังไม่ยืนยัน|เปลี่ยนเงื่อนไข/],
 ['สหกรณ์ให้ค่าเดินทาง เบี้ยเลี้ยงมั้ย','member_expense_review',/บทบาท|ยังไม่ยืนยัน/],
 ['สหกรณ์แจ้งวันที่15ตรงเสาร์อาทิตย์ ต้องเลื่อนมาก่อนไหม','deadline_need_topic',/กำหนดยื่นเอกสาร|ยังไม่ยืนยัน/],
 ['ปิดฉฉ.ได้ไหม',null,/ฉุกเฉิน|เงินกู้|ชำระ/],
 ['งวดที่12ครบเดือนหน้า ยื่นเดือนหน้าได้มั้ย','loan_product_clarification',/ประเภท|งวด/],
 ['ขอถามอัตราดอกเบี้ยที่ต้องกรอกในสัญญา','loan_product_clarification',/ประเภท|หลักเกณฑ์/],
 ['สหกรณ์ทำไมไม่เลื่อนวันทำการเมื่อวันเดิมตรงเสาร์อาทิตย์','deadline_need_topic',/ยังไม่ยืนยัน|ยื่นเอกสาร/],
 ['สำเนาบัตรประชาชนที่ยื่นกู้ จำเป็นต้องถ่ายด้านหลังไหม','loan_supporting_document_review',/ยังไม่ยืนยัน|รายการแนบ/],
 ['บัตรข้าราชการยังไม่หมดอายุแต่หน่วยงานเปลี่ยนชื่อ ต้องเปลี่ยนบัตรก่อนยื่นกู้ไหม','loan_supporting_document_review',/แบบคำขอปัจจุบัน|ต้องเปลี่ยนบัตร/],
 ['ยื่นกู้ต้องมีหนังสือรับรองหนี้ด้วยไหม','loan_supporting_document_review',/หนังสือรับรอง|ฝ่ายเงินกู้/],
 ['สหกรณ์ให้ปิดหนี้รถ ต้องขอยอดปิดทั้งหมดกับบริษัทอย่างไร','external_creditor_payoff',/เจ้าหนี้ที่ระบุในสัญญา|ไม่ทราบยอดปิด/],
 ['หมายเลข สมาชิกณาปกิจ สามารถดูที่ไหน','member_identifier_lookup',/สมาคม|ของตนเอง/],
 ['มีหนี้ธนาคารกับรถ แต่จะปิดแค่รถได้ไหม','debt_payoff_scope_review',/ปิดหนี้บางรายการ|ยังไม่ยืนยัน/],
 ['สหกรณ์มีสินเชื่อเพื่อซื้อรถไหม','loan_purpose_review',/สินเชื่อซื้อรถ|ยังไม่ยืนยัน/],
 ['สหกรณ์มีให้ทำเช่าซื้อไหม','loan_purpose_review',/เช่าซื้อ|ยังไม่ยืนยัน/],
 ['ธนาคารมีสิทธิอายัดเงินส่วนไหนของสมาชิก','attachment_order_review',/ฐานอำนาจ|ยังไม่ยืนยัน/],
 ['ตีเช็คเป็นชื่อสมาชิกหรือว่าธนาคาร','disbursement_method_review',/สั่งจ่าย|ยังไม่ยืนยัน/],
 ['เช็คที่สหกรณ์จะส่งมา ได้จัดส่งมาละยัง','status_center',/ตรวจรายการ|ไม่ทราบ/],
 ['หน่วยงานต้องหักชำระหนี้สหกรณ์ทั้งหมดก่อนหรือไม่','remittance_order_review',/ลำดับการหัก|ยังไม่ยืนยัน/],
 ['จะครบ12เดือนติดต่อกัน กู้ได้ไหมช่วยชี้แนะ', null,/ประเภท/],
 ['ต้องส่งครบ12งวด หรือว่าไม่ต้องส่งถึง12งวดก็กู้เพิ่ม',null,/ประเภท/],
 ['ฝากเงินซื้อหุ้นให้ครบ แล้วกู้หลังจากนี้6เดือนได้มั่ย',null,/ประเภท/],
 ['เชิญเพื่อนสมาชิกเข้ากลุ่มได้ไหม','group_channel_review',/ผู้ดูแล|ยังไม่ยืนยัน/],
 ['ขออนุญาตแชร์ให้สมาชิกด้วยกันได้ไหม','group_channel_review',/ข้อมูลใด|ยังไม่ยืนยัน/],
 ['สถานการณ์น้ำที่สหกรณ์ลดลงไหม','facility_condition_review',/ระดับน้ำ|ยังไม่ยืนยัน/],
 ['ทางสหกรณ์ออกใบให้วันไหน','document_issue_review',/ประเภทใด|ไม่ทราบ/],
 ['สหกรณ์ที่ไหนคะ','cooperative_identity_review',/สหกรณ์ออมทรัพย์องค์กรปกครองส่วนท้องถิ่น/],
 ['เข้าดูเวปสหกรณ์หรือค่ะ ไม่เคยดู','official_website_access',/เว็บไซต์สหกรณ์|ระบบสมาชิก/],
 ['ต้องขอหนังสือว่าไม่ได้เป็นสมาชิกสหกรณ์อื่นไหม','membership_certificate_review',/หนังสือรับรอง|ยังไม่ยืนยัน/],
 ['สมาชิกบัญชีต่างธนาคารได้พร้อมกันไหม','member_record_timing_review',/รอบจ่าย|ไม่เห็นข้อมูล/],
 ['เฟส2ขอเลื่อนพิจารณาเพราะขาดคุณสมบัติสมาชิกได้ไหม','loan_phase_review',/เฟส|ยังไม่ยืนยัน/],
 ['แบบสมาชิกนี้ทำถูกไหม','document_execution_review',/ตรวจความถูกต้อง|ยังไม่ยืนยัน/],
 ['ไม่ได้ใช้หลักเกณนี้หรอ','member_policy_notice_review',/ชื่อเรื่อง|ยังไม่ยืนยัน/],
 ['สมาชิกแสดงความเห็นกับสหกรณ์ได้ยังไง','member_policy_notice_review',/คำชี้แจง|ส่งข้อเสนอ/]
];
for(const [q,intent,meaning] of cases){
 const r=app.answer(q), text=[r.answer,...r.details||[]].join(' ');
 assert.ok(r.answer?.trim(),q+' returned empty');
 assert.notEqual(r.intent,'fallback',q+' returned generic fallback');
 if(intent)assert.equal(r.intent,intent,q);
 assert.match(text,meaning,q+' missed the concern');
 assert.ok(r.actions?.length,q+' has no next action');
 assert.ok(r.sources?.length,q+' has no source');
 assert.doesNotMatch(text,/ได้รับอนุมัติแล้ว|ผ่านแน่นอน|เงินจะเข้าแน่นอน|อนุมัติแน่นอน|กู้ผ่านแน่นอน/);
 if(intent==='deposit_collateral_release'){
   assert.equal(r.decision,'EVIDENCE_LOCK');
   assert.doesNotMatch(text,/เกินกว่า 3 คน|ถอน(?:เงินฝาก)?ได้ทันที/);
 }
}
// Document usefulness requires the actual product form, not only a rule or a category link.
for(const [q,decision,url] of [
 ['ฝากผ่านแอปในวันอาทิตย์ได้ไหม','EVIDENCE_LOCK','https://www.dlasavingcoop.com/show.php?Category=contact'],
 ['งบการเงินปีนี้ดูช่องทางไหน','NEED_INFO','https://www.dlasavingcoop.com/'],
 ['ส่งเอกสารกู้ไปได้รับยัง','LIVE_STATUS_REQUIRED','https://member.dlasavingcoop.com/coop/']
]){
 const r=app.answer(q);assert.equal(r.decision,decision);assert.ok(r.actions.some(a=>a[1]===url));
}
assert.ok(app.answer('ขอกู้รีไฟแนนบ้านใช้แบบอะไร').actions.some(a=>a[1]==='https://drive.google.com/file/d/1E-VSAXKzmiQYO_tLF0AfBwptqu944Ojh/view?usp=sharing'));
for(const q of ['พยานในคำขอต้องเป็นสมาชิกไหม','เป็นสมาชิกสหกรณ์อื่นไม่มีหนี้ สมัครสหกรณ์นี้ได้ไหม','กู้สามัญเฟส 2 ใช้แบบอะไร'])assert.equal(app.answer(q).decision,'EVIDENCE_LOCK');
for(const q of ['เป็นสมาชิกสหกรณ์ออมทรัพย์อื่น ไม่มีหนี้ สมัครที่นี่ได้ หรือ ไม่','กำหนดจ่ายตรงวันหยุดต้องจ่ายวันไหน'])assert.equal(app.answer(q).decision,'EVIDENCE_LOCK');
assert.ok(app.answer('ที่อยู่ส่งถึงสหกรณ์นี้ถูกต้องหรือไม่').actions.some(a=>a[1]==='https://www.dlasavingcoop.com/show.php?Category=contact'));
// Choosing a product must preserve eligibility rather than merely list a loan.
const intake=app.conversationTurn('เป็นสมาชิกหกเดือน กู้อะไรได้บ้าง');
assert.equal(intake.result.requiredFact,'loanProduct');
const continued=app.conversationTurn('กู้ฉุกเฉิน',intake.state);
assert.match(continued.query,/สมาชิกหกเดือน/);
assert.equal(continued.result.intent,'loan_emergency_eligibility');
assert.equal(continued.result.decision,'NEED_MEMBER_DATA');
assert.ok(continued.result.actions.some(a=>a[1]==='https://member.dlasavingcoop.com/coop/'));
for(const q of ['หนังสือสัญญาเงินกู้กรอกจำนวนเงินเองไหม','สั่งจ่ายในนามเจ้าหนี้ ต้องชำระก่อนใช่มั้ย','มีโครงการสำหรับสมาชิกสองปีไหม','สหกรณ์ให้ค่าเดินทาง เบี้ยเลี้ยงมั้ย'])assert.equal(app.answer(q).decision,'EVIDENCE_LOCK');
for(const q of ['ได้รับเงินกู้วันไหน','อยากทราบยอดหนี้คงเหลือของสมาชิก','เงินที่นำส่งเกิน จะโอนคืนวันไหน'])assert.ok(app.answer(q).actions.some(a=>a[1]==='https://member.dlasavingcoop.com/coop/'));
// The established and recovery paths must both ask for the product, never a contact/address/time.
for(const q of ['จะครบ12เดือนติดต่อกัน กู้ได้ไหมช่วยชี้แนะ','ต้องส่งครบ12งวด หรือว่าไม่ต้องส่งถึง12งวดก็กู้เพิ่ม','ฝากเงินซื้อหุ้นให้ครบ แล้วกู้หลังจากนี้6เดือนได้มั่ย']){
 const r=app.answer(q);assert.equal(r.decision,'NEED_INFO');assert.equal(r.requiredFact,'loanProduct');
 assert.ok(r.actions.some(a=>['https://www.dlasavingcoop.com/show.php?Category=procedure','https://drive.google.com/file/d/1QQo5gux4sB3xdcbFvxYBeV-D30gOkXnV/view?usp=sharing'].includes(a[1])));
 assert.ok(!['official_work_contact','official_delivery_contact','live_schedule'].includes(r.intent));
}
// Adjacent concerns must retain their existing domain rather than inherit a status route.
const unassessed=app.answer('กู้ฉุกเฉินอยู่และมีหนี้สามัญ จะกู้เพิ่มได้ไหม');
assert.equal(unassessed.decision,'NEED_INFO');
assert.doesNotMatch(unassessed.answer,/เงื่อนไขที่ตรวจได้ผ่าน|ผ่านเงื่อนไข/);
const unspecified=app.answer('กู้เงินอายุ40ผ่อน120งวดได้มั่ย');
assert.equal(unspecified.decision,'NEED_INFO');assert.equal(unspecified.requiredFact,'loanProduct');
const housing=app.answer('กู้บ้านอายุ40ผ่อน120งวดได้มั่ย');
assert.notEqual(housing.intent,'loan_compound_reasoning');
assert.notEqual(housing.decision,'ELIGIBLE_CONDITION');
assert.equal(app.answer('สวัสดิการมีกี่แบบ').intent,'welfare_all');
assert.notEqual(app.answer('กู้สามัญต้องมีผู้ค้ำกี่คน').intent,'deposit_collateral_release');
console.log(JSON.stringify({ok:true,representativeCases:cases.length,adjacentChecks:2,rawCorpusPublished:false}));
