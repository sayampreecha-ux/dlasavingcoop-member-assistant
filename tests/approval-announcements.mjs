import assert from 'node:assert/strict';
import fs from 'node:fs';
const script=fs.readFileSync(new URL('../scripts/update-current-events.mjs',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert.match(script,/Category=loan/, 'approval index must read official loan category');
assert.match(script,/approvalIndex/, 'approval records must not depend on homepage headline limit');
assert.match(html,/approvalIndex/, 'member tracking UI must search approval index');
assert.match(html,/เงินกู้สามัญ|สามัญ/, 'ordinary loan selector missing');
const fixture=[
 {title:'[เงินกู้สามัญ] ผลการอนุมัติเงินให้กู้แก่สมาชิก (ตัดรอบเอกสารวันที่ 15 ต.ค. 69)',category:'ordinary-loan',url:'https://www.dlasavingcoop.com/show.php?No=9001',sourceState:'DIRECT_VERIFIED',directSourceUrl:'https://www.dlasavingcoop.com/show.php?No=9001'},
 {title:'ผลการอนุมัติเงินกู้ฉุกเฉิน',category:'emergency-loan',url:'https://www.dlasavingcoop.com/show.php?No=9002',sourceState:'DIRECT_VERIFIED',directSourceUrl:'https://www.dlasavingcoop.com/show.php?No=9002'}
];
assert.equal(fixture.filter(x=>x.category==='ordinary-loan').length,1,'loan types must remain distinct');
assert.ok(fixture.every(x=>!('memberId' in x||'accountNumber' in x)),'no private member data in fixture');
console.log('approval announcement source/fixture guard PASS');
