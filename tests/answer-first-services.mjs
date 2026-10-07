import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';

// Synthetic public questions. Require substance in the primary answer, not just
// a source link or a keyword buried in a collapsed detail section.
export const answerFirstCases=[
 ['กู้สามัญ',/2,000,000 บาท/,/240 งวด/,/15%/],
 ['ขอรายละเอียดเงินกู้สามัญ',/2,000,000 บาท/,/6 เดือน/,/6,000 บาท/],
 ['กู้ฉุกเฉิน',/30,000 บาท/,/60,000 บาท/,/15 งวด/],
 ['เงื่อนไขกู้ฉุกเฉิน',/3 เดือน/,/3,000 บาท/,/หักกลบ/],
 ['กู้เคหะ',/3,000,000 บาท/,/360 งวด/,/บ้านมือสอง/],
 ['ขอสรุปกู้ซื้อบ้าน',/3,000,000 บาท/,/80%/,/5,000,000 บาท/],
 ['กู้รวมหนี้',/5,000,000 บาท/,/80%/,/สัญญาเดียว/],
 ['คุณสมบัติกู้พัฒนาคุณภาพชีวิต',/3 ปี/,/36 งวด/,/5 ปี/],
 ['กู้ไถ่ถอนจำนอง',/3,000,000 บาท/,/ยอดหนี้จำนองเดิม/,/360 งวด/],
 ['เงื่อนไขกู้ไถ่ถอนจำนองบ้าน',/12 เดือน/,/3 ปี/,/6,000 บาท/]
];
if(process.argv[1]===new URL(import.meta.url).pathname){
 const app=loadMemberEngine();let pass=0;
 for(const [q,...checks]of answerFirstCases){const r=app.answer(q);assert.equal(r.decision,'RULE_INFORMATION',q);for(const pattern of checks)assert.match(r.answer,pattern,q);assert.doesNotMatch(r.answer,/ให้เปิดประกาศ|ให้ดู.*หลักเกณฑ์/);assert.ok(r.sources.length);pass++;}
 let t=app.conversationTurn('อยากกู้เงินแต่ไม่รู้ต้องเลือกแบบไหน');assert.ok(t.result.followups.includes('กู้สามัญ'));
 t=app.conversationTurn('กู้สามัญ',t.state,{continuation:true});assert.match(t.result.answer,/2,000,000 บาท/);pass++;
 t=app.conversationTurn('ผ่อนได้กี่งวด',t.state);assert.match(t.result.answer,/240 งวด/);pass++;
 // Changing the reviewed version must change the overview, not leave fixed prose.
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),reg=app.getSourceRegistry();
 reg.ruleVersions.find(v=>v.ruleId==='ordinaryLoanCurrent'&&v.status==='CURRENT').values.maxAmountBaht=1987654;
 const changed=loadMemberEngine(html.replace(/globalThis\.OFFICIAL_SOURCE_REGISTRY=.*?;\n/, 'globalThis.OFFICIAL_SOURCE_REGISTRY='+JSON.stringify(reg)+';\n'));
 assert.match(changed.answer('กู้สามัญ').answer,/1,987,654 บาท/);pass++;
 // Expired evidence disappearing must not displace the valid current version.
 const base=loadMemberEngine(),snapshot=base.getSourceRegistry(),old=snapshot.documents.find(d=>d.id===snapshot.ruleVersions.find(v=>v.domain==='emergencyLoan'&&v.status==='SUPERSEDED').documentId);
 Object.assign(old,{status:'PENDING',mayAffectRules:true,pendingReason:'PRIMARY_LINK_REMOVED'});base.applySourceMonitor(snapshot);
 assert.equal(base.answer('กู้ฉุกเฉิน').decision,'RULE_INFORMATION');pass++;
 // A new amendment, a missing current original, and a changed original still lock.
 const active=snapshot.documents.find(d=>d.title.includes('ฉุกเฉิน')&&d.status==='CURRENT');
 for(const reason of ['PRIMARY_LINK_REMOVED','PRIMARY_DOCUMENT_BYTES_CHANGED']){
  const a=loadMemberEngine(),s=a.getSourceRegistry(),d=s.documents.find(x=>x.id===active.id);
  Object.assign(d,{status:'PENDING',mayAffectRules:true,pendingReason:reason,contentHash:'different-reviewed-bytes'});a.applySourceMonitor(s);assert.equal(a.answer('กู้ฉุกเฉิน').decision,'EVIDENCE_LOCK');pass++;
 }
 for(const pendingReason of ['NEW_OFFICIAL_DOCUMENT','PRIMARY_LINK_REMOVED']){
  const a=loadMemberEngine(),s=a.getSourceRegistry();s.documents.push({id:'fixture-new-emergency-rule',title:'หลักเกณฑ์เงินกู้ฉุกเฉินฉบับใหม่',type:'CRITERIA',originalUrl:'https://www.dlasavingcoop.com/show.php?No=773',affects:['emergencyLoan'],status:'PENDING',mayAffectRules:true,pendingReason,removedNonGoverningBaseline:true});a.applySourceMonitor(s);
  assert.equal(a.answer('กู้ฉุกเฉิน').decision,'EVIDENCE_LOCK');pass++;
 }
 console.log('ANSWER FIRST SERVICES:',pass,'PASS / 0 FAIL; current evidence, context and genuine locks verified');
}
