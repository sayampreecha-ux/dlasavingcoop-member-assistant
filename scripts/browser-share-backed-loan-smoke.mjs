// Public synthetic questions only. Physical UI entry, desktop/mobile, real monitor
// plus separately labelled slow/failed/changed-monitor fixtures on a local server.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);
const evidence=path.join(root,'share-loan-browser-evidence',process.env.MEMBER_APP_URL?'production':'local');
fs.mkdirSync(evidence,{recursive:true});
let server,url=process.env.MEMBER_APP_URL;
if(!url){server=http.createServer((req,res)=>{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),f=path.resolve(root,'.'+(p==='/'?'/index.html':p));if(!f.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.json')?'application/json':'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+'/';}
const source='1347L0hE1IddgM1ab6oheXQPgKpUTMasa';
const cases=[
 ['SC01','กู้ทุนเรือนหุ้นได้เท่าไร',/90%/],['SC02','กู้ไม่เกินทุนเรือนหุ้น',/240 งวด/],['SC03','กู้หุ้น',/90%/],
 ['SC04','กู้สามัญไม่เกินทุนเรือนหุ้นได้เท่าไร',/90%/],['SC05','กู้สามัญใช้ทุนเรือนหุ้นเป็นหลักประกัน',/ยังไม่ระบุจำนวนผู้ค้ำ/],
 ['SC06','กู้ไม่เกินทุนเรือนหุ้นต้องเป็นสมาชิกกี่เดือน',/6 เดือน/],['SC07','กู้ทุนเรือนหุ้นผ่อนได้กี่งวด',/240 งวด.*75 ปี/],
 ['SC08','กู้ทุนเรือนหุ้นต้องใช้เอกสารอะไร',/ย้อนหลัง 3 เดือน/],['SC09','กู้ทุนเรือนหุ้นดอกเบี้ยเท่าไร',/7\.50% ต่อปี/],
 ['SC10','กู้ไม่เกินทุนเรือนหุ้นและเงินฝาก',/ยังไม่มีหลักฐาน.*เงินฝากมารวม/],
 ['boundary','กู้หุ้น มีหุ้น 100000 บาท กู้ได้เท่าไร',/90,000 บาท/],
 ['income','กู้หุ้น เงินเดือน 50000 บาท เงินเหลือ 6000 บาท',/อย่างน้อย 7,500 บาท/],
 ['historical','กู้หุ้น วันที่ 30 กันยายน 2569 วงเงินเท่าไร',/ยังยืนยันกฎที่มีผลในช่วงเวลาที่ถามไม่ได้/]
];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']}),results=[];
const record=async(page,width,id,fn)=>{const row={width,id,status:'PASS'};try{await fn(row);}catch(e){row.status='FAIL';row.error=e.message;}await page.screenshot({path:path.join(evidence,`${width}-${id}.png`),fullPage:true});results.push(row);console.log('SHARE_LOAN_UI',JSON.stringify(row));};
try{for(const width of [390,1365]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.goto(url,{waitUntil:'networkidle'});
 const ask=async q=>{await page.locator('#homeBtn').click();await page.locator('#q').fill(q);await page.locator('#q').press('Enter');return page.locator('#out .body').innerText();};
 await record(page,width,'SC11-menu',async row=>{await ask('เงินกู้มีกี่แบบ');const button=page.locator('#out .follow button').getByText('กู้ไม่เกินทุนเรือนหุ้น',{exact:true});assert.equal(await button.count(),1);await button.click();row.answer=await page.locator('#out .body').innerText();assert.match(row.answer,/90%/);assert.equal(await page.locator('#out .follow button').getByText('กู้ทุนเรือนหุ้นต้องใช้เอกสารอะไร',{exact:true}).count(),1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'No horizontal overflow');});
 for(const [id,q,re]of cases)await record(page,width,id,async row=>{row.question=q;row.answer=await ask(q);assert.match(row.answer,re);assert.doesNotMatch(row.answer,/2,000,000|undefined|NaN|อนุมัติแล้ว/);row.links=await page.locator('#out a').evaluateAll(as=>as.map(a=>({text:a.textContent,href:a.getAttribute('href')})));assert.ok(row.links.some(a=>a.href.includes(source)));if(id==='SC08')assert.match(row.answer,/แบบเดิม|แบบยังใช้ชื่อ/);if(id==='SC09')assert.ok(row.links.some(a=>a.href.includes('1ow2w4RsRBE-Kd2n6uX3_kWSLUFoJVQMw')));});
 await record(page,width,'continuation',async row=>{await ask('กู้ทุนเรือนหุ้นได้เท่าไร');for(const [q,re]of [['แล้วกี่งวด',/240 งวด/],['ใช้เอกสารอะไร',/ย้อนหลัง 3 เดือน/]]){await page.locator('#q').fill(q);await page.locator('#q').press('Enter');row.answer=await page.locator('#out .body').innerText();assert.match(row.answer,re);}assert.ok(await page.locator('#readingHistory .body').count()>=2,'Earlier answers stay available');});
 await record(page,width,'negative-controls',async row=>{assert.match(await ask('กู้สามัญวงเงินเท่าไร'),/2,000,000/);assert.match(await ask('กู้ฉุกเฉินวงเงินเท่าไร'),/60,000/);assert.match(await ask('หุ้นรายเดือนส่งได้สูงสุดเท่าไร'),/5,000/);row.answer=await ask('กู้หุ้นของผมอนุมัติหรือยัง');assert.match(row.answer,/ไม่ตรวจ.*ผลอนุมัติรายบุคคล/);assert.ok(await page.locator('#out a[href="https://member.dlasavingcoop.com/coop/"]').count());assert.deepEqual(errors,[]);});
 await page.close();
 if(server){
  for(const mode of ['failed','delayed-change']){
   const p=await browser.newPage({viewport:{width,height:900}});let release,delivered;
   const ready=new Promise(r=>{delivered=r;}),held=new Promise(r=>{release=r;});
   await p.route('**/official-source-monitor.json',async route=>{if(mode==='failed')return route.abort();await held;const snap=JSON.parse(fs.readFileSync(path.join(root,'data/official-source-registry.json'))),d=snap.documents.find(d=>d.originalUrl.includes(source));Object.assign(d,{status:'PENDING',mayAffectRules:true,pendingReason:'PRIMARY_DOCUMENT_BYTES_CHANGED',contentHash:'synthetic-unreviewed-bytes'});await route.fulfill({json:snap});delivered();});
   await p.goto(url,{waitUntil:'domcontentloaded'});
   await record(p,width,'monitor-'+mode,async row=>{await p.locator('#q').fill('กู้สามัญไม่เกินทุนเรือนหุ้นได้เท่าไร');await p.locator('#q').press('Enter');row.before=await p.locator('#out .body').innerText();assert.match(row.before,/90%/);assert.doesNotMatch(row.before,/2,000,000/);if(mode==='delayed-change'){release();await ready;await p.waitForFunction(()=>COOP_APP.answer('กู้หุ้นได้เท่าไร').decision==='EVIDENCE_LOCK');await p.locator('#q').fill('กู้ทุนเรือนหุ้นได้เท่าไร');await p.locator('#q').press('Enter');row.after=await p.locator('#out .body').innerText();assert.match(row.after,/กำลังยืนยันผลกระทบ/);assert.doesNotMatch(row.after,/2,000,000|90%/);}});
   release();await p.close();
  }
 }
}}
finally{fs.writeFileSync(path.join(evidence,'results.json'),JSON.stringify({head:process.env.GITHUB_SHA||null,url,results},null,2));await browser.close();if(server)await new Promise(r=>server.close(r));}
const failed=results.filter(r=>r.status==='FAIL');console.log('SHARE_LOAN_BROWSER_ACCEPTANCE',JSON.stringify({total:results.length,failed:failed.length}));process.exitCode=failed.length?1:0;
