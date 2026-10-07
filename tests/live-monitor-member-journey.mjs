import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
import F from '../scripts/official-freshness.js';

// Synthetic public scenarios, independently checking the practical next step.
// Reproduce asynchronous monitor locks; the earlier release tests only used bundled state.
export function journeyMonitor(app){
 const r=app.getSourceRegistry();
 const fixture=(id,title,affects)=>({id,title,affects,type:'REGULATION',status:'PENDING',mayAffectRules:true,originalUrl:'https://www.dlasavingcoop.com/show.php?No=775',officialIndexUrl:'https://www.dlasavingcoop.com/show.php?Category=procedure',linkVerified:true,pendingReason:'NEW_OFFICIAL_DOCUMENT'});
 r.documents.push(fixture('fixture-funeral-deposit','ระเบียบว่าด้วยการรับฝากเงินจากสมาคมฌาปนกิจสงเคราะห์ พ.ศ. 2569',['deposits','welfare']));
 r.documents.push(fixture('fixture-vacation','หลักเกณฑ์เงินกู้สามัญเพื่อการพักผ่อน พ.ศ. 2569',['ordinaryLoan']));
 r.documents.push(fixture('fixture-emergency','ระเบียบเงินกู้ฉุกเฉินฉบับแก้ไขเพิ่มเติม',['emergencyLoan']));
 return r;
}
export const scenarios=[
 ['อยากกู้เงินแต่ไม่รู้ต้องเลือกแบบไหน',/ประเภท|วัตถุประสงค์/],
 ['ส่งฉุกเฉินไป 2 งวด กู้ใหม่ได้ไหม',/ยืนยัน|หลักเกณฑ์/],
 ['น้ำท่วมบ้านต้องขอสวัสดิการยังไง',/ประสบภัย|สาธารณภัย/],
 ['ผู้ค้ำเกษียณแล้วค้ำต่อได้ไหม',/ค้ำ|เกษียณ/],
 ['เงินเดือน 32000 ต้องส่งหุ้นเดือนละเท่าไหร่',/130 หุ้น|1,300/],
 ['ย้ายไปทำงานอีกจังหวัด ต้องแจ้งอะไรบ้าง',/ต้นสังกัด|โอนสมาชิก/],
 ['สมัครฌาปนกิจต้องทำอะไรบ้าง',/สมัคร/],
 ['ปันผลปีนี้จะเข้าวันไหน',/ปันผล/],
 ['ขอแบบฟอร์มกู้ฉุกเฉิน',/แบบคำขอ.*ฉุกเฉิน/],
 ['โอนเงินฝากแล้วแต่ยอดยังไม่ขึ้น ต้องทำยังไง',/หลักฐานการโอน|บันทึกรายการ/],
 ['ประกันชีวิตเงินกู้ขอคืนเงินได้ไหม',/กรมธรรม์|เวนคืน/],
 ['ขอเบอร์เจ้าหน้าที่เงินฝาก',/092-391-5896/],
 ['ยอดหุ้นของผมเท่าไหร่',/ข้อมูล|สมาชิก/],
 ['ลืมรหัสผ่าน เข้าระบบสมาชิกไม่ได้',/กู้คืน/],
 ['ผลอนุมัติวันนี้ออกหรือยัง',/สถานะ|ประกาศ/],
 ['ขอรายละเอียดเพิ่มเติม',/เรื่องใด|ประเภท/],
 ['ชำระเงินค่าหุ้นต้องโอนไปไหน',/ชำระ|นำส่ง/],
 ['ยื่นกู้ผ่านแน่นอนไหม ถ้าให้รหัสผ่านจะตรวจให้ได้ไหม',/อย่าส่งรหัสผ่าน/],
 ['ขอรายละเอียดเพิ่มเติม','เป็นเรื่องสวัสดิการ',/สวัสดิการประเภทใด/],
 ['ผ่อนได้กี่งวด','กู้สามัญ',/240 งวด/],
 ['ขอสวัสดิการบุตร','คลอดบุตร',/คลอด/],
 ['ย้ายไปทำงานอีกจังหวัด ต้องแจ้งอะไรบ้าง','ย้ายต้นสังกัด',/สำเนาคำสั่ง/],
 ['เรื่องเงินกู้',/ประเภท/],['สวัสดิการ',/ประเภท/],
 ['แบบฟอร์ม',/แบบฟอร์ม|แบบ/],['ข้อมูลส่วนตัวของฉัน',/สมาชิก|ข้อมูล/]
];
if(process.argv[1]===new URL(import.meta.url).pathname){
 const app=loadMemberEngine();app.applySourceMonitor(process.env.MEMBER_MONITOR_FILE?JSON.parse(fs.readFileSync(process.env.MEMBER_MONITOR_FILE)):journeyMonitor(app));
 let count=0;
 for(const row of scenarios){const [q,nextOrExpected,last]=row;let turn=app.conversationTurn(q);
  if(last){assert.ok(turn.result.followups.includes(nextOrExpected),'missing actual choice: '+q);turn=app.conversationTurn(nextOrExpected,turn.state,{continuation:true});}
  const r=turn.result,text=[r.answer,...r.details||[]].join(' ');assert.match(text,last||nextOrExpected,q);assert.ok(r.actions?.length||r.followups?.length,'dead end '+q);
  if(/น้ำท่วม|สวัสดิการ/.test(q))assert.doesNotMatch(text,/รับฝากเงิน.*ฌาปนกิจ/);
  if(/ประกันชีวิต/.test(q))assert.doesNotMatch(text,/ระเบียบเงินกู้ฉุกเฉิน/);
  if(/ยอดหุ้นของผม|ยอดยังไม่ขึ้น|รหัสผ่าน/.test(q))assert.ok(r.actions.some(x=>x[1]==='https://member.dlasavingcoop.com/coop/'));
  if(q==='ขอแบบฟอร์มกู้ฉุกเฉิน')assert.ok(r.actions.some(x=>/1w1_mMEJ2SLFlPDypcZDRMb8w3Wa2Bf7Y/.test(x[1])));
  if(q==='ขอแบบฟอร์มกู้ฉุกเฉิน'||q==='อยากกู้เงินแต่ไม่รู้ต้องเลือกแบบไหน')assert.doesNotMatch(JSON.stringify([r.actions,r.sources]),/1QQo5g|No=774|งานเงินกู้สามัญ/,'footer must not infer ordinary loan');
  if(q.includes('ย้าย')&&last)assert.doesNotMatch(r.answer,/ต้องแยกก่อน|หมายถึง.*ย้ายต้นสังกัด/);
  count++;
 }
 const reg=journeyMonitor(loadMemberEngine()),now=new Date(reg.lastSyncAt);
 assert.equal(F.gate(reg,'เงินฝากใช้สิทธิอะไรได้บ้าง',{now}).allowed,false,'funeral deposit lock preserved for deposits');
 assert.equal(F.gate(reg,'กู้สามัญเพื่อการพักผ่อนผ่อนได้กี่งวด',{now}).allowed,false,'specific vacation lock preserved');
 assert.equal(app.answer('กู้ฉุกเฉินผ่อนได้กี่งวด').decision,'EVIDENCE_LOCK','rule requests stay locked');
 console.log('LIVE MONITOR JOURNEY:',count,'PASS / 0 FAIL; 3 scope safety checks PASS');
}
