// Synthetic public-only acceptance cases. Source: real_member_qa_synthetic_safe_cases_20261018.json.
// Expected intents are diagnostic, not grounds to bypass an evidence or privacy lock.
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const cases=[["SYN-001","เงินกู้สามัญมีเงื่อนไขอะไรบ้าง","loan_ordinary"],["SYN-002","ต้องการกู้สามัญต้องเตรียมเอกสารอะไร","loan_ordinary"],["SYN-003","ขอกู้ฉุกเฉินต้องทำอย่างไร","loan_emergency"],["SYN-004","เงินกู้ฉุกเฉินใช้แบบฟอร์มใด","loan_emergency"],["SYN-005","กู้เพื่อการศึกษาใช้เอกสารอะไร","loan_education"],["SYN-006","ขอกู้กรณีได้รับผลกระทบจากภัยพิบัติ","loan_disaster"],["SYN-007","กู้ไม่เกินทุนเรือนหุ้นมีหลักเกณฑ์อย่างไร","loan_share_secured"],["SYN-008","ขอเปลี่ยนผู้ค้ำประกันเงินกู้สามัญ","loan_change_guarantor"],["SYN-009","ผู้ค้ำประกันมีเงื่อนไขอะไร","guarantor_center"],["SYN-010","ต้องการเปลี่ยนอัตราส่งหุ้นรายเดือน","share_change_rate"],["SYN-011","ขอคืนทุนเรือนหุ้นได้หรือไม่","share_refund"],["SYN-012","ต้องการเปิดบัญชีเงินฝาก","deposit_open"],["SYN-013","ถอนเงินฝากต้องทำอย่างไร","deposit_withdraw"],["SYN-014","ปันผลกับเงินเฉลี่ยคืนต่างกันอย่างไร","dividend_knowledge"],["SYN-015","ลาออกจากการเป็นสมาชิกต้องทำอย่างไร","resignation"],["SYN-016","สมัครสมาชิกใหม่ต้องใช้เอกสารอะไร","member_apply"],["SYN-017","มีสวัสดิการสำหรับสมาชิกอะไรบ้าง","welfare_all"],["SYN-018","สมัครฌาปนกิจสงเคราะห์ทำอย่างไร","funeral"],["SYN-019","ชำระเงินกู้มีช่องทางใดบ้าง","payment"],["SYN-020","ต้องการปิดยอดเงินกู้ทำอย่างไร","loan_close"],["SYN-021","ขอแบบฟอร์มเอกสารของสหกรณ์","forms"],["SYN-022","ติดต่อเจ้าหน้าที่สหกรณ์อย่างไร","contact"]];
const app=loadMemberEngine();let failed=0;
for(const [id,question,expectedIntent] of cases){
 const r=app.answer(question),actualIntent=r?.intent||null,decision=r?.decision||null;
 const locked=actualIntent==='freshness_evidence_lock'&&decision==='EVIDENCE_LOCK'&&!!r?.evidenceState&&Array.isArray(r?.sources)&&r.sources.length>0;
 const specialized=(id==='SYN-004'&&actualIntent==='loan_form_navigation'&&decision==='SOURCE_GUIDED'&&/แบบคำขอกู้ฉุกเฉิน/.test(r.answer||'')&&(r.actions||[]).some(a=>/drive.google.com/.test(a[1]||'')))||(id==='SYN-006'&&actualIntent==='loan_disaster_eligibility'&&r.evidenceState==='PRIMARY_VERIFIED_CURRENT'&&decision==='NEED_RULE_EXTRACTION'&&/ยังไม่ยืนยันว่าได้หรือไม่ได้/.test(r.answer||'')&&(r.sources||[]).some(x=>/drive.google.com/.test(x.url||'')))||(id==='SYN-020'&&actualIntent==='member_balance_lookup'&&r.privacy===true&&decision==='LIVE_MEMBER_DATA_REQUIRED');
 const ok=!!r?.answer&&Array.isArray(r.sources)&&r.sources.length>0&&(actualIntent===expectedIntent||locked||specialized);
 if(!ok)failed++;
 console.log(JSON.stringify({id,question,expectedIntent,actualIntent,decision,evidenceState:r?.evidenceState||null,ruleVersion:r?.ruleVersion||null,sources:r?.sources||[],answer:r?.answer||null,result:ok?'PASS':'FAIL',reason:locked?'SAFE_EVIDENCE_LOCK_REQUIRES_PRIMARY_REVIEW':specialized?'VALID_SPECIALIZED_ROUTE':actualIntent===expectedIntent?'EXPECTED_ROUTE':'UNEXPECTED_ROUTE'},null,0));
}
console.log('SYNTHETIC_22_ACCEPTANCE',JSON.stringify({total:cases.length,passed:cases.length-failed,failed}));
if(failed)process.exitCode=1;

// Negative routing regressions: insurance remains insurance, guarantor remains guarantor.
for(const [question,expected] of [
 ['ขอเปลี่ยนผู้ค้ำประกันเงินกู้สามัญ','loan_change_guarantor'],
 ['ต้องการเปลี่ยนผู้ค้ำประกัน','loan_change_guarantor'],
 ['สอบถามประกันชีวิตเงินกู้','insurance'],
 ['ประกันอัคคีภัยของบ้าน','insurance']
]){
 const result=app.answer(question);if(result.intent!==expected){failed++;console.error('NEGATIVE_ROUTING_FAIL',JSON.stringify({question,expected,actual:result.intent}));}
}
if(failed)process.exitCode=1;
