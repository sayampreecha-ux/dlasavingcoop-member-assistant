import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const app=loadMemberEngine(),snapshot=app.getSourceRegistry();
snapshot.documents.push({id:'fixture-pending-deposit',title:'ระเบียบเงินฝากฉบับใหม่',type:'REGULATION',originalUrl:'https://www.dlasavingcoop.com/show.php?No=99999',affects:['deposits'],status:'PENDING',mayAffectRules:true,pendingReason:'NEW_OFFICIAL_DOCUMENT'});
app.applySourceMonitor(snapshot);
for(const q of ['เงินฝากของผมเท่าไร','เงินฝากของฉันเท่าไหร่','ผมมีเงินฝากเท่าไร','เงินฝากของดิฉันเท่าไรค่ะ']){
 const r=app.answer(q);assert.equal(r.intent,'member_self_service',q);assert.ok(r.actions.some(a=>/member/.test(a[1])),q);assert.doesNotMatch(r.answer,/รหัสผ่าน.*ส่ง|ส่ง.*OTP/);
}
for(const q of ['เปิดบัญชีเงินฝาก','เงินฝากได้ดอกเบี้ยเท่าไร','ผมมีเงินฝากเปิดบัญชีขั้นต่ำเท่าไร'])assert.equal(app.freshnessStatus(q).allowed,false,q);
console.log('PRIVATE DEPOSIT BALANCE: 7 PASS; self-service bypasses rule freshness only for own balance, rule locks retained');
