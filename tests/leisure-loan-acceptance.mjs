import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';

export const leisureQueries=[
  'เงินกู้สามัญเพื่อการพักผ่อน','กู้เพื่อการพักผ่อน','กู้พักผ่อน','กู้ท่องเที่ยว',
  'ขอกู้ไปเที่ยวได้ไหม','กู้พักผ่อนใช้เอกสารอะไร','เงินกู้เพื่อการพักผ่อนผ่อนกี่งวด',
  'กู้พักผ่อนดอกเบี้ยเท่าไร','กู้พักผ่อนคุณสมบัติอะไร','กู้พักผ่อนใช้หลักประกันอะไร',
  'กู้พักผ่อนสิ้นสุดเมื่อไร','กุ้ท่องเที่ยว'
];
export const currentLeisurePatterns=[
  /300,000 บาท/,/36 งวด/,/75 ปี/,/12 เดือน/,/12 งวด/,/15%/,/6,000 บาท/,
  /สมาคมฌาปนกิจ.*ยกเว้นสมาชิกสมทบ/,/ไม่มีภาระหนี้.*ผู้กู้.*สหกรณ์อื่น/,
  /วินัยอย่างร้ายแรง.*พิทักษ์ทรัพย์/,/ไม่ค้างชำระ.*ย้อนหลัง 12 งวด/,
  /ผู้ค้ำ 1 คน.*ไม่ใช่คู่สมรส.*6 งวด/,/เงินฝากในสหกรณ์/,
  /อาจงดเรียกหลักประกัน.*ไม่ใช่สิทธิอัตโนมัติ/,/90%/,/60,000 บาท/,/180 วัน/,
  /ใบเสร็จบริษัทนำเที่ยว.*30 วัน/,/ปรับดอกเบี้ยเท่ากู้สามัญ/,
  /หนังสือยินยอมให้ต้นสังกัดหักเงิน/,/เปิดเผยข้อมูลส่วนบุคคล/,/กรุงไทยหรือ ธ.ก.ส./,
  /บัตรข้าราชการ.*ทะเบียนบ้าน/,/เปลี่ยนชื่อ/,/โปรแกรมนำเที่ยว/,
  /แบบ.*12 งวด.*ขัดกับประกาศใหม่ 36 งวด.*ยืนยัน/,
  /ยังไม่ยืนยันอัตราเฉพาะเงินกู้พักผ่อน/,/ยังไม่ยืนยัน.*สิทธิเฉลี่ยคืน/,
  /ประกาศฉบับปัจจุบันไม่ระบุวันสิ้นสุดโครงการ/,
  /111\/1.*12120/,/Mobile Application.*Web Application/
];
const app=loadMemberEngine();
for(const query of leisureQueries){
  const r=app.answer(query),text=[r.answer,...r.details].join(' ');
  assert.equal(r.intent,'loan_vacation',query);
  for(const pattern of currentLeisurePatterns)assert.match(text,pattern,query);
  assert.ok(r.actions.some(([label,url])=>/หลักเกณฑ์/.test(label)&&url.includes('1PlpK5Cprkz3NV5ey23Ix60Uo10F7IlFS')),'Direct current rule link');
  assert.ok(r.actions.some(([label,url])=>/แบบ/.test(label)&&url.includes('1qC30WEF9YTq1oo-M0r8sySLg2J2uNoIL')),'Separate legacy form link');
  assert.doesNotMatch(text,/วงเงินสูงสุด 100,000|ผ่อนสูงสุด 12|สิ้นสุด 1 กันยายน 2569|undefined|NaN/);
}
assert.match(app.answer('กู้พักผ่อนใช้เอกสารอะไร').answer,/โปรแกรมนำเที่ยว/,'Document answer is substantive');
assert.match(app.answer('กู้พักผ่อนใช้หลักประกันอะไร').answer,/ผู้ค้ำ 1 คน/,'Collateral in first answer');
assert.match(app.answer('กู้พักผ่อนสิ้นสุดเมื่อไร').answer,/ไม่ระบุวันสิ้นสุด/);
assert.match(app.answer('กู้พักผ่อนดอกเบี้ยเท่าไร').answer,/ยังไม่ยืนยัน/);
let turn=app.conversationTurn('กู้ท่องเที่ยว');
for(const q of ['ใช้เอกสารอะไร','ต้องมีผู้ค้ำไหม','ผ่อนได้กี่งวด','ดอกเบี้ยเท่าไร','สิ้นสุดเมื่อไร']){
  turn=app.conversationTurn(q,turn.state,{continuation:true});assert.equal(turn.result.intent,'loan_vacation',q);
}
assert.notEqual(app.conversationTurn('กู้ฉุกเฉินผ่อนได้กี่งวด',turn.state).result.intent,'loan_vacation','New product replaces context');
assert.equal(app.answer('กู้พักผ่อนในวันที่ 1 กันยายน 2569').decision,'EVIDENCE_LOCK','No current rule backdated');
assert.equal(app.answer('กู้พักผ่อนผลอนุมัติหรือยัง').privacy,true,'No fabricated approval');
assert.match(app.answer('กู้พักผ่อนให้ OTP ตรวจได้ไหม').answer,/อย่าส่ง/,'Credentials stay private');

