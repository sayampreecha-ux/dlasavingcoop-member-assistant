import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {depositCases} from '../tests/special-deposit-acceptance.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);let server,url=process.env.MEMBER_APP_URL;
if(!url){server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+(new URL(req.url,'http://localhost').pathname==='/'?'/index.html':new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':'application/json');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+'/';}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});let pass=0;
try{for(const width of [390,1365]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.goto(url,{waitUntil:'networkidle'});
 const ask=async q=>{await page.locator('#homeBtn').click();await page.locator('#q').fill(q);await page.locator('#q').press('Enter');await page.locator('#out .body').waitFor();return page.locator('#out').textContent();};
 for(const [q,,...patterns]of depositCases){const text=await ask(q);for(const p of patterns)assert.match(text,p,q+' '+width);pass++;}
 await ask('ฝากพิเศษ');for(const [q,p]of [['ฝากเพิ่มขั้นต่ำเท่าไร',/ฝากเพิ่มแต่ละครั้ง.*500 บาท/],['ถอนครั้งที่สองเสียเท่าไร',/1%/],['ปิดบัญชีใช้เอกสารอะไร',/ไปรษณีย์/]]){await page.getByLabel('ตอบข้อมูลเพิ่มเติม',{exact:true}).fill(q);await page.getByRole('button',{name:'ส่งคำตอบ',exact:true}).click();assert.match(await page.locator('#out').textContent(),p);pass++;}
 assert.deepEqual(errors,[]);await page.close();
}console.log('BROWSER SPECIAL DEPOSIT:',pass,'PASS / 0 FAIL on mobile and desktop');}
finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
