import fs from 'node:fs';
import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const monitor=JSON.parse(fs.readFileSync('data/official-source-monitor.json'));
let count=0;const test=(name,fn)=>{fn();count++;console.log('DEBT_LOAN',name,'PASS');};
const products=[
 {id:'debtRestructuringLoanCurrent',domain:'debtRestructuringLoan',q:'กู้ปรับโครงสร้างหนี้',source:'1M2ofeoulfojGqyi254wOWE-F-5wpSSNm',hash:'3d80be1dff1129ab6c27f907c2a7a95d7e4b874a16b6c5f5474b948b5b018f41',aliases:['กู้ปรับโครงสร้างหนี้','ปรับโครงสร้างหนี้','เงินกู้สามัญเพื่อปรับโครงสร้างหนี้'],amount:/ต้นเงิน ดอกเบี้ย ค่าใช้จ่ายดำเนินคดี และเงินประกันชีวิต/,rate:/7\.50% ต่อปี มีเฉลี่ยคืน/,form:'1cxhpuEP_Tfa4dNp0kwVPOSrr5KoAV-dY',salary:/ย้อนหลัง 1 เดือน/},
 {id:'guarantorDebtLoanCurrent',domain:'guarantorDebtLoan',q:'กู้ในฐานะผู้ค้ำประกัน',source:'1q61Ub_I6AafeRXs0t65_3oVyh28N5r0K',hash:'7c8e57e3534282dfae302277ff54adb65dcfd3e933552bb8bded2ce4c49228d8',aliases:['เงินกู้ในฐานะผู้ค้ำประกัน','เงินกู้ฐานะผู้ค้ำประกัน','กู้สามัญเพื่อชำระหนี้สหกรณ์ในฐานะผู้ค้ำประกัน','กู้เพื่อชำระหนี้แทนผู้กู้'],amount:/รวมกับหนี้เงินกู้สามัญประเภทอื่น.*2,000,000 บาท/,rate:/2\.00% ต่อปี ไม่มีเฉลี่ยคืน/,form:'1ZjfxQntcenz5DfpWSd4owcM6zOwEHfW8',salary:/ย้อนหลัง 3 เดือน/}
];
for(const watched of [false,true]){
 const app=loadMemberEngine();if(watched)app.applySourceMonitor(monitor);
 for(const p of products){
  for(const q of p.aliases)test(q+' monitor='+watched,()=>{const r=app.answer(q);assert.equal(r.domain,p.id);assert.equal(r.decision,'RULE_INFORMATION');assert.match(r.answer,p.amount);assert.match(r.answer,/240 งวด/);assert.match(r.answer,/75 ปี/);assert.ok(r.sources.some(s=>s.url.includes(p.source)));assert.doesNotMatch(r.answer,/หมายถึงโครงการ|ต้องการถามคุณสมบัติ|90% ของทุนเรือนหุ้น|undefined|NaN/);});
  for(const [suffix,pattern] of [['คุณสมบัติ',/15%.*6,000 บาท/],['วงเงิน',p.amount],['ผ่อนได้กี่งวด',/240 งวด.*75 ปี/],['ดอกเบี้ยเท่าไร',p.rate],['ใช้เอกสารอะไร',p.salary],['ขั้นตอนยื่น',/Mobile Application \/ Web Application/],['หลักประกัน',/500,000 บาท อย่างน้อย 1 คน/],['ประกันชีวิต',/ผู้รับผลประโยชน์.*นำส่งเบี้ยรายปี/],['บทเฉพาะกาล',/ข้อ 10.*ฉบับเดิมก่อนวันมีผล/]])test(p.q+' '+suffix+' monitor='+watched,()=>{const r=app.answer(p.q+' '+suffix);assert.equal(r.domain,p.id);assert.match(r.answer,pattern);assert.match(r.answer,/ไม่ใช่ผลอนุมัติรายบุคคล/);if(suffix==='ใช้เอกสารอะไร'){assert.ok(r.evidenceLocks.includes('current_form_compatibility'));assert.ok(r.sources.some(s=>s.url.includes(p.form)));}});
  test('conversation '+p.id+' monitor='+watched,()=>{let t=app.conversationTurn(p.q);for(const [q,re]of [['แล้วกี่งวด',/240 งวด/],['ใช้เอกสารอะไร',p.salary],['ดอกเบี้ยเท่าไร',p.rate]]){t=app.conversationTurn(q,t.state);assert.equal(t.result.domain,p.id);assert.match(t.result.answer,re);}assert.equal(app.conversationTurn('กู้หุ้น',t.state).result.domain,'shareBackedLoanCurrent');});
  test('dates '+p.id+' monitor='+watched,()=>{assert.equal(app.answer(p.q+' วันที่ 30 กันยายน 2569 วงเงินเท่าไร').decision,'EVIDENCE_LOCK');assert.equal(app.answer(p.q+' วันที่ 1 ตุลาคม 2569 วงเงินเท่าไร').decision,'RULE_INFORMATION');assert.equal(app.answer(p.q+' วันที่ 1 ตุลาคม 2570 วงเงินเท่าไร').decision,'EVIDENCE_LOCK');});
 }
 test('menu monitor='+watched,()=>{const r=app.answer('เงินกู้มีกี่แบบ');for(const p of products){assert.ok(r.followups.includes(p.q));}});
}
for(const p of products){
 test('authority '+p.id,()=>{const a=loadMemberEngine(),reg=a.getSourceRegistry(),v=reg.ruleVersions.find(v=>v.ruleId===p.id),d=reg.documents.find(d=>d.id===v.documentId);assert.equal(v.values.primarySha256,p.hash);assert.equal(d.contentHash,p.hash);assert.equal(v.effectiveFrom,'2026-10-01');assert.equal(v.values.announcementDate,'2026-09-11');assert.equal(v.review.primaryVerified,true);assert.deepEqual(JSON.parse(JSON.stringify(v.values)),JSON.parse(fs.readFileSync('data/official-rule-master.json')).rules[p.id]);});
 for(const mode of ['bytes','label','removed','conflict','unknown'])test('gate '+p.id+' '+mode,()=>{const a=loadMemberEngine(),s=a.getSourceRegistry();let d=s.documents.find(d=>d.originalUrl.includes(p.source));if(mode==='unknown'){d={id:'new-amendment',title:'แก้ไขหลักเกณฑ์เงินกู้',originalUrl:'https://www.dlasavingcoop.com/show.php?No=774',type:'AMENDMENT',affects:[p.domain],affectedRuleIds:[p.id]};s.documents.push(d);}d.status=mode==='conflict'?'CONFLICT':'PENDING';d.mayAffectRules=true;d.pendingReason=mode==='removed'?'PRIMARY_LINK_REMOVED':mode==='bytes'?'PRIMARY_DOCUMENT_BYTES_CHANGED':'OFFICIAL_LINK_METADATA_CHANGED';if(mode==='bytes')d.contentHash='new-unreviewed';if(mode==='label')d.fingerprint='new-label';a.applySourceMonitor(s);assert.equal(a.answer(p.q+' วงเงิน').decision,'EVIDENCE_LOCK');assert.match(a.answer('กู้สามัญวงเงินเท่าไร').answer,/2,000,000/);assert.match(a.answer('กู้หุ้นวงเงินเท่าไร').answer,/90%/);const other=products.find(x=>x!==p);assert.equal(a.answer(other.q).decision,'RULE_INFORMATION');});
 test('form gate '+p.id,()=>{const a=loadMemberEngine(),s=a.getSourceRegistry(),d=s.documents.find(d=>d.originalUrl.includes(p.form));Object.assign(d,{status:'PENDING',mayAffectRules:true,pendingReason:'PRIMARY_DOCUMENT_BYTES_CHANGED',contentHash:'new'});a.applySourceMonitor(s);assert.equal(a.answer(p.q+' เอกสารอะไร').decision,'EVIDENCE_LOCK');assert.equal(a.answer(p.q+' วงเงิน').decision,'RULE_INFORMATION');});
 test('rate gate '+p.id,()=>{const a=loadMemberEngine(),s=a.getSourceRegistry(),d=s.documents.find(d=>d.id==='doc-8158348139edda052c52');Object.assign(d,{status:'PENDING',mayAffectRules:true,pendingReason:'PRIMARY_DOCUMENT_BYTES_CHANGED',contentHash:'new'});a.applySourceMonitor(s);assert.equal(a.answer(p.q+' ดอกเบี้ยเท่าไร').decision,'EVIDENCE_LOCK');assert.equal(a.answer(p.q+' วงเงิน').decision,'RULE_INFORMATION');});
 test('privacy '+p.id,()=>{const r=loadMemberEngine().answer(p.q+' OTP 123456');assert.equal(r.decision,'SAFE_HANDOFF');assert.ok(r.privacy);assert.doesNotMatch(r.answer,/123456/);});
}
const app=loadMemberEngine();
test('restructure eligibility exact debt history',()=>{const r=app.answer('กู้ปรับโครงสร้างหนี้คุณสมบัติ');assert.match(r.answer,/เงินกู้สามัญมาแล้วไม่น้อยกว่า 6 งวด/);assert.match(r.answer,/ครั้งที่ 2.*12 งวด/);assert.match(r.answer,/วินัยอย่างร้ายแรง.*พิทักษ์ทรัพย์/);assert.doesNotMatch(r.answer,/ไม่มีหนี้เงินกู้ทุกประเภท|ต้องเป็นสมาชิกติดต่อกันไม่น้อยกว่า/);});
test('guarantor aid qualifying borrower events',()=>{const r=app.answer('กู้ในฐานะผู้ค้ำประกันคุณสมบัติ');for(const re of [/สมาชิกติดต่อกันไม่น้อยกว่า 6 เดือน/,/หุ้นรายเดือนต่อเนื่องไม่น้อยกว่า 6 งวด/,/ถึงแก่กรรม/,/ถูกให้ออกจากราชการหรืองานประจำ/,/พิทักษ์ทรัพย์เด็ดขาด/,/ล้มละลาย/])assert.match(r.answer,re);});
test('repayment history is not maximum term',()=>{assert.match(app.answer('กู้ปรับโครงสร้างหนี้ ชำระมาแล้วกี่งวดก่อนยื่น').answer,/เงินกู้สามัญมาแล้วไม่น้อยกว่า 6 งวด/);assert.match(app.answer('กู้ปรับโครงสร้างหนี้ครั้งที่ 2 ส่งแล้วกี่งวด').answer,/12 งวด/);assert.match(app.answer('กู้ในฐานะผู้ค้ำประกันต้องมีผู้ค้ำไหม').answer,/เลือกหลักประกันอย่างหนึ่งหรือหลายอย่าง/);});
test('ordinary guarantor and prior restructure remain distinct',()=>{for(const q of ['คุณสมบัติผู้ค้ำกู้สามัญ','เปลี่ยนผู้ค้ำ','เคยปรับโครงสร้างหนี้แล้วกู้สามัญได้ไหม','ประนีประนอมหนี้','กู้พัฒนาคุณภาพชีวิต','กู้หุ้น','หุ้นรายเดือน','เงินฝากพิเศษ'])assert.ok(!products.some(p=>app.answer(q).domain===p.id),q);});

