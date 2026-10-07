import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {answerFirstCases} from '../tests/answer-first-services.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);let server,url=process.env.MEMBER_APP_URL;
if(!url){server=http.createServer((req,res)=>{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(p==='/'?'/index.html':p));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+'/';}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});let pass=0;
try{for(const width of [390,1365]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 // Never replace the asynchronous official monitor, especially in Production.
 await page.goto(url,{waitUntil:'networkidle'});
 const body=()=>page.locator('#out .body').textContent();
 const ask=async q=>{await page.locator('#homeBtn').click();await page.locator('#q').fill(q);await page.locator('#q').press('Enter');await page.locator('#out .body').waitFor();return body();};
 for(const [q,...checks]of answerFirstCases){const text=await ask(q);for(const pattern of checks)assert.match(text,pattern,q+' at '+width);assert.doesNotMatch(text,/ให้เปิดประกาศ|ให้ดู.*หลักเกณฑ์/);assert.ok(await page.locator('#out .sources a').count());pass++;}
 await ask('อยากกู้เงินแต่ไม่รู้ต้องเลือกแบบไหน');await page.locator('#out .follow').getByRole('button',{name:'กู้สามัญ',exact:true}).click();assert.match(await body(),/2,000,000 บาท/);pass++;
 await page.getByLabel('ตอบข้อมูลเพิ่มเติม',{exact:true}).fill('ผ่อนได้กี่งวด');await page.getByRole('button',{name:'ส่งคำตอบ',exact:true}).click();assert.match(await body(),/240 งวด/);pass++;
 for(const [q,pattern]of [['คลอดบุตรได้สวัสดิการเท่าไร',/1,000 บาท/],['น้ำท่วมบ้านเสียหายขอสวัสดิการอย่างไร',/120 วัน/]]){assert.match(await ask(q),pattern);pass++;}
 await ask('ย้ายต้นสังกัดต้องใช้เอกสารอะไร');assert.equal(await page.locator('#out details.more[open]').count(),1,'procedure must be visible without opening a document');assert.match(await page.locator('#out details.more').textContent(),/สำเนาคำสั่ง/);pass++;
 assert.deepEqual(errors,[]);await page.close();
}console.log('BROWSER ANSWER FIRST:',pass,'PASS / 0 FAIL on mobile and desktop; substantive answers and follow-up verified');}
finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
