import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
if(scripts.length!==3) throw new Error(`expected 3 inline scripts, got ${scripts.length}`);
new Function(scripts[0])();
new Function(scripts[1])();
new Function(scripts[2]);

const cases=[
 ['', 'empty'],['ยอดหนี้ของผมเหลือเท่าไร','personal_handoff'],['ติดต่อสวัสดิการ','welfare_contact'],
 ['ติดต่อทะเบียนสมาชิก','registration_contact'],['ติดต่อเจ้าหน้าที่จังหวัด','province_contact'],['ช่องทางติดต่อสหกรณ์','contact'],

 ['หุ้นและทุนเรือนหุ้น','share_all'],['เปลี่ยนอัตราหุ้นรายเดือน','share_change_rate'],['ซื้อหุ้นเพิ่ม','share_purchase'],['ถอนหุ้นได้ไหม','share_refund'],
 ['หนังสือยืนยันยอด 2569','balance_confirmation'],['ติดตามผลและสถานะเอกสาร','status_center'],['ผลอนุมัติเงินกู้','status_center'],
 ['เอกสารไม่ครบ','status_center'],['เลขทะเบียนสมาชิก','status_center'],

 ['เรื่องผู้ค้ำประกัน','guarantor_center'],['เรื่องประกันสหกรณ์','insurance'],['ประกันอัคคีภัย','insurance'],
 ['ปรับโครงสร้างหนี้','debt_help'],['ส่งไม่ไหว','debt_help'],['ผู้รับโอนประโยชน์','beneficiary'],
 ['สมาชิกสมทบ','member_associate'],['คืนสภาพสมาชิก','member_restore'],['เปลี่ยนข้อมูลสมาชิก','member_change_info'],
 ['สมาชิกเกษียณ','retirement'],['ประชุมใหญ่','org_rights'],['ร้องเรียน','org_rights'],['เรื่องสมาชิก','member_center'],

 ['ฌาปนกิจสงเคราะห์','funeral'],['สมัครฌาปนกิจ','funeral'],['ตรวจผลอนุมัติฌาปนกิจ','funeral'],['ชำระเงินฌาปนกิจ','funeral'],
 ['ผู้รับผลประโยชน์ฌาปนกิจ','funeral'],

 ['น้ำท่วมขอสวัสดิการ','welfare_disaster'],['บ้านน้ำท่วม','welfare_disaster'],['ไฟไหม้บ้าน','welfare_disaster'],['พายุทำบ้านเสียหาย','welfare_disaster'],['เพิ่งคลอดลูก ขอแบบอะไร','welfare_childbirth'],['ทุนเรียนลูก','scholarship'],
 ['แต่งงานได้สวัสดิการไหม','welfare_marriage'],['บวชได้สวัสดิการไหม','welfare_religion'],
 ['เรียนจบได้สวัสดิการไหม','welfare_graduation'],['สวัสดิการบำเหน็จสมาชิก','welfare_gratuity'],
 ['สมาชิกเสียชีวิต','welfare_member_death'],['สวัสดิการมีกี่แบบ','welfare_all'],['แม่เสียได้สวัสดิการไหม','welfare_family_death'],

 ['กู้โดยใช้หุ้นตัวเอง','loan_share_secured'],['กู้เพื่อพักผ่อน','loan_vacation'],['ปิดยอดกู้','loan_close'],
 ['เปลี่ยนผู้ค้ำ','loan_change_guarantor'],['กู้ต้องค้ำกี่คน','loan_guarantor_count'],['ค้ำประกันได้กี่คน','guarantor_capacity'],
 ['กู้ได้ไหม','loan_eligibility'],['เงินกู้มีกี่แบบ','loan_all'],['เงินกู้สามัญ','loan_ordinary'],
 ['กู้ฉุกเฉิน','loan_emergency'],['เงินกู้พิเศษ','loan_special'],['กู้เพื่อการศึกษา','loan_education'],['กู้กรณีน้ำท่วม','loan_disaster'],['กู้น้ำท่วม','loan_disaster'],

 ['สมัครสมาชิกใหม่','member_apply'],['สมาชิกย้าย','transfer'],['ลาออกจากสหกรณ์','resignation'],
 ['เปิดบัญชีเงินฝาก','deposit_open'],['วิธีฝากเงิน','deposit_add'],['ถอนเงินฝาก','deposit_withdraw'],['เงินฝาก','deposit'],
 ['ปันผลปี 69','dividend'],['แบบฟอร์มทั้งหมด','forms'],['ข่าวล่าสุด','notices'],
 ['ชำระเงินกู้','payment'],['ส่งค่าหุ้น','payment'],['ใบแจ้งหนี้','payment'],['7025','payment'],['7146','payment'],
 ['นี่คือคำถามที่ไม่มีในระบบ xyzabc','fallback']
];

