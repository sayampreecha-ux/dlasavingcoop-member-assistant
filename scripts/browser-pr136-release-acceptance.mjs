// Supplemental release coverage: physical UI input, unmodified asynchronous monitor,
// both viewports. Public synthetic questions only; no personal member records.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=process.cwd(), output=path.join(root,'pr136-browser-evidence');fs.mkdirSync(output,{recursive:true});
const cases=[
 // Exact questions reported by the owner; these must be answered, not blanket evidence-locked.
 ['owner-leisure-amount','เงินกู้สามัญเพื่อพักผ่อน กู้ได้เท่าไร',[/300,000 บาท/],/ต้องยืนยันหลักฐาน|กำลังยืนยันผลกระทบ|ยังยืนยันกฎที่มีผล/],
 ['owner-emergency-membership','เงินกู้ฉุกเฉินต้องเป็นสมาชิกกี่เดือน',[/3 เดือน/],/ต้องยืนยันหลักฐาน|กำลังยืนยันผลกระทบ|ยังยืนยันกฎที่มีผล/],
 ['owner-share-rule','หุ้นสหกรณ์ส่งได้สูงสุดเดือนละเท่าไร',[/5,000 บาท/],/ต้องยืนยันหลักฐาน|กำลังยืนยันผลกระทบ|ยังยืนยันกฎที่มีผล/],
 ['owner-welfare-childbirth','สวัสดิการคลอดบุตรได้เท่าไร',[/1,000 บาท/],/ต้องยืนยันหลักฐาน|กำลังยืนยันผลกระทบ|ยังยืนยันกฎที่มีผล/],
 ['ordinary','กู้สามัญ',[/2,000,000 บาท/,/240 งวด/,/2026-10-01/,/ไม่ถือว่า/]],
 ['emergency','กู้ฉุกเฉิน',[/30,000 บาท/,/60,000 บาท/,/15 งวด/,/2026-10-01/]],
 ['special','กู้เคหะต้องทำอย่างไร',[/3,000,000 บาท/,/5,000,000 บาท/,/360 งวด/]],
 ['education','กู้เพื่อการศึกษา',[/200,000 บาท/,/60 งวด/,/2,000,000 บาท/,/2026-10-01/]],
 ['disaster','กู้ภัยพิบัติ',[/300,000 บาท/,/120 งวด/,/180 วัน/,/2,000,000 บาท/]],
 ['guarantor','กู้เพื่อชำระหนี้ในฐานะผู้ค้ำประกัน',[/ผู้ค้ำประกัน/],/อนุมัติแล้ว|กู้ได้แน่นอน/],
 ['restructure','ปรับโครงสร้างหนี้',[/ปรับโครงสร้างหนี้/,/ตรวจ/],/อนุมัติแล้ว|กู้ได้แน่นอน/],
 ['shares','กู้สามัญใช้ทุนเรือนหุ้นเป็นหลักประกัน',[/ทุนเรือนหุ้น/,/ยังไม่มีหลักเกณฑ์เฉพาะ/],/90%|2,000,000/],
 ['shares-reverse','กู้สามัญใช้หลักประกันเป็นทุนเรือนหุ้น',[/ทุนเรือนหุ้น/,/ยังไม่มีหลักเกณฑ์เฉพาะ/],/90%|2,000,000/],
 ['shares-existing','กู้สามัญใช้หุ้นค้ำได้ไหม',[/ทุนเรือนหุ้น/,/ยังไม่มีหลักเกณฑ์เฉพาะ/],/90%|2,000,000/],
 ['real-estate','กู้สามัญใช้อสังหาริมทรัพย์เป็นหลักประกัน',[/90%/,/ราคาประเมิน/]],
 ['leisure','กู้เพื่อการพักผ่อน',[/300,000 บาท/,/36 งวด/,/ไม่ใช่ผลอนุมัติรายบุคคล/]],
 ['leisure-interest','กู้เพื่อการพักผ่อนดอกเบี้ยเท่าไร',[/4.25%/,/ข้อมูลประชาสัมพันธ์/,/ยังไม่ยืนยันอัตราเฉพาะเงินกู้พักผ่อน/]],
 ['flood-welfare','สวัสดิการน้ำท่วม',[/10%/,/1,000 บาท/,/5,000 บาท/,/50,000 บาท/,/อาจพิจารณา/,/120 วัน/],/300,000 บาท/],
 ['fire-welfare','สวัสดิการไฟไหม้',[/10%/,/1,000 บาท/,/5,000 บาท/,/50,000 บาท/,/อาจพิจารณา/,/120 วัน/],/300,000 บาท/],
 ['historical-lock','กู้เพื่อการศึกษา วันที่ 1 กันยายน 2569 วงเงินเท่าไร',[/ยังยืนยันกฎที่มีผลในช่วงเวลาที่ถามไม่ได้/],/200,000 บาท|60 งวด/],
 ['privacy','กู้ของผมอนุมัติหรือยัง',[/ข้อมูลเฉพาะสมาชิก/,/ระบบสมาชิก/],/อนุมัติแล้ว|ผ่านแล้ว/]
];
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+(new URL(req.url,'http://localhost').pathname==='/'?'/index.html':new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const results=[];
try{for(const width of [390,1365]){const page=await browser.newPage({viewport:{width,height:900}});await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'networkidle'});
for(const [id,q,patterns,forbidden] of cases){const result={width,id,q,status:'PASS'};try{await page.locator('#homeBtn').click();await page.locator('#q').fill(q);await page.locator('#q').press('Enter');await page.locator('#out .body').waitFor();result.answer=await page.locator('#out .body').innerText();result.links=await page.locator('#out a').evaluateAll(as=>as.map(a=>({text:a.textContent,href:a.getAttribute('href')})));for(const re of patterns)assert.match(result.answer,re);if(forbidden)assert.doesNotMatch(result.answer,forbidden);assert.ok(result.links.some(a=>/^https:\/\//.test(a.href)),'external evidence/navigation link');assert.doesNotMatch(result.answer,/undefined|NaN/);assert.ok(result.links.every(a=>!/(?:^|\b)(?:undefined|NaN)(?:\b|$)/i.test(a.text||'')),'evidence link label must never render undefined/NaN');if(id==='privacy')assert.ok(result.links.some(a=>a.href==='https://member.dlasavingcoop.com/coop/'));}catch(e){result.status='FAIL';result.error=e.message;}await page.screenshot({path:path.join(output,`${width}-${id}.png`),fullPage:true});results.push(result);console.log('PR136_CASE',JSON.stringify(result));}await page.close();}}
finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({testedHead:process.env.GITHUB_SHA,results},null,2));await browser.close();await new Promise(r=>server.close(r));}
const failed=results.filter(r=>r.status==='FAIL');console.log('PR136_ACCEPTANCE',JSON.stringify({total:results.length,failed:failed.length}));process.exitCode=failed.length?1:0;