const master=JSON.parse(fs.readFileSync(new URL('../data/official-rule-master.json',import.meta.url))),R=master.rules.leisureLoanCurrent;
assert.equal(R.primarySha256,createHash('sha256').update(fs.readFileSync(new URL('../docs/evidence/leisure-current-2569.pdf',import.meta.url))).digest('hex'));
assert.equal(R.interestRatePercent,null);assert.equal(R.patronageRefund,null);assert.equal(R.projectEndDate,null);
const snapshot=app.getSourceRegistry(),reviewed=snapshot.documents.find(d=>d.id==='doc-5c893b2d819d747e4a6c');
const discovery={...reviewed,status:'PENDING',mayAffectRules:true,pendingReason:'NEW_OFFICIAL_DOCUMENT'};delete discovery.contentHash;
snapshot.documents=snapshot.documents.filter(d=>d.id!==reviewed.id);snapshot.documents.push(discovery);
const current=loadMemberEngine();current.applySourceMonitor(snapshot);
assert.equal(current.answer('กู้พักผ่อน').intent,'loan_vacation','Stale unchanged discovery is reconciled with reviewed primary');
snapshot.documents.push({id:'doc-55fac737853ad4083086',title:'หลักเกณฑ์เพื่อการพักผ่อน ลิงก์เดิม',type:'AMENDMENT',originalUrl:'https://drive.google.com/file/d/1GIh-ym0N1GbfPfr8ojRpzB-pGBD2vVhV/view',officialIndexUrl:'https://www.dlasavingcoop.com/show.php?No=774',linkVerified:true,status:'PENDING',mayAffectRules:true,affects:['ordinaryLoan'],pendingReason:'PRIMARY_LINK_REMOVED'});
current.applySourceMonitor(snapshot);
assert.equal(current.conversationTurn('กู้ท่องเที่ยว').result.intent,'loan_vacation','Reviewed replaced discovery link must not block current primary');
for(const changed of [
  {...discovery,contentHash:'new-unreviewed-bytes'},
  {...discovery,fingerprint:'new-label'},
  {...discovery,pendingReason:'PRIMARY_LINK_REMOVED'},
  {...discovery,pendingReason:'PRIMARY_DOCUMENT_BYTES_CHANGED'},
  {...discovery,id:'unreviewed-vacation-amendment',originalUrl:'https://drive.google.com/file/d/new-amendment/view'}
]){
  const a=loadMemberEngine(),s=a.getSourceRegistry();s.documents.push(changed);a.applySourceMonitor(s);
  assert.equal(a.answer('กู้ท่องเที่ยว').decision,'EVIDENCE_LOCK','Changed primary still locks: '+changed.pendingReason);
}
console.log('LEISURE LOAN: 12 questions, 5 follow-ups, provenance, date/privacy and 6 monitor cases PASS');
