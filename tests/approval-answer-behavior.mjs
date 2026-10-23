import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
const noop=()=>{};
const element=()=>({value:'',textContent:'',innerHTML:'',className:'',classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,querySelectorAll:()=>[],scrollIntoView:noop});
const document={getElementById:()=>element(),querySelectorAll:()=>[],querySelector:()=>element(),addEventListener:noop};
const env={console,document,window:{},location:{hash:''},setTimeout:f=>{f();return 1},clearTimeout:noop,URL,Date,Math};
vm.createContext(env);vm.runInContext(scripts,env);
const app=env.COOP_APP||env.window.COOP_APP;
assert.equal(typeof app.setApprovalIndex,'function','Answer Engine must accept public verified announcements');
const news=(id,category,title,publishedAt,extra={})=>({
 id,category,title,publishedAt,sourceState:'DIRECT_VERIFIED',
 directSourceUrl:'https://www.dlasavingcoop.com/show.php?No='+id.replace(/\D/g,''),
 ...extra
});
const data=[
 news('official-90001','ordinary-loan','[เงินกู้สามัญ] ผลการอนุมัติเงินกู้ (ตัดรอบเอกสารวันที่ 15 ต.ค. 69)','2026-10-22T03:26:11.000Z',{
  cutOffDate:'2026-10-15',transferDate:'2026-10-30',firstInstallmentMonth:'2026-11-01',
  documentUrl:'https://drive.google.com/file/d/SYNTHETIC_TEST_ONLY/view'}),
 news('official-90002','ordinary-loan','[เงินกู้สามัญ] ผลการอนุมัติเงินกู้ รอบกันยายน','2026-09-22T03:26:11.000Z',{
  cutOffDate:'2026-09-14',transferDate:'2026-09-30',firstInstallmentMonth:'2026-10-01'}),
 news('official-90003','emergency-loan','ผลอนุมัติเงินกู้ฉุกเฉิน','2026-10-19T02:00:00.000Z'),
 news('official-90004','quality-of-life-loan','แจ้งผลอนุมัติเงินกู้พัฒนาคุณภาพชีวิต','2026-10-18T02:00:00.000Z'),
 news('official-90005','welfare','ผลอนุมัติสวัสดิการสมาชิก','2026-10-17T02:00:00.000Z'),
 news('official-90006','membership','ผลอนุมัติสมัครสมาชิก','2026-10-16T02:00:00.000Z'),
 news('official-90007','funeral','ผลอนุมัติฌาปนกิจ','2026-10-15T02:00:00.000Z')
];
assert.equal(app.setApprovalIndex(data,'2026-10-23T00:30:00.000Z'),7);
const cases=[
 ['ผลอนุมัติเงินกู้','90001'],
 ['ผลอนุมัติเงินกู้สามัญล่าสุด','90001'],
 ['กู้สามัญรอบตัดเอกสาร 15 ต.ค. 69 โอนวันไหน','90001'],
 ['เงินกู้สามัญเดือนตุลาคม 2569 ประกาศหรือยัง','90001'],
 ['ขอรายชื่อคนกู้ผ่าน','90001'],
 ['ผลอนุมัติเงินกู้ฉุกเฉินล่าสุด','90003'],
 ['ผลอนุมัติกู้พัฒนาคุณภาพชีวิต','90004'],
 ['ผลอนุมัติสวัสดิการ','90005'],
 ['ผลอนุมัติสมัครสมาชิก','90006'],
 ['ผลอนุมัติฌาปนกิจ','90007'],
 ['กู้สามัญรอบตัดเอกสาร 14 ก.ย. 69 โอนวันไหน','90002'],
 ['ผลอนุมัติเงินกู้สามัญรอบ ก.พ. 68',null]
];
let pass=0;
for(const [q,id] of cases){
 const answer=app.answer(q);
 const isLoan=/เงินกู้|กู้/.test(q);
 if(isLoan){
  assert.equal(answer.intent,'approval_announcement','loan intent: '+q);
  if(id){
   assert.ok(answer.actions.some(([_,url])=>url.endsWith('No='+id)),'correct notice action: '+q);
   assert.ok(answer.answer.includes('ข้อมูลตรวจสอบล่าสุด'),'freshness: '+q);
  }else assert.match(answer.answer,/ยังไม่พบประกาศตรงประเภทและรอบ/,'safe no-verified-notice: '+q);
 }else assert.notEqual(answer.intent,'approval_announcement','preserve existing nonloan routing: '+q);
 assert.doesNotMatch(answer.answer,/คุณได้รับอนุมัติแล้ว|โอนเงินให้คุณเรียบร้อยแล้ว/,'no individual promise: '+q);
 pass++;
}
const emergencyTransfer=app.answer('ยื่นกู้ฉุกเฉินแล้วโอนวันไหน');
assert.equal(emergencyTransfer.domain,'emergencyLoanCurrent','emergency transfer must use emergency loan rules, not approval index');
assert.notEqual(emergencyTransfer.intent,'approval_announcement');
const ordinary=app.answer('ผลอนุมัติเงินกู้สามัญล่าสุด');
assert.match(ordinary.answer,/15 ตุลาคม 2569/);
assert.match(ordinary.answer,/30 ตุลาคม 2569/);
assert.match(ordinary.answer,/พฤศจิกายน 2569/);
assert.match(ordinary.answer,/ไม่ใช่หลักฐานว่าโอนสำเร็จ/);
assert.ok(ordinary.actions.some(([_,url])=>url.includes('drive.google.com/file/d/')),'original attachment navigation');
const first=app.conversationTurn('ผลอนุมัติเงินกู้สามัญล่าสุด');
const follow=app.conversationTurn('แล้วเริ่มหักเดือนไหน',first.state,{continuation:true});
assert.equal(follow.result.intent,'approval_announcement');
assert.match(follow.result.answer,/พฤศจิกายน 2569/);
pass++;
const personal=app.answer('กู้ของผมอนุมัติหรือยัง');
assert.doesNotMatch(personal.answer,/คุณได้รับอนุมัติแล้ว/);
assert.ok(!data.some(x=>x.memberId||x.accountNumber||x.memberName),'fixture contains no personal fields');
pass++;
console.log('APPROVAL_ANSWER_BEHAVIOR '+JSON.stringify({pass,fail:0,scope:'synthetic public metadata + actual Answer Engine/conversationTurn'}));
