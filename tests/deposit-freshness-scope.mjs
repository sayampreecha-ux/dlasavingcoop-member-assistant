import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const app=loadMemberEngine(),snapshot=app.getSourceRegistry();
const association={id:'synthetic-pending-association-deposit',title:'ระเบียบว่าด้วยการรับฝากเงินจากสมาคมฌาปนกิจสงเคราะห์ พ.ศ. 2569',affects:['deposits','welfare'],type:'REGULATION',status:'PENDING',mayAffectRules:true,originalUrl:'https://www.dlasavingcoop.com/show.php?Category=procedure',linkVerified:true};
snapshot.documents.push(association);app.applySourceMonitor(snapshot);
for(const [q,p] of [['เปิดบัญชีเงินฝากออมทรัพย์พิเศษยังไง',/500 บาท/],['ฝากพิเศษฝากเพิ่มยังไง',/7196/],['ฝากพิเศษถอนเงินได้ไหม',/ค่าธรรมเนียม/],['ปิดบัญชีฝากพิเศษต้องใช้อะไร',/เล่มสีเขียว/]]){assert.match(app.answer(q).answer,p);assert.match(app.conversationTurn(q,{}).result.answer,p);}
assert.equal(app.freshnessStatus('เงินฝากสมาคมฌาปนกิจ').allowed,false);
assert.equal(app.freshnessStatus('เงินฝากใช้สิทธิอะไรได้บ้าง').allowed,false);
const next=app.getSourceRegistry();next.documents.push({...association,id:'synthetic-member-deposit-change',title:'ระเบียบเงินฝากออมทรัพย์พิเศษฉบับใหม่',affects:['deposits']});app.applySourceMonitor(next);
assert.equal(app.answer('เปิดบัญชีเงินฝากออมทรัพย์พิเศษยังไง').decision,'EVIDENCE_LOCK');
console.log('DEPOSIT FRESHNESS SCOPE: 11 PASS / 0 FAIL; association remains locked; member rule changes remain locked');
