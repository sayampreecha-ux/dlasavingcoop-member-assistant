import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
if(scripts.length!==3) throw new Error(`expected 3 inline scripts, got ${scripts.length}`);
new Function(scripts[0])();
new Function(scripts[1])();
new Function(scripts[2]); // syntax check DOM layer

const cases=[
 ['', 'empty'],['ยอดหนี้ของผมเหลือเท่าไร','personal_handoff'],['ติดต่อสวัสดิการ','welfare_contact'],
 ['ติดต่อทะเบียนสมาชิก','registration_contact'],['ติดต่อเจ้าหน้าที่จังหวัด','province_contact'],['ช่องทางติดต่อสหกรณ์','contact'],
 ['ฌาปนกิจสงเคราะห์','funeral'],['น้ำท่วมขอสวัสดิการ','welfare_disaster'],['เพิ่งคลอดลูก ขอแบบอะไร','welfare_childbirth'],
 ['ทุนเรียนลูก','scholarship'],['แต่งงานได้สวัสดิการไหม','welfare_marriage'],['บวชได้สวัสดิการไหม','welfare_religion'],
 ['เรียนจบได้สวัสดิการไหม','welfare_graduation'],['สวัสดิการบำเหน็จสมาชิก','welfare_gratuity'],['สมาชิกเสียชีวิต','welfare_member_death'],
 ['สวัสดิการมีกี่แบบ','welfare_all'],['แม่เสียได้สวัสดิการไหม','welfare_family_death'],['กู้โดยใช้หุ้นตัวเอง','loan_share_secured'],
 ['กู้เพื่อพักผ่อน','loan_vacation'],['ปิดยอดกู้','loan_close'],['เปลี่ยนผู้ค้ำ','loan_change_guarantor'],['กู้ต้องค้ำกี่คน','loan_guarantor_count'],
 ['ค้ำประกันได้กี่คน','guarantor_capacity'],['กู้ได้ไหม','loan_eligibility'],['เงินกู้มีกี่แบบ','loan_all'],['เงินกู้สามัญ','loan_ordinary'],
 ['กู้ฉุกเฉิน','loan_emergency'],['เงินกู้พิเศษ','loan_special'],['กู้เพื่อการศึกษา','loan_education'],['กู้กรณีน้ำท่วม','loan_disaster'],
 ['สมัครสมาชิกใหม่','member_apply'],['สมาชิกย้าย','transfer'],['ลาออกจากสหกรณ์','resignation'],['เปิดบัญชีเงินฝาก','deposit_open'],
 ['วิธีฝากเงิน','deposit_add'],['ถอนเงินฝาก','deposit_withdraw'],['เงินฝาก','deposit'],['ปันผลปี 69','dividend'],
 ['แบบฟอร์มทั้งหมด','forms'],['ข่าวล่าสุด','notices'],['ชำระเงินกู้','payment'],['นี่คือคำถามที่ไม่มีในระบบ xyzabc','fallback']
];

const workflow=new Set([
 'welfare_childbirth','scholarship','welfare_marriage','welfare_religion','welfare_graduation','welfare_gratuity','welfare_member_death','welfare_all','welfare_family_death','welfare_disaster',
 'loan_share_secured','loan_vacation','loan_close','loan_change_guarantor','loan_guarantor_count','loan_eligibility','loan_all','loan_ordinary','loan_emergency','loan_special','loan_education','loan_disaster',
 'member_apply','transfer','resignation','deposit_open','deposit_add','deposit_withdraw','deposit','funeral'
]);
const needContact=new Set([...workflow,'welfare_contact','registration_contact','province_contact','contact','personal_handoff','dividend']);

const failures=[];
for(const [q,expected] of cases){
  const r=globalThis.COOP_APP.answer(q);
  const checks={
    intent:r.intent===expected,
    process:!workflow.has(expected)||(r.details||[]).some(x=>/ขั้นตอน|1\)/.test(String(x))),
    contact:!needContact.has(expected)||(r.actions||[]).some(x=>/^tel:|#staff-directory/.test(x[1])||/contact/.test(x[1])),
    actionShape:(r.actions||[]).every(x=>Array.isArray(x)&&x.length===2&&/^(https?:|tel:|#)/.test(x[1]))
  };
  if(!Object.values(checks).every(Boolean)) failures.push({q,expected,actual:r.intent,checks});
}

const typos=[
 ['เงินกูมีกี่แบบ','loan_all'],['เงินกุ้','loan_all'],['กุ้ฉุกเฉิน','loan_emergency'],['เงินกูพิเศษ','loan_special'],
 ['สวสดิการ','welfare_all'],['สวัดดิการมีกี่แบบ','welfare_all'],['ติดต่อสวสดิการ','welfare_contact'],
 ['ฌาปณกิจ','funeral'],['ฌาปนกิด','funeral'],['ชาปนกิจ','funeral'],['โอนยาย','transfer'],['ย้ายสังกัด','transfer'],
 ['สมาชิกย้าย','transfer'],['แบบฟอม','forms'],['สมคัรสมาชิก','member_apply'],['ปันผน','dividend'],['เฟสบุค','contact'],
 ['เฟซบุ๊ก','contact'],['ถอนเงนฝาก','deposit_withdraw'],['เงนฝาก','deposit']
];
for(const [q,expected] of typos){
  const actual=globalThis.COOP_APP.answer(q).intent;
  if(actual!==expected) failures.push({q,expected,actual,group:'typo'});
}

for(const q of ['1234567890123','รหัสผ่านของผม','OTP 123456','ยอดหุ้นของผม','ผลอนุมัติของผม','ยอดเงินฝากของฉัน','กู้เพิ่มได้เท่าไรของผม']){
  const r=globalThis.COOP_APP.answer(q);
  if(r.intent!=='personal_handoff'||r.privacy!==true) failures.push({q,actual:r.intent,group:'privacy'});
}

for(const q of [...html.matchAll(/data-q="([^"]+)"/g)].map(m=>m[1])){
  if(globalThis.COOP_APP.answer(q).intent==='fallback') failures.push({q,group:'homepage'});
}


// Critical UI/service guards requested by members.
{
  const signup=globalThis.COOP_APP.answer('สมัครฌาปนกิจ');
  if(signup.actions?.[0]?.[1] !== globalThis.COOP_KB.official.funeralApplyHowToImage){
    failures.push({group:'funeral-signup',actual:signup.actions?.[0]});
  }
  const contact=globalThis.COOP_APP.answer('ช่องทางติดต่อสหกรณ์');
  if(!contact.actions?.some(x=>x[1]===globalThis.COOP_KB.official.home)){
    failures.push({group:'contact-website'});
  }
  if(!html.includes('🌐 เว็บไซต์สหกรณ์ www.dlasavingcoop.com')){
    failures.push({group:'contact-panel-website'});
  }
}

const forbidden=['#facebook-copy','id="copyFb"','092-391-8135','0923918135','13wpjwmUycDYCkNIK6oPX1EorzEN7LOaK','1VrfsYKIYmdc21p2nGSMtz0oBYkdd0dSu','1F93n6m5LQcGIzZZ8seLwzGNH-pAYQ7U2'];
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
  homepageButtons:[...html.matchAll(/data-q="([^"]+)"/g)].length
},null,2));
