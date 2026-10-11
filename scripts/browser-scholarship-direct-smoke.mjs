import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+(new URL(req.url,'http://localhost').pathname==='/'?'/index.html':new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+'/')){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':'application/json');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});let count=0;
try{for(const width of [390,1365]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.goto(process.env.MEMBER_APP_URL||'http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'❤️ สวัสดิการ สิทธิ · แบบขอรับ · ทุนบุตร',exact:true}).click();
 await page.locator('#out').getByRole('button',{name:'ทุนเรียนลูกมีอะไรบ้าง',exact:true}).click();
 assert.doesNotMatch(await page.locator('#out .body').textContent(),/หรือเงินกู้เพื่อการศึกษา/);count++;
 assert.equal(await page.locator('#out').getByRole('link',{name:'📣 ประกาศทุนการศึกษาบุตร ประจำปี 2569',exact:true}).getAttribute('href'),'https://www.dlasavingcoop.com/show.php?No=4887');count++;
 assert.ok((await page.locator('#out').getByRole('link',{name:'📘 ประกาศหลักเกณฑ์และเงื่อนไขทุนการศึกษาบุตร (PDF)',exact:true}).getAttribute('href')).includes('1_7VIQigZV7SFCH7QOdZGkvTfs-8SHsjt'));count++;
 assert.equal(await page.locator('#out a[href*="Category=notice"]').count(),0);count++;
 assert.equal(await page.locator('#out a[href*="No=775"]').count(),0);count++;
 assert.deepEqual(errors,[]);await page.close();
}console.log('BROWSER SCHOLARSHIP DIRECT SOURCE:',count,'PASS on mobile and desktop');}finally{await browser.close();await new Promise(r=>server.close(r));}