const workflow=new Set([
 'share_all','share_change_rate','share_purchase','share_refund','balance_confirmation','beneficiary',
 'member_associate','member_restore','member_change_info','debt_help',
 'welfare_childbirth','scholarship','welfare_marriage','welfare_religion','welfare_graduation','welfare_gratuity',
 'welfare_member_death','welfare_all','welfare_family_death','welfare_disaster',
 'loan_share_secured','loan_vacation','loan_close','loan_change_guarantor','loan_guarantor_count','loan_eligibility',
 'loan_all','loan_ordinary','loan_emergency','loan_special','loan_education','loan_disaster',
 'member_apply','transfer','resignation','deposit_open','deposit_add','deposit_withdraw','deposit','funeral','payment'
]);
const needContact=new Set([...workflow,'welfare_contact','registration_contact','province_contact','contact','personal_handoff','dividend','status_center','insurance','retirement']);

const failures=[];
for(const [q,expected] of cases){
  const r=globalThis.COOP_APP.answer(q);
  const checks={
    intent:r.intent===expected,
    process:!workflow.has(expected)||(r.details||[]).some(x=>/ขั้นตอน|1\)/.test(String(x))),
    contact:!needContact.has(expected)||(r.actions||[]).some(x=>/^tel:|#staff-directory/.test(x[1])||/Category=contact/.test(x[1])),
    actionShape:(r.actions||[]).every(x=>Array.isArray(x)&&x.length===2&&/^(https?:|tel:|#)/.test(x[1]))
  };
  if(!Object.values(checks).every(Boolean)) failures.push({q,expected,actual:r.intent,checks});
}

const typos=[
 ['เงินกูมีกี่แบบ','loan_all'],['เงินกุ้','loan_all'],['กุ้ฉุกเฉิน','loan_emergency'],['เงินกูพิเศษ','loan_special'],
 ['สวสดิการ','welfare_all'],['สวัดดิการมีกี่แบบ','welfare_all'],['ติดต่อสวสดิการ','welfare_contact'],
 ['ฌาปณกิจ','funeral'],['ฌาปนกิด','funeral'],['ชาปนกิจ','funeral'],['โอนยาย','transfer'],['ย้ายสังกัด','transfer'],
 ['สมาชิกย้าย','transfer'],['แบบฟอม','forms'],['สมคัรสมาชิก','member_apply'],['ปันผน','dividend'],['เฟสบุค','contact'],
 ['เฟซบุ๊ก','contact'],['ถอนเงนฝาก','deposit_withdraw'],['เงนฝาก','deposit'],['ยืนย้นยอด','balance_confirmation']
];
for(const [q,expected] of typos){
  const actual=globalThis.COOP_APP.answer(q).intent;
  if(actual!==expected) failures.push({q,expected,actual,group:'typo'});
}

for(const q of ['1234567890123','รหัสผ่านของผม','OTP 123456','ยอดหุ้นของผม','ผลอนุมัติของผม','ยอดเงินฝากของฉัน','กู้เพิ่มได้เท่าไรของผม']){
  const r=globalThis.COOP_APP.answer(q);
  if(r.intent!=='personal_handoff'||r.privacy!==true) failures.push({q,actual:r.intent,group:'privacy'});
}

const homeQueries=[...html.matchAll(/data-q="([^"]+)"/g)].map(m=>m[1]);
for(const q of homeQueries){
  const r=globalThis.COOP_APP.answer(q);
  if(r.intent==='fallback'||r.intent==='empty') failures.push({q,actual:r.intent,group:'homepage'});
}

{
  const signup=globalThis.COOP_APP.answer('สมัครฌาปนกิจ');
  if(signup.actions?.[0]?.[1] !== globalThis.COOP_KB.official.funeralApplyHowToImage) failures.push({group:'funeral-signup',actual:signup.actions?.[0]});
  const contact=globalThis.COOP_APP.answer('ช่องทางติดต่อสหกรณ์');
  if(!contact.actions?.some(x=>x[1]===globalThis.COOP_KB.official.home)) failures.push({group:'contact-website'});
  if(!html.includes('🌐 เว็บไซต์สหกรณ์ www.dlasavingcoop.com')) failures.push({group:'contact-panel-website'});
  if(!html.includes('<a class="coopweb" href="https://www.dlasavingcoop.com/"')) failures.push({group:'top-website'});
  if(!html.includes('data-q="หุ้นและทุนเรือนหุ้น"')) failures.push({group:'shares-home'});
  if(!html.includes('data-q="วิธีชำระเงินสหกรณ์"')) failures.push({group:'payment-home'});
  if(!html.includes('data-q="ติดตามผลและสถานะเอกสาร"')) failures.push({group:'status-home'});
}

const transactionCases=[
 ['ปิดหนี้','loan_close'],['กู้เพื่อพักผ่อน','loan_vacation'],['เงินกู้สามัญ','loan_ordinary'],['กู้ฉุกเฉิน','loan_emergency'],['เงินกู้พิเศษ','loan_special'],
 ['เปิดบัญชีเงินฝาก','deposit_open'],['วิธีฝากเงิน','deposit_add'],['ถอนเงินฝาก','deposit_withdraw'],['ปิดบัญชีเงินฝาก','deposit_withdraw'],
 ['สมัครสมาชิกใหม่','member_apply'],['สมาชิกย้าย','transfer'],['ลาออกจากสหกรณ์','resignation'],
 ['เพิ่งคลอดลูก ขอแบบอะไร','welfare_childbirth'],['ทุนเรียนลูก','scholarship'],['แม่เสียได้สวัสดิการไหม','welfare_family_death'],
 ['สมัครฌาปนกิจ','funeral'],['ชำระเงินฌาปนกิจ','funeral'],['สมาชิกฌาปนกิจเสียชีวิต ขอรับเงิน','funeral'],
 ['ชำระเงินกู้','payment'],['ส่งค่าหุ้น','payment'],
 ['เปลี่ยนอัตราหุ้นรายเดือน','share_change_rate'],['ซื้อหุ้นเพิ่ม','share_purchase'],['ถอนหุ้นได้ไหม','share_refund'],
 ['หนังสือยืนยันยอด 2569','balance_confirmation'],['ผู้รับโอนประโยชน์','beneficiary'],['สมาชิกสมทบ','member_associate'],
 ['คืนสภาพสมาชิก','member_restore'],['เปลี่ยนข้อมูลสมาชิก','member_change_info'],['ปรับโครงสร้างหนี้','debt_help']
];
const authorityPattern=/หลักเกณฑ์|ระเบียบ|ประกาศ|ข้อบังคับ|แบบฟอร์ม|แบบสมาชิก|วิธีการชำระ|คำแนะนำ|หนังสือยืนยันยอด/;
for(const [q,expected] of transactionCases){
  const r=globalThis.COOP_APP.answer(q);
  const hasAuthority=(r.actions||[]).some(([label,url])=>authorityPattern.test(label)&&/^https?:/.test(url));
  const hasProcess=(r.details||[]).some(x=>/ขั้นตอน|1\)/.test(String(x)));
  const hasFinish=(r.details||[]).some(x=>/จบกระบวนการเมื่อ|เสร็จสิ้นเมื่อ|ถือว่ารายการเสร็จ/.test(String(x)));
  const hasContact=(r.actions||[]).some(x=>/^tel:|#staff-directory/.test(x[1]));
  if(r.intent!==expected||!hasAuthority||!hasProcess||!hasFinish||!hasContact){
    failures.push({group:'transaction-completion',q,expected,actual:r.intent,hasAuthority,hasProcess,hasFinish,hasContact});
  }
}

for(const q of ['ซื้อหุ้นเพิ่ม','ผลอนุมัติเงินกู้','เรื่องประกันสหกรณ์','สมาชิกเกษียณ','ประชุมใหญ่','ปันผลปี 69']){
  const r=globalThis.COOP_APP.answer(q);
  if(!/ข้อมูลรายรอบ/.test(r.status||'')) failures.push({group:'freshness-status',q,status:r.status});
}

if(!globalThis.COOP_KB.sourceRegistry?.authorityOrder?.length) failures.push({group:'source-registry'});
if(globalThis.COOP_KB.version!=='3.0.1-pages') failures.push({group:'version',actual:globalThis.COOP_KB.version});

const forbidden=['pay%281%29.pdf','#facebook-copy','id="copyFb"','092-391-8135','0923918135',
 '13wpjwmUycDYCkNIK6oPX1EorzEN7LOaK','1VrfsYKIYmdc21p2nGSMtz0oBYkdd0dSu','1F93n6m5LQcGIzZZ8seLwzGNH-pAYQ7U2'];
for(const token of forbidden) if(html.includes(token)) failures.push({token,group:'stale'});

if(failures.length){
  console.error(JSON.stringify({ok:false,failures},null,2));
  process.exit(1);
}
console.log(JSON.stringify({
  ok:true,
  version:globalThis.COOP_KB.version,
  intents:cases.length,
  typoCases:typos.length,
  privacyCases:7,
  transactionCases:transactionCases.length,
  homepageButtons:homeQueries.length
},null,2));
