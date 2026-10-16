import fs from 'node:fs';
import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const master=JSON.parse(fs.readFileSync(new URL('../data/official-rule-master.json',import.meta.url)));
const monitor=JSON.parse(fs.readFileSync(new URL('../data/official-source-monitor.json',import.meta.url)));
const source='1347L0hE1IddgM1ab6oheXQPgKpUTMasa';
const rule=master.rules.shareBackedLoanCurrent;
let count=0;
function check(name,fn){fn();count++;console.log('SHARE_LOAN',name,'PASS');}
const questions=[
 ['SC01','กู้ทุนเรือนหุ้นได้เท่าไร',/90%/],
 ['SC02','กู้ไม่เกินทุนเรือนหุ้น',/90%/],
 ['SC03','กู้หุ้น',/240 งวด/],
 ['SC04','กู้สามัญไม่เกินทุนเรือนหุ้นได้เท่าไร',/90%/],
 ['SC05','กู้สามัญใช้ทุนเรือนหุ้นเป็นหลักประกัน',/90%/],
 ['SC06','กู้ไม่เกินทุนเรือนหุ้นต้องเป็นสมาชิกกี่เดือน',/6 เดือน/],
 ['SC07','กู้ทุนเรือนหุ้นผ่อนได้กี่งวด',/240 งวด/],
 ['SC08','กู้ทุนเรือนหุ้นต้องใช้เอกสารอะไร',/ย้อนหลัง 3 เดือน/],
 ['SC09','กู้ทุนเรือนหุ้นดอกเบี้ยเท่าไร',/7\.50% ต่อปี/],
 ['SC10','กู้ไม่เกินทุนเรือนหุ้นและเงินฝาก',/ยังไม่มีหลักฐาน.*เงินฝากมารวม/],
 ['alias-reverse','กู้สามัญใช้หลักประกันเป็นทุนเรือนหุ้น',/ยังไม่ระบุจำนวนผู้ค้ำ/],
 ['alias-legacy','กู้โดยใช้หุ้นตัวเอง',/90%/],
 ['alias-guarantee','กู้สามัญใช้หุ้นค้ำได้ไหม',/90%/]
];
for(const monitored of [false,true]){
 const app=loadMemberEngine();if(monitored)app.applySourceMonitor(monitor);
 for(const [id,q,re]of questions)check(id+' monitor='+monitored,()=>{
  const r=app.answer(q);assert.equal(r.intent,'loan_share_secured');assert.equal(r.domain,'shareBackedLoanCurrent');assert.equal(r.decision,'RULE_INFORMATION');assert.match(r.answer,re);assert.match(r.answer,/ไม่ใช่ผลอนุมัติรายบุคคล/);assert.doesNotMatch(r.answer,/2,000,000|undefined|NaN|เป็นเงินกู้ประเภทไหน/);assert.ok(r.sources.some(s=>s.url.includes(source)));assert.ok(r.actions.some(([,url])=>url.includes(source)));
 });
 check('SC11 menu monitor='+monitored,()=>{const t=app.conversationTurn('เงินกู้มีกี่แบบ');assert.ok(t.result.followups.includes('กู้ไม่เกินทุนเรือนหุ้น'));const next=app.conversationTurn('กู้ไม่เกินทุนเรือนหุ้น',t.state,{continuation:true});assert.equal(next.result.domain,'shareBackedLoanCurrent');assert.match(next.result.answer,/90%/);});
 for(const q of ['กู้ไม่เกินทุนเรือนหุ้น','กู้ทุนเรือนหุ้นได้เท่าไร'])check('continuation '+q+' monitor='+monitored,()=>{let t=app.conversationTurn(q);for(const q2 of ['แล้วกี่งวด','ใช้เอกสารอะไร','ดอกเบี้ยเท่าไร']){t=app.conversationTurn(q2,t.state);assert.equal(t.result.domain,'shareBackedLoanCurrent');assert.doesNotMatch(t.result.answer,/undefined|NaN/);}assert.match(t.result.answer,/7\.50%/);});
}
const app=loadMemberEngine();app.applySourceMonitor(monitor);
check('verified source version parity',()=>{const r=app.getSourceRegistry(),v=r.ruleVersions.find(v=>v.ruleId==='shareBackedLoanCurrent');assert.deepEqual(JSON.parse(JSON.stringify(v.values)),rule);assert.equal(v.effectiveFrom,'2026-10-01');assert.equal(rule.announcementDate,'2026-09-11');assert.equal(rule.clauseEvidence.eligibility.clauses[0],4);assert.equal(rule.maxSharePercent,90);assert.equal(rule.maxTermInstallments,240);assert.equal(rule.maxAgeAtEnd,75);assert.equal(rule.guarantorCount,null);assert.equal(rule.depositInAmountBasis,false);const d=r.documents.find(d=>d.id===v.documentId);assert.equal(d.status,'CURRENT');assert.equal(d.contentHash,rule.primarySha256);assert.ok(d.metadataReview.primaryBytesVerified);});
for(const [q,re]of [
 ['กู้หุ้น เป็นสมาชิก 5 เดือน',/5 เดือน ยังไม่ถึงขั้นต่ำ 6 เดือน/],
 ['กู้หุ้น เป็นสมาชิก 6 เดือน',/6 เดือน ถึงขั้นต่ำ 6 เดือน/],
 ['กู้หุ้น ส่งหุ้น 5 งวด',/5 งวด ยังไม่ถึงขั้นต่ำ 6 งวด/],
 ['กู้หุ้น ส่งหุ้น 6 งวด',/6 งวด ถึงขั้นต่ำ 6 งวด/],
 ['กู้หุ้น เงินเดือน 20000 บาท เงินเหลือ 5999 บาท',/คงเหลือ 5,999 บาท ยังไม่ถึงทั้งสองเกณฑ์/],
 ['กู้หุ้น เงินเดือน 20000 บาท เงินเหลือ 6000 บาท',/คงเหลือ 6,000 บาท ถึงทั้งสองเกณฑ์/],
 ['กู้หุ้น เงินเดือน 50000 บาท เงินเหลือ 6000 บาท',/อย่างน้อย 7,500 บาท/],
 ['กู้หุ้น เงินเดือน 50000 บาท เงินเหลือ 7500 บาท',/คงเหลือ 7,500 บาท ถึงทั้งสองเกณฑ์/],
 ['กู้หุ้น มีหุ้น 100000 บาท กู้ได้เท่าไร',/เพดานตามข้อ 5\(1\) คือ 90,000 บาท/],
 ['กู้หุ้น ขอผ่อน 240 งวด',/240 งวด ไม่เกินเพดาน 240 งวด/],
 ['กู้หุ้น ขอผ่อน 241 งวด',/241 งวด เกินเพดาน 240 งวด/],
 ['กู้หุ้น อายุสิ้นสุดสัญญา 75 ปี',/75 ปี ไม่เกินเพดาน 75 ปี/],
 ['กู้หุ้น อายุสิ้นสุดสัญญา 76 ปี',/76 ปี เกินเพดาน 75 ปี/],
 ['กู้หุ้นมีหนี้ฉุกเฉินได้ไหม',/ยกเว้นเงินกู้เพื่อเหตุฉุกเฉิน/],
 ['กู้หุ้นมีหนี้สามัญเดิมได้ไหม',/ไม่มีหนี้เงินกู้ทุกประเภทกับสหกรณ์ ยกเว้น/],
 ['กู้หุ้นมีหนี้สหกรณ์อื่นได้ไหม',/ไม่มีภาระหนี้ในฐานะผู้กู้กับสหกรณ์อื่น/],
 ['กู้หุ้นต้องเป็นสมาชิกฌาปนกิจไหม',/เป็นสมาชิกสมาคมฌาปนกิจ/],
 ['กู้หุ้นถูกดำเนินการวินัยร้ายแรงได้ไหม',/วินัยอย่างร้ายแรง.*พิทักษ์ทรัพย์/],
 ['กู้หุ้นยื่นอย่างไร',/Mobile Application \/ Web Application/],
 ['กู้หุ้นข้อยกเว้น',/2 ใน 3 ของกรรมการทั้งหมดเท่าที่มีอยู่/],
 ['กู้หุ้นบทเฉพาะกาล',/ก่อนประกาศนี้มีผล/],
 ['กู้หุ้นต้องมีผู้ค้ำกี่คน',/ไม่สรุปว่าไม่ต้องมีผู้ค้ำ/],
 ['กู้หุ้นคำนวณค่างวดเดือนละเท่าไร',/ยังไม่แสดงค่างวด/]
])check('boundary '+q,()=>{const r=app.answer(q);assert.equal(r.domain,'shareBackedLoanCurrent');assert.match(r.answer,re);assert.doesNotMatch(r.answer,/กู้ได้แน่นอน|อนุมัติแล้ว|undefined|NaN/);});
check('historical lock and effective boundary',()=>{assert.equal(app.answer('กู้หุ้น วันที่ 30 กันยายน 2569 วงเงินเท่าไร').decision,'EVIDENCE_LOCK');const historical=app.answer('กู้หุ้น วันที่ 30 กันยายน 2569 วงเงินเท่าไร');assert.ok(historical.sources.some(s=>s.url.includes(source)));assert.match(historical.answer,/ไม่ใช้ฉบับนี้ยืนยันเงื่อนไขก่อนวันมีผล/);assert.doesNotMatch(historical.answer,/90%|7\.50%|2,000,000/);assert.match(app.answer('กู้หุ้น วันที่ 1 ตุลาคม 2569 วงเงินเท่าไร').answer,/90%/);assert.equal(app.answer('กู้หุ้น วันที่ 1 ตุลาคม 2570 วงเงินเท่าไร').decision,'EVIDENCE_LOCK');});
check('privacy',()=>{for(const q of ['กู้หุ้นของผมอนุมัติหรือยัง','กู้หุ้น OTP 123456','กู้หุ้นตรวจยอดหุ้นของผม']){const r=app.answer(q);assert.ok(r.privacy);assert.equal(r.decision,'SAFE_HANDOFF');assert.doesNotMatch(r.answer,/123456|อนุมัติแล้ว/);}});
for(const change of ['bytes','label','conflict','removed'])check('criteria monitor '+change,()=>{
 const a=loadMemberEngine(),snap=a.getSourceRegistry(),d=snap.documents.find(d=>d.originalUrl.includes(source));
 d.status=change==='conflict'?'CONFLICT':'PENDING';d.mayAffectRules=true;d.pendingReason=change==='removed'?'PRIMARY_LINK_REMOVED':change==='bytes'?'PRIMARY_DOCUMENT_BYTES_CHANGED':'OFFICIAL_LINK_METADATA_CHANGED';if(change==='bytes')d.contentHash='new-unreviewed-bytes';if(change==='label')d.fingerprint='new-unreviewed-label';
 a.applySourceMonitor(snap);for(const [,q]of questions)assert.equal(a.answer(q).decision,'EVIDENCE_LOCK');assert.match(a.answer('กู้สามัญวงเงินเท่าไร').answer,/2,000,000/);
});
check('unknown scoped amendment locks',()=>{const a=loadMemberEngine(),s=a.getSourceRegistry();s.documents.push({id:'synthetic-share-change',title:'แก้ไขหลักเกณฑ์เงินกู้',type:'AMENDMENT',status:'PENDING',mayAffectRules:true,affectedRuleIds:['shareBackedLoanCurrent'],affects:['ordinaryLoan'],originalUrl:'https://www.dlasavingcoop.com/show.php?No=774',linkVerified:true});a.applySourceMonitor(s);assert.equal(a.answer('กู้หุ้นได้เท่าไร').decision,'EVIDENCE_LOCK');});
check('form change only locks document concern',()=>{const a=loadMemberEngine(),s=a.getSourceRegistry(),d=s.documents.find(d=>d.id===rule.formDocumentId);d.status='PENDING';d.mayAffectRules=true;d.pendingReason='PRIMARY_DOCUMENT_BYTES_CHANGED';d.contentHash='new-form';a.applySourceMonitor(s);assert.equal(a.answer('กู้หุ้นเอกสารอะไร').decision,'EVIDENCE_LOCK');assert.match(a.answer('กู้หุ้นได้เท่าไร').answer,/90%/);});
check('interest change scoped',()=>{const a=loadMemberEngine(),s=a.getSourceRegistry(),d=s.documents.find(d=>d.id===rule.interestDocumentId);d.status='PENDING';d.mayAffectRules=true;d.pendingReason='PRIMARY_DOCUMENT_BYTES_CHANGED';d.contentHash='new-interest';a.applySourceMonitor(s);assert.equal(a.answer('กู้หุ้นดอกเบี้ยเท่าไร').decision,'EVIDENCE_LOCK');assert.match(a.answer('กู้หุ้นได้เท่าไร').answer,/90%/);});
check('other products unchanged',()=>{for(const [q,re]of [['กู้สามัญวงเงินเท่าไร',/2,000,000/],['กู้ฉุกเฉินวงเงินเท่าไร',/60,000/],['กู้เคหะวงเงินเท่าไร',/3,000,000/],['กู้เพื่อการศึกษาวงเงินเท่าไร',/200,000/],['หุ้นรายเดือนส่งได้สูงสุดเท่าไร',/5,000/],['ฝากพิเศษเปิดบัญชีขั้นต่ำเท่าไร',/500 บาท/]]){const r=app.answer(q);assert.notEqual(r.domain,'shareBackedLoanCurrent');assert.match(r.answer,re);}});
console.log('SHARE BACKED LOAN ACCEPTANCE:',count,'cases PASS; original gates retained');
