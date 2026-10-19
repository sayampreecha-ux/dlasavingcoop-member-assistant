// Public synthetic member scenarios: actual rendered answers, both viewport sizes.
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname),evidence=path.join(root,'loan-scenario-browser-evidence',process.env.MEMBER_APP_URL?'production':'local');fs.mkdirSync(evidence,{recursive:true});
let server,url=process.env.MEMBER_APP_URL;
if(!url){server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),f=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!f.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.json')?'application/json':'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+'/';}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']}),results=[];
const exact='กู้พัฒนาคุณภาพแล้วส่งมา1งวดสามารถกู้ฉุกเฉินได้เลยไหม';
async function record(p,width,id,fn){const row={width,id,status:'PASS'};try{await fn(row);}catch(e){row.status='FAIL';row.error=e.message;}await p.screenshot({path:path.join(evidence,width+'-'+id+'.png'),fullPage:true});results.push(row);console.log('LOAN_SCENARIO_UI',JSON.stringify(row));}
try{for(const width of [390,1365]){
 const p=await browser.newPage({viewport:{width,height:900}}),errors=[];p.on('pageerror',e=>errors.push(String(e)));await p.goto(url,{waitUntil:'networkidle'});
 const ask=async q=>{await p.locator('#homeBtn').click();await p.locator('#q').fill(q);await p.locator('#q').press('Enter');return p.locator('#out .body').innerText();};
 for(const n of [0,1,2,3,4])await record(p,width,'quality-'+n,async row=>{row.question=n===1?exact:'กู้พัฒนาคุณภาพส่งแล้ว'+n+'งวดกู้ฉุกเฉินได้ไหม';row.answer=await ask(row.question);assert.match(row.answer,n<3?/ยังไม่ผ่าน/:/ผ่านเฉพาะ/);assert.match(row.answer,/5\s*\(4\)/);if(n<3)assert.match(row.answer,new RegExp('อีก '+(3-n)+' งวด'));assert.doesNotMatch(row.answer,/ต้องการถามคุณสมบัติ/);row.links=await p.locator('#out a').evaluateAll(as=>as.map(a=>a.getAttribute('href')));assert.ok(row.links.some(x=>x?.includes('1XZYfuXWgzqWp6K_Ld0aosuO58pxKXU5p')));assert.ok(await p.locator('#out > .actions a').count()<=3);});
 for(const [id,q,re]of [['quality-target','กู้สามัญส่งแล้ว1งวดขอกู้พัฒนาคุณภาพชีวิตได้ไหม',/หักกลบ.*ทุกประเภท/],['ordinary-after-restructure','กู้ปรับโครงสร้างหนี้ส่งแล้ว1งวดขอกู้สามัญได้ไหม',/24 งวด.*ยังไม่ผ่าน/],['ordinary-cross','กู้สามัญส่งแล้ว3งวดกู้ฉุกเฉินได้ไหม',/ผ่านเฉพาะ/],['restructured','กู้ปรับโครงสร้างหนี้ส่งแล้ว3งวดกู้ฉุกเฉินได้ไหม',/12 งวด.*อีก 9 งวด/],['reverse','ขอกู้ฉุกเฉินได้ไหม มีกู้เคหะส่งแล้ว1งวด',/อีก 2 งวด/],['arrears','กู้สามัญค้าง1งวดกู้ฉุกเฉินได้ไหม',/ยังไม่ผ่าน/],['quality-block','กู้พัฒนาคุณภาพชีวิตส่งแล้ว4งวดกู้เคหะได้ไหม',/เฉพาะเงินกู้ฉุกเฉิน/],['unknown-pair','กู้เคหะส่งแล้ว3งวดกู้เพื่อการศึกษาได้ไหม',/ยังยืนยัน.*ไม่ได้/]])await record(p,width,id,async row=>{row.question=q;row.answer=await ask(q);assert.match(row.answer,re);});
 await record(p,width,'correction-history',async row=>{await ask(exact);for(const [q,re]of [['แก้เป็น3งวด',/ผ่านเฉพาะ/],['เปลี่ยนเป็น1งวด',/อีก 2 งวด/]]){await p.locator('#out .follow-input input').fill(q);await p.locator('#out .follow-input button').click();row.answer=await p.locator('#out .body').innerText();assert.match(row.answer,re);}assert.ok(await p.locator('#readingHistory .body').count()>=2);});
 await record(p,width,'missing-fact',async row=>{row.answer=await ask('กู้เคหะอยู่กู้ฉุกเฉินได้ไหม');assert.match(row.answer,/เคหะชำระแล้วกี่งวด/);await p.locator('#out .follow-input input').fill('3 งวด');await p.locator('#out .follow-input button').click();row.answer=await p.locator('#out .body').innerText();assert.match(row.answer,/ผ่านเฉพาะ/);});
 await record(p,width,'target-followups',async row=>{await ask(exact);for(const [q,re]of [['แล้วผ่อนได้กี่งวด',/15 งวด/],['ต้องใช้เอกสารอะไร',/คำขอ|เอกสาร/]]){await p.locator('#q').fill(q);await p.locator('#q').press('Enter');row.answer=await p.locator('#out .body').innerText();assert.match(row.answer,re);assert.doesNotMatch(row.answer,/เอกสารกู้พัฒนาคุณภาพชีวิต|360 งวด/);}});
 await record(p,width,'unchanged-services',async row=>{for(const [q,re]of [['กู้สามัญวงเงินเท่าไร',/2,000,000/],['กู้ฉุกเฉินวงเงินเท่าไร',/60,000/],['ฝากพิเศษเปิดบัญชีขั้นต่ำเท่าไร',/500 บาท/],['หุ้นรายเดือนส่งได้สูงสุดเท่าไร',/5,000/],['กู้ในฐานะผู้ค้ำประกันดอกเบี้ยเท่าไร',/2\.00/]])assert.match(await ask(q),re,q);await p.locator('#homeBtn').click();assert.ok(await p.getByRole('button',{name:'🧮 ประเมินเงินกู้',exact:true}).isVisible());row.errors=errors;assert.deepEqual(errors,[]);});

 // Production-facing first answer must show rule-specific facts *without expanding details*.
 for(const [id,q,re]of [
  ['answer-first-01','ผมเป็นสมาชิก 8 เดือน ส่งหุ้นต่อเนื่อง 8 เดือน ขอเงินกู้สามัญ 200,000 บาทได้ไหม',/8 เดือน|8 งวด/],
  ['answer-first-02','ผมส่งหุ้นต่อเนื่อง 11 เดือน มีหุ้นสะสม 50,000 บาท ขอสามัญ 300,000 บาทได้ไหม',/11 งวด.*12 งวด/],
  ['answer-first-03','ส่งหุ้นต่อเนื่อง 12 เดือน มีหุ้นสะสม 29,999 บาท ขอสามัญ 300,000 บาท ต้องทำอย่างไร',/29,999.*30,000|ขาด 1 บาท/],
  ['answer-first-04','ส่งหุ้นต่อเนื่อง 12 เดือน มีหุ้นสะสม 30,000 บาท ขอสามัญ 300,000 บาท หุ้นพอไหม',/30,000/],
  ['answer-first-05','ส่งหุ้นต่อเนื่อง 12 เดือน หุ้นสะสม 40,000 บาท ขอสามัญ 500,001 บาท ได้ไหม',/40,000|50,000/]
 ])await record(p,width,id,async row=>{row.question=q;row.answer=await ask(q);assert.match(row.answer,re,id);assert.match(row.answer,/✓|✗|\\? /,id+' no concise status');});
 // Re-run all sixteen live-simulation turns with independently specified expectations.
 const turn=async(q,fresh)=>{if(fresh)await p.locator('#homeBtn').click();await p.locator('#q').fill(q);await p.locator('#q').press('Enter');return p.locator('#out .body').innerText();};
 const simulation=[
  ['T01',exact,true,/อีก 2 งวด/],
  ['T02','แก้เป็น3งวด',false,/ผ่านเฉพาะ/],
  ['T03','แล้วผ่อนได้กี่งวด',false,/15 งวด/],
  ['T04','ต้องใช้เอกสารอะไร',false,/เอกสารกู้ฉุกเฉิน/],
  ['T05','กู้เคหะอยู่กู้ฉุกเฉินได้ไหม',true,/เคหะชำระแล้วกี่งวด/],
  ['T06','3 งวด',false,/ผ่านเฉพาะ/],
  ['T07','กู้ปรับโครงสร้างหนี้ส่งแล้ว11งวดกู้ฉุกเฉินได้ไหม',true,/12 งวด.*อีก 1 งวด/],
  ['T08','แก้เป็น12งวด',false,/ผ่านเฉพาะ.*12 งวด.*4 \(5\) หน้า 1/],
  ['T09','กู้พัฒนาคุณภาพชีวิตส่งแล้ว4งวด ขอกู้สามัญได้ไหม',true,/เฉพาะเงินกู้ฉุกเฉิน/],
  ['T10','กู้สามัญส่งแล้ว1งวด ขอกู้พัฒนาคุณภาพชีวิตได้ไหม',true,/หักกลบ.*ทุกประเภท/],
  ['T11','กู้เคหะส่งแล้ว3งวด ขอกู้เพื่อการศึกษาได้ไหม',true,/ยังยืนยัน.*ไม่ได้/],
  ['T12','กู้ฉุกเฉินได้ไหมครับ ผมมีสามัญส่งไปแล้ว 3 งวด',true,/ผ่านเฉพาะ/],
  ['T13','กู้คุณภาพชีวิตอยู่ ส่งไปแล้วงวดเดียว อยากกู้ฉุกเฉินต่อได้ป่าวครับ',true,/ชำระแล้ว 1 งวด.*อีก 2 งวด.*5 \(4\)/],
  ['T14','กู้สามัญส่งแล้ว3งวด เงินเหลือ1000บาท ขอกู้ฉุกเฉินได้ไหม',true,/ต่ำกว่าเกณฑ์ 3000.*4 \(3\)/],
  ['T15','กู้พัฒนาคุณภาพ ส่งมาเดือนเดียว กู้ฉุกเฉินได้มั้ย',true,/หมายถึง.*ชำระจริงแล้ว 1 งวด.*ใช่ไหม/],
  ['T16','กู้สามัญส่งแล้ว3งวด และกู้เคหะส่งแล้ว1งวด ขอกู้ฉุกเฉินได้ไหม',true,/เคหะ.*อีก 2 งวด/]
 ];
 for(const [id,q,fresh,re]of simulation)await record(p,width,'simulation-'+id,async row=>{row.question=q;row.expected=String(re);row.answer=await turn(q,fresh);assert.match(row.answer,re);if(['T03','T04'].includes(id))assert.doesNotMatch(row.answer,/ต้องการถามคุณสมบัติ เอกสาร หรือสถานะ/);if(id==='T08')assert.doesNotMatch(row.answer,/3 งวดตามเกณฑ์ทั่วไป/);if(id==='T13'){assert.doesNotMatch(row.answer,/ชำระแล้วกี่งวด/);row.links=await p.locator('#out a').evaluateAll(as=>as.map(a=>a.getAttribute('href')));assert.ok(row.links.some(x=>x?.includes('1XZYfuXWgzqWp6K_Ld0aosuO58pxKXU5p')));}});
 await record(p,width,'month-confirm-correct',async row=>{row.answers=[];for(const [q,fresh,re]of [['กู้พัฒนาคุณภาพส่งมาเดือนเดียวกู้ฉุกเฉินได้ไหม',true,/หมายถึง.*1 งวด.*ใช่ไหม/],['ไม่ใช่ครับ',false,/ชำระจริงแล้วกี่งวด/],['หนึ่งงวด',false,/อีก 2 งวด/],['แก้เป็น3งวด',false,/ผ่านเฉพาะ/]]){const answer=await turn(q,fresh);row.answers.push({question:q,answer,expected:String(re)});assert.match(answer,re);}await turn('กู้พัฒนาคุณภาพส่งมาเดือนเดียวกู้ฉุกเฉินได้ไหม',true);row.answer=await turn('ใช่ครับ',false);assert.match(row.answer,/อีก 2 งวด/);});
 for(const paid of ['หนึ่งงวด','1งวด','๑งวด'])await record(p,width,'spoken-'+paid,async row=>{row.question='กู้สามัญส่งแล้ว'+paid+'กู้ฉุกเฉินได้ไหม';row.answer=await turn(row.question,true);assert.match(row.answer,/อีก 2 งวด/);});
 await record(p,width,'restructure-13',async row=>{row.answer=await turn('กู้ปรับโครงสร้างหนี้ส่งแล้ว13งวดกู้ฉุกเฉินได้ไหม',true);assert.match(row.answer,/ผ่านเฉพาะ.*12 งวด.*4 \(5\)/);});
 await record(p,width,'arrears-correction',async row=>{await turn('กู้สามัญส่งแล้ว3งวดแต่ค้างหนึ่งงวดกู้ฉุกเฉินได้ไหม',true);row.answer=await turn('แก้เป็น4งวด',false);assert.match(row.answer,/ยังไม่ผ่าน.*ค้าง/);});
 await p.close();
}}
finally{fs.writeFileSync(path.join(evidence,'results.json'),JSON.stringify({sha:process.env.GITHUB_SHA||null,url,results},null,2));await browser.close();if(server)await new Promise(r=>server.close(r));}
console.log('LOAN_SCENARIO_BROWSER_ACCEPTANCE',JSON.stringify({total:results.length,failed:results.filter(x=>x.status==='FAIL').length}));process.exitCode=results.some(x=>x.status==='FAIL')?1:0;
