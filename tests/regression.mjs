import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
if(scripts.length!==3) throw new Error(`expected 3 inline scripts, got ${scripts.length}`);
new Function(scripts[0])();
new Function(scripts[1])();
new Function(scripts[2]);

const cases=[
 ['', 'empty'],['ยอดหนี้ของผมเหลือเท่าไร','member_self_service'],['ติดต่อสวัสดิการ','welfare_contact'],
 ['ติดต่อทะเบียนสมาชิก','registration_contact'],['ติดต่อเจ้าหน้าที่จังหวัด','province_contact'],['ช่องทางติดต่อสหกรณ์','contact'],['เว็บไซต์สหกรณ์','contact'],

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
 ['กู้ได้ไหม','loan_need_type'],['เงินกู้มีกี่แบบ','loan_all'],['เงินกู้สามัญ','loan_ordinary'],
 ['กู้ฉุกเฉิน','loan_emergency'],['เงินกู้พิเศษ','loan_special'],['กู้บ้าน','loan_special_housing'],['ซื้อบ้าน','loan_special_housing'],['สร้างบ้าน','loan_special_housing'],['ต่อเติมบ้าน','loan_special_housing'],['เคหะ','loan_special_housing'],['รีไฟแนนซ์บ้าน','loan_special_redeem'],['ไถ่ถอนจำนองบ้าน','loan_special_redeem'],['รวมหนี้','loan_special_quality'],['กู้เพื่อการศึกษา','loan_education'],['กู้กรณีน้ำท่วม','loan_disaster'],['ชำระหนี้แทนผู้กู้','loan_guarantor_debt'],['กู้น้ำท่วม','loan_disaster'],

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
 'loan_all','loan_ordinary','loan_emergency','loan_special','loan_special_housing','loan_special_redeem','loan_special_quality','loan_guarantor_debt','loan_education','loan_disaster',
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
  if(r.intent!==( /ยอดหุ้น|ผลอนุมัติ|ยอดเงินฝาก/.test(q)?'member_self_service':'personal_handoff')||r.privacy!==true) failures.push({q,actual:r.intent,group:'privacy'});
}

const homeQueries=[...html.matchAll(/data-q="([^"]+)"/g)].map(m=>m[1]);
for(const q of homeQueries){
  const r=globalThis.COOP_APP.answer(q);
  if(r.intent==='fallback'||r.intent==='empty') failures.push({q,actual:r.intent,group:'homepage'});
}