for(const watched of [false,true])test('restructure legacy document guidance monitor='+watched,()=>{
 const a=loadMemberEngine();if(watched)a.applySourceMonitor(monitor);
 const r=a.answer('กู้ปรับโครงสร้างหนี้ ใช้เอกสารอะไร');
 assert.equal(r.intent,'loan_debt_restructuring');
 assert.equal(r.decision,'RULE_INFORMATION');
 assert.match(r.answer,/เอกสารทั่วไปจากแบบเดิม/);
 assert.match(r.answer,/เอกสารเฉพาะกรณี/);
 assert.match(r.answer,/สมาชิกผู้รับบำนาญไม่ต้องมีหนังสือรับรองจากหน่วยงาน/);
 assert.match(r.answer,/19 กรกฎาคม 2567/);
 assert.match(r.answer,/ยังไม่ได้รับรองว่าเป็นแบบล่าสุดที่ใช้ยื่นตามหลักเกณฑ์ พ\.ศ\.2569/);
 assert.match(r.answer,/ไม่ใช่ทุกคนต้องใช้/);
 assert.match(r.answer,/ย้อนหลัง 1 เดือน/);
 assert.match(r.answer,/ไม่ใช่ผลอนุมัติรายบุคคล/);
 assert.ok(r.evidenceLocks.includes('current_form_compatibility'));
 assert.ok(r.sources.some(s=>s.url.includes('1cxhpuEP_Tfa4dNp0kwVPOSrr5KoAV-dY')));
 assert.ok(r.sources.some(s=>s.url.includes('1M2ofeoulfojGqyi254wOWE-F-5wpSSNm')));
 const other=a.answer('กู้ในฐานะผู้ค้ำประกัน ใช้เอกสารอะไร');
 assert.match(other.answer,/ย้อนหลัง 3 เดือน/);
 assert.doesNotMatch(other.answer,/สมาชิกผู้รับบำนาญไม่ต้องมีหนังสือรับรองจากหน่วยงาน/);
});

console.log('DEBT SPECIFIC LOANS:',count,'cases PASS');
