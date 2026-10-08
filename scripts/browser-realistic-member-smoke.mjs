import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {realisticFixCases,completeLoanChoices} from '../tests/realistic-member-journey.mjs';
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
 for(const [q,domain,...checks]of realisticFixCases){const text=await ask(q);for(const p of checks)assert.match(text,p,q+' at '+width);assert.ok(await page.getByLabel('ตอบข้อมูลเพิ่มเติม',{exact:true}).isVisible());pass++;}
 await page.locator('#homeBtn').click();await page.locator('[data-q="เงินกู้มีกี่แบบ"]').click();await page.locator('#out .body').waitFor();
 for(const [choice]of completeLoanChoices)assert.equal(await page.locator('#out .follow').getByRole('button',{name:choice,exact:true}).count(),1);pass++;
 for(const [choice,p]of completeLoanChoices){await ask('เงินกู้มีกี่แบบ');await page.locator('#out .follow').getByRole('button',{name:choice,exact:true}).click();assert.match(await body(),p);pass++;}
 const next=async(q,p)=>{assert.ok(await page.getByLabel('ตอบข้อมูลเพิ่มเติม',{exact:true}).isVisible(),'follow-up disappears before '+q);await page.getByLabel('ตอบข้อมูลเพิ่มเติม',{exact:true}).fill(q);await page.getByRole('button',{name:'ส่งคำตอบ',exact:true}).click();assert.match(await body(),p);assert.ok(await page.getByLabel('ตอบข้อมูลเพิ่มเติม',{exact:true}).isVisible(),'follow-up disappears after '+q);pass++;};
 await ask('กู้เพื่อการศึกษา');await next('ผ่อนได้กี่งวด',/60 งวด/);await next('ใช้เอกสารอะไร',/สถานศึกษา/);await next('ดอกเบี้ยเท่าไร',/ต่อปี/);await next('คลอดบุตรได้สวัสดิการเท่าไร',/1,000 บาท/);
 await ask('กู้ภัยพิบัติ');await next('ต้องยื่นภายในกี่วัน',/180 วัน/);await next('ใช้เอกสารอะไร',/ภาพถ่ายความเสียหาย/);
 await ask('อยากกู้ค่าเทอมให้ลูก ต้องทำยังไง');assert.equal(await page.locator('#out details.more[open]').count(),1);assert.ok(await page.locator('#out .actions a[href*="1cK6zUQ"]').count());pass++;
 await ask('กู้ค่าเล่าเรียน ณ วันที่ 1 กันยายน 2569 วงเงินเท่าไร');assert.doesNotMatch(await body(),/200,000|60 งวด/);assert.match(await body(),/ยังยืนยัน/);await next('ยอดหุ้นของผมเท่าไร',/ระบบสมาชิก/);
 assert.deepEqual(errors,[]);await page.close();
}console.log('BROWSER REALISTIC MEMBER JOURNEY:',pass,'PASS / 0 FAIL on mobile and desktop; substantive answers and follow-up verified');}
finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