{
  const signup=globalThis.COOP_APP.answer('สมัครฌาปนกิจ');
  if(signup.actions?.[0]?.[1] !== globalThis.COOP_KB.official.funeralApply) failures.push({group:'funeral-signup',actual:signup.actions?.[0]});
  const contact=globalThis.COOP_APP.answer('ช่องทางติดต่อสหกรณ์');
  if(!contact.actions?.some(x=>x[1]===globalThis.COOP_KB.official.home)) failures.push({group:'contact-website'});
  if(!html.includes('🌐 เว็บไซต์สหกรณ์ www.dlasavingcoop.com')) failures.push({group:'contact-panel-website'});
  if(!html.includes('<a class="coopweb" href="https://www.dlasavingcoop.com/"')) failures.push({group:'top-website'});
  const facebookHrefs=[...html.matchAll(/href="([^"]*facebook\.com[^"]*)"/ig)].map(m=>m[1]);
  if(!facebookHrefs.length) failures.push({group:'facebook-navigation-missing'});
  if(facebookHrefs.some(h=>h!=='https://www.facebook.com/dlasaving')) failures.push({group:'facebook-navigation-not-canonical',hrefs:facebookHrefs});
  if(/facebook\.com\/share\//i.test(html)) failures.push({group:'facebook-share-url-forbidden'});
  if(/Dlasavingcooppage/i.test(html)) failures.push({group:'facebook-legacy-url-forbidden'});

  if(!html.includes('data-q="หุ้นและทุนเรือนหุ้น"')) failures.push({group:'shares-home'});
  if(!html.includes('data-q="วิธีชำระเงินสหกรณ์"')) failures.push({group:'payment-home'});
  if(!html.includes('data-q="ติดตามผลและสถานะเอกสาร"')) failures.push({group:'status-home'});
  const welfare=globalThis.COOP_APP.answer('สวัสดิการมีกี่แบบ');
  const wf=welfare.actions?.find(x=>x[1]==='#ask:ฌาปนกิจสงเคราะห์');
  if(!wf) failures.push({group:'welfare-funeral-internal',actions:welfare.actions});
  if(!html.includes("else if(/^#ask:/.test(u))")) failures.push({group:'internal-action-renderer'});
  if(!html.includes('class="brand-logo"')) failures.push({group:'pilot-brand-logo'});
  if(!html.includes('data:image/webp;base64,')) failures.push({group:'pilot-inline-logo'});
  if(!html.includes('object-fit:contain')) failures.push({group:'pilot-logo-contain'});
  if(!html.includes('Pilot Version')) failures.push({group:'pilot-badge'});
  if(!html.includes('id="currentEvents"')) failures.push({group:'current-events-panel'});
  if(!html.includes("./data/current-events.json?ts=")) failures.push({group:'current-events-fetch'});
  if(!html.includes('function renderCurrentEvents(data)')) failures.push({group:'current-events-renderer'});
  if(!html.includes('function eventActive(e)')) failures.push({group:'current-events-freshness'});
  if(!html.includes('ดูวิธีทำ')) failures.push({group:'current-events-action'});
  if(!html.includes('📋 ดูขั้นตอนและรายละเอียด')) failures.push({group:'progressive-disclosure'});
  if(!html.includes('--orange:#f58220')||!html.includes('--green:#0f6b45')||!html.includes('--gold:#d9a62e')) failures.push({group:'brand-palette'});
}

const transactionCases=[
 ['ปิดหนี้','loan_close'],['ชำระหนี้แทนผู้กู้','loan_guarantor_debt'],['กู้เพื่อพักผ่อน','loan_vacation'],['เงินกู้สามัญ','loan_ordinary'],['กู้ฉุกเฉิน','loan_emergency'],['เงินกู้พิเศษ','loan_special'],['กู้บ้าน','loan_special_housing'],['ไถ่ถอนจำนองบ้าน','loan_special_redeem'],['รวมหนี้','loan_special_quality'],
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
if(globalThis.COOP_KB.version!=='4.4.0-member-journey') failures.push({group:'version',actual:globalThis.COOP_KB.version});

const forbidden=['show.php?No=4650','17%282%29.jpg','4%2823%29.jpg','12%285%29.jpg','66%282%29.png','1DVazU8xDNsSmK5oCobOcS_jnwdzNmg18','1l-WYt403pVZ0Rc6aWbFnIH5-BXkUisZ8','16sy_LWmvP5agwyTAkwXWjlpxsA0xK6JD','1QhkAh71xlx8ESPfMBvT7mIzA7rsgap8E','1enzqVcofpAbstQQQziZoOjrQtmTPgH32','Funeralsociety.pdf','777.jpg','pay%281%29.pdf','#facebook-copy','id="copyFb"','092-391-8135','0923918135',
 '13wpjwmUycDYCkNIK6oPX1EorzEN7LOaK','1VrfsYKIYmdc21p2nGSMtz0oBYkdd0dSu','1F93n6m5LQcGIzZZ8seLwzGNH-pAYQ7U2'];
for(const token of forbidden){
 if(['1QhkAh71xlx8ESPfMBvT7mIzA7rsgap8E','1F93n6m5LQcGIzZZ8seLwzGNH-pAYQ7U2'].includes(token)){
  const history=Object.values(globalThis.COOP_KB.ruleAuthority.rules).filter(x=>(x.source||'').includes(token));
  if(!history.length||history.some(x=>x.evidenceState!=='PRIMARY_VERIFIED_SUPERSEDED'||x.effectiveUntil!=='2026-09-30'))failures.push({token,group:'unlocked-historical-primary'});
  for(const [q]of cases){const r=globalThis.COOP_APP.answer(q);if([...(r.actions||[]).map(x=>x[1]),...(r.sources||[]).map(x=>x.url)].some(x=>x.includes(token)))failures.push({q,token,group:'superseded-runtime-source'});}
 }else if(html.includes(token))failures.push({token,group:'stale'});
}
for(const q of ['ยอดหุ้นของผม','ยอดหนี้ของผมเหลือเท่าไร','ผลอนุมัติของผม','ยอดเงินฝากของฉัน']){
 const r=globalThis.COOP_APP.answer(q);
 if(!r.privacy||!(r.actions||[]).some(x=>x[1]==='https://member.dlasavingcoop.com/coop/')||(r.actions||[]).some(x=>x[1]==='#staff-directory'))failures.push({q,group:'self-service-before-staff'});
}

if(failures.length){
  console.error(JSON.stringify({ok:false,failures},null,2));
  process.exit(1);
}


// AI Member Gateway service-coverage contract (7 Oct 2569)
for (const [q, intentPattern] of [
  ['อยากสมัครเป็นสมาชิก ต้องทำยังไง', /member_apply|membership/],
  ['เปิดบัญชีเงินฝากออมทรัพย์พิเศษยังไง', /deposit_open/],
  ['อยากกู้พิเศษซื้อบ้าน', /special|housing|loan/],
  ['ขอแบบฟอร์มสวัสดิการน้ำท่วม', /welfare|forms/],
  ['จะประนอมหนี้ ต้องทำยังไง', /debt|compromise|restructur/],
  ['ยอดหุ้นของผมเท่าไร', /member_self_service/]
]) {
  const r=globalThis.COOP_APP.answer(q);
  if(!intentPattern.test(r.intent)) throw new Error('member-gateway-route: '+q+' -> '+r.intent);
  if(!(r.actions||[]).length) throw new Error('member-gateway-next-action: '+q);
}
for (const q of ['เปิดบัญชีเงินฝากออมทรัพย์พิเศษยังไง','อยากกู้พิเศษซื้อบ้าน','ขอแบบฟอร์มสวัสดิการน้ำท่วม']) {
  const r=globalThis.COOP_APP.answer(q);
  if(!(r.sources||[]).some(s=>/^https?:/.test(s.url||''))) throw new Error('member-gateway-official-evidence: '+q);
}


// Mobile answer UI must not expose internal evidence classification tokens.
if(!html.includes("s.textContent='📚 ดูหลักฐานประกอบ'")) throw new Error('mobile-evidence-label: technical status exposed');


// Evidence-lock answers must not ask members to restate a topic already supplied.
const lockAnswer=globalThis.COOP_APP.answer('หลักเกณฑ์กู้สามัญล่าสุดเปลี่ยนหรือยัง');
if(lockAnswer.decision==='EVIDENCE_LOCK' && /ต้องการตรวจประเภทคำขอและประเด็นใด/.test(lockAnswer.answer)) throw new Error('evidence-lock repeats member question');


// A request for a form must lead with the relevant official form, even if rule freshness is locked.
for(const q of ['ขอแบบฟอร์มกู้สามัญ','ขอแบบฟอร์มสวัสดิการน้ำท่วม']){
 const r=globalThis.COOP_APP.answer(q);
 if(r.decision==='EVIDENCE_LOCK' && !(r.actions||[]).some(a=>/แบบฟอร์ม|เอกสาร/.test(a[0]))) throw new Error('locked-form-route: '+q);
}

// Official-source special deposit answer simulation: no fabricated current interest rate.
for(const [q,expected] of [
  ['ฝากพิเศษ','500 บาท'],
  ['เปิดบัญชีฝากพิเศษขั้นต่ำกี่บาท','500 บาท'],
  ['ฝากพิเศษดอกเบี้ยกี่เปอร์เซ็นต์','3.25%'],
  ['ฝากพิเศษถอนเงินได้ไหม','คำขอถอน'],
  ['ฝากพิเศษยอดของผมเหลือเท่าไร','ยืนยันตัวตน']
]){
 const r=globalThis.COOP_APP.answer(q);
 if(!String(r.answer||'').includes(expected))throw new Error('special-deposit-answer '+q+': '+r.answer);
}
const depositRate=globalThis.COOP_APP.answer('ฝากพิเศษดอกเบี้ยเท่าไร');
if(!/ยังไม่ได้ยืนยัน/.test(depositRate.answer))throw new Error('special-deposit-rate-freshness');

// Membership wording variants must route consistently without swallowing ordinary share purchases.
for(const q of ['เป็นสมาชิกสหกรณ์หลายแห่งได้ไหม','เป็นสมาชิกหลายสหกรณ์ได้ไหม','ถือหุ้นหลายสหกรณ์ได้ไหม']) {
 const r=globalThis.COOP_APP.answer(q);
 if(r.intent!=='membership_other_cooperative_review'||r.decision!=='EVIDENCE_LOCK')throw new Error('multiple-coop-variant '+q+' -> '+r.intent);
}
if(globalThis.COOP_APP.answer('ซื้อหุ้นเพิ่มอีก 100 หุ้นในสหกรณ์').intent!=='share_purchase')throw new Error('multiple-coop-false-positive: share purchase');

// Duplicate savings-cooperative membership: answer first, transfer action, evidence lock.
for(const q of ['เป็นสมาชิกสหกรณ์อื่นอยู่สมัคร สอ.อปท. ได้ไหม','เป็นสมาชิกสองสหกรณ์ได้ไหม','ซื้อหุ้นสองสหกรณ์ได้ไหม','สมาชิกซ้ำสหกรณ์อื่น']) {
 const r=globalThis.COOP_APP.answer(q);
 if(r.intent!=='membership_other_cooperative_review')throw new Error('duplicate-membership-route '+q+' -> '+r.intent);
 if(!/ไม่รับสมัครสมาชิกควบ/.test(r.answer||''))throw new Error('duplicate-membership-answer '+q);
 if(r.decision!=='EVIDENCE_LOCK')throw new Error('duplicate-membership-authority '+q);
 if(!(r.actions||[]).some(a=>/โอนสมาชิก/.test(a[0])))throw new Error('duplicate-membership-transfer '+q);
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
