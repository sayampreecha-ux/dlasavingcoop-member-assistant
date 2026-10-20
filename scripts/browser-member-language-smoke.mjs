import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {languageCases} from '../tests/member-language-quality.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);let server,url=process.env.MEMBER_APP_URL;
if(!url){server=http.createServer((req,res)=>{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(p==='/'?'/index.html':p));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+'/';}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});let pass=0;
try{for(const width of [390,1365]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(url,{waitUntil:'networkidle'});
 const body=()=>page.locator('#out .body').textContent();
 for(const [q,...patterns]of languageCases){await page.locator('#homeBtn').click();await page.locator('#q').fill(q);await page.locator('#q').press('Enter');await page.locator('#out .body').waitFor();for(const p of patterns)assert.match(await body(),p,q+' '+width);pass++;}
 for(const [q,reply,p]of [['คลอดลูกขอเงินทำไง','ต้องใช้เอกสารอะไร',/สูติบัตร/],['แม่เสียต้องเตรียมไรบ้าง','ต้องใช้เอกสารอะไร',/มรณบัตร/],['ต้องส่งหุ้นเดือนละเท่าไหร่','32000',/130 หุ้น/],['ขอเงินค่าเทอมให้ลูกต้องใช้อะไรบ้าง','กู้เพื่อการศึกษา',/สถานศึกษา/]]){
  await page.locator('#homeBtn').click();await page.locator('#q').fill(q);await page.locator('#q').press('Enter');await page.locator('#out .body').waitFor();
  await page.getByLabel('ตอบข้อมูลเพิ่มเติม',{exact:true}).fill(reply);await page.getByRole('button',{name:'ส่งคำตอบ',exact:true}).click();assert.match(await body(),p);pass++;
 }
 // Targeted production QA: full UI input path on both viewports, including same-session follow-ups.
 const send=async q=>{await page.locator('#q').fill(q);await page.locator('#q').press('Enter');};
 const verify=async(pattern,tag)=>{await page.locator('#out .body').filter({hasText:pattern}).first().waitFor({timeout:10000});assert.match(await body(),pattern,tag+' '+width);pass++;};
 for(const q of ['ค้ำให้เพื่อนหลายคนแล้ว ยังขอกู้เองได้ไหม','ค้ำอยู่หลายสัญญา จะกู้เพิ่มได้บ่']){
  await page.locator('#homeBtn').click();await send(q);await verify(/การค้ำประกันเงินกู้ให้ผู้อื่นกับการขอกู้เงินของตนเองเป็นคนละประเด็น/,q);
  assert.match(await body(),/ฝ่ายสินเชื่อ/);
 }
 await page.locator('#homeBtn').click();await send('เงินฝากออมทรัพย์พิเศษ');await send('ถอนเงินอย่างไร');await send('ใช้เอกสารอะไร');
 await verify(/สำหรับการถอนเงินฝากออมทรัพย์พิเศษ ต้องตรวจแบบคำขอถอน/, 'special deposit withdrawal documents');
 await page.locator('#homeBtn').click();await send('ติดตามเอกสารเงินกู้');await send('เอกสารเงินกู้สามัญ');await send('ต้องติดต่อฝ่ายไหน');
 await verify(/ติดตามเอกสารเงินกู้สามัญที่เคยยื่นแล้ว/, 'loan tracking staff contact');
 assert.match(await body(),/ฝ่ายสินเชื่อ/);
 assert.deepEqual(errors,[]);await page.close();
}console.log('BROWSER MEMBER LANGUAGE:',pass,'PASS / 0 FAIL on mobile and desktop');}
finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
