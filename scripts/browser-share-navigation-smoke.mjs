import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+(new URL(req.url,'http://localhost').pathname==='/'?'/index.html':new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+'/')){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':'application/json');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});let count=0;
try{for(const width of [390,1365]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.goto(process.env.MEMBER_APP_URL||'http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle'});
 await page.locator('#q').fill('หุ้นและทุนเรือนหุ้น');await page.locator('#q').press('Enter');await page.locator('#out .body').waitFor();
 await page.locator('#out').getByRole('button',{name:'เพิ่มหุ้นรายเดือนได้ไหม',exact:true}).click();assert.match(await page.locator('#out .body').textContent(),/5,000 หุ้น/);count++;
 await page.locator('#out').getByRole('button',{name:'ลดหุ้นรายเดือนได้ไหม',exact:true}).click();assert.match(await page.locator('#out .body').textContent(),/6 เดือน/);count++;
 assert.ok(await page.locator('#readingHistory .body').count()>=2);count++;
 await page.locator('#out').getByRole('button',{name:'เปลี่ยนอัตราหุ้นรายเดือน',exact:true}).click();assert.match(await page.locator('#out .body').textContent(),/1 ตุลาคม 2569/);count++;
 if(await page.locator('#out details[data-share-followups]').count())await page.locator('#out details[data-share-followups] summary').click();await page.locator('#out').getByRole('button',{name:'ซื้อหุ้นเพิ่มเติม',exact:true}).click();assert.ok(await page.locator('#out a[href*="1PHYOgJQ"]').count()>0);const purchaseAnswer=await page.locator('#out .body').textContent();assert.match(purchaseAnswer,/ยังยืนยันไม่ได้/);assert.match(purchaseAnswer,/อย่าโอนเงิน/);assert.doesNotMatch(purchaseAnswer,/^การซื้อหุ้นเพิ่มเติมเป็นครั้งคราวปิดรับแล้ว/);count++;
 if(await page.locator('#out details[data-share-followups]').count())await page.locator('#out details[data-share-followups] summary').click();await page.locator('#out').getByRole('button',{name:'คืนหุ้นได้กรณีใด',exact:true}).click();assert.ok(await page.locator('#out a[href*="1UVoCHBo"]').count()>0);assert.match(await page.locator('#out').textContent(),/หลักฐานบางส่วน/);count++;
 await page.locator('#q').fill('ซื้อหุ้นเพิ่มรายเดือน');await page.locator('#q').press('Enter');assert.match(await page.locator('#out .body').textContent(),/5,000 หุ้นต่อเดือน/);count++;
 await page.locator('#out').getByRole('link',{name:'📗 ข้อบังคับสหกรณ์',exact:true}).click();assert.ok(await page.locator('#out a[href*="1CXkCCI4"]').count()>0);assert.equal(await page.locator('#out a[href*="1035C9"]').count(),0);count++;
 if(await page.locator('#out details[data-share-followups]').count())await page.locator('#out details[data-share-followups] summary').click();
 await page.locator('#out').getByRole('button',{name:'วิธีตรวจสอบยอดหุ้นของฉัน',exact:true}).click();assert.ok(await page.locator('#out a[href*="member.dlasavingcoop"]').count()>0);count++;
 assert.deepEqual(errors,[]);await page.close();
}console.log('BROWSER SHARE NAVIGATION:',count,'PASS on mobile and desktop');}finally{await browser.close();await new Promise(r=>server.close(r));}
