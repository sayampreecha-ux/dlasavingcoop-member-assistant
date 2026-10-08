import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
import F from '../scripts/official-freshness.js';
let pass=0;
const app=loadMemberEngine(),snapshot=app.getSourceRegistry();
for(const d of snapshot.documents.filter(d=>d.metadataReview?.primaryBytesVerified)){
 d.status='PENDING';d.mayAffectRules=true;d.pendingReason='OFFICIAL_LINK_METADATA_CHANGED';
 d.fingerprint=d.metadataReview.reviewedLinkFingerprints.at(-1);
}
app.applySourceMonitor(snapshot);
// Redemption is 3 million under the reviewed current rule, not the quality-of-life cap.
for(const [q,p]of [['กู้สามัญวงเงินเท่าไร',/2,000,000/],['กู้ฉุกเฉินผ่อนกี่งวด',/15 งวด/],['กู้เพื่อการศึกษาวงเงินเท่าไร',/200,000/],['กู้ภัยพิบัติผ่อนกี่งวด',/120 งวด/],['กู้เคหะวงเงินเท่าไร',/3,000,000/],['กู้รวมหนี้วงเงินเท่าไร',/5,000,000/],['กู้ไถ่ถอนจำนองวงเงินเท่าไร',/3,000,000/],['กู้ฉุกเฉินดอกเบี้ยเท่าไร',/7.50%/]]){assert.match(app.answer(q).answer,p,q);pass++;}
for(const [role,mutation,q]of [['UNCHANGED_REVIEWED_RULE','bytes','กู้สามัญวงเงินเท่าไร'],['UNCHANGED_REVIEWED_RULE','label','กู้สามัญวงเงินเท่าไร'],['APPLICATION_FORM','bytes','กู้เคหะต้องใช้เอกสารอะไร'],['APPLICATION_FORM','label','กู้เคหะต้องใช้เอกสารอะไร']]){
 const a=loadMemberEngine(),s=a.getSourceRegistry(),d=s.documents.find(d=>d.metadataReview?.documentRole===role);
 d.status='PENDING';d.mayAffectRules=true;d.pendingReason='OFFICIAL_LINK_METADATA_CHANGED';
 if(mutation==='bytes')d.contentHash='synthetic-new-unreviewed-bytes';else d.fingerprint='synthetic-new-unreviewed-label';
 a.applySourceMonitor(s);assert.equal(a.answer(q).decision,'EVIDENCE_LOCK');pass++;
}
for(const [title,affects,generic,specific]of [
 ['หลักเกณฑ์เงินกู้สามัญเพื่อปรับโครงสร้างหนี้',['ordinaryLoan'],'กู้สามัญผ่อนกี่งวด','กู้ปรับโครงสร้างหนี้ผ่อนกี่งวด'],
 ['หลักเกณฑ์เงินกู้สามัญไม่เกินทุนเรือนหุ้น',['ordinaryLoan','shares'],'ส่งหุ้นเดือนละเท่าไร','กู้สามัญไม่เกินทุนเรือนหุ้นได้เท่าไร'],
 ['หลักเกณฑ์เงินกู้สามัญกรณีชำระหนี้สหกรณ์ในฐานะผู้ค้ำประกัน',['ordinaryLoan','guarantor'],'กู้สามัญวงเงินเท่าไร','ผู้ค้ำถูกเรียกชำระหนี้แทนผู้กู้']
]){
 const a=loadMemberEngine(),s=a.getSourceRegistry();s.documents.push({id:'synthetic-subtype',title,affects,type:'CRITERIA',status:'PENDING',mayAffectRules:true,originalUrl:'https://www.dlasavingcoop.com/show.php?No=774',linkVerified:true});a.applySourceMonitor(s);
 assert.equal(a.freshnessStatus(generic).allowed,true);assert.equal(a.freshnessStatus(specific).allowed,false);pass+=2;
}
const r=loadMemberEngine().getSourceRegistry(),date=F.asOf('ตอนนี้').date;
r.documents.push({id:'synthetic-association-deposit',title:'ระเบียบว่าด้วยการรับฝากเงินจากสมาคมฌาปนกิจสงเคราะห์',affects:['deposits','welfare'],type:'REGULATION',status:'PENDING',mayAffectRules:true,originalUrl:'https://www.dlasavingcoop.com/show.php?Category=procedure',linkVerified:true});
assert.equal(F.pendingFor(r,['deposits'],date,'ใช้เงินฝากของสมาชิกค้ำกู้สามัญ').length,0);pass++;
assert.equal(F.pendingFor(r,['deposits'],date,'เงินฝากสมาคมฌาปนกิจ').length,1);pass++;
assert.equal(F.pendingFor(r,['deposits'],date,'เงินฝากใช้สิทธิอะไรได้บ้าง').length,1);pass++;
r.documents.push({id:'synthetic-reviewed-archive',title:'หลักเกณฑ์กู้พัฒนาคุณภาพชีวิตเก่า',affects:['qualityOfLife','guarantor'],type:'CRITERIA',status:'PENDING',mayAffectRules:true,pendingReason:'PRIMARY_LINK_REMOVED',removedNonGoverningBaseline:true,originalUrl:'https://www.dlasavingcoop.com/show.php?No=2385',linkVerified:true});
assert.equal(F.pendingFor(r,['qualityOfLife','guarantor'],date,'กู้รวมหนี้หลักประกันอะไร').length,0);pass++;
assert.equal(F.pendingFor(r,['guarantor'],date,'ผู้ค้ำเกษียณ').length,1);pass++;
r.documents.at(-1).removedNonGoverningBaseline=false;
assert.equal(F.pendingFor(r,['qualityOfLife','guarantor'],date,'กู้รวมหนี้หลักประกันอะไร').length,1);pass++;
console.log('REVIEWED INDEX METADATA:',pass,'PASS / 0 FAIL; changed bytes and unknown labels remain locked');
