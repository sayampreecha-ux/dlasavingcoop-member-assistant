import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);let server,url=process.env.MEMBER_APP_URL;
if(!url){server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+(new URL(req.url,'http://localhost').pathname==='/'?'/index.html':new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':'application/json');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+'/';}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});let pass=0;
try{for(const width of [390,1365]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.goto(url,{waitUntil:'networkidle'});
 const menu=page.locator('#out .deposit-navigation');
 const click=async label=>{await menu.getByRole('button',{name:label,exact:true}).click();await page.locator('#out .body').waitFor();};
 await page.getByRole('button',{name:'🏦 เงินฝาก เปิด · ฝาก · ถอน · ปิดบัญชี',exact:true}).click();
 assert.equal(await menu.getByRole('button',{name:'ออมทรัพย์พิเศษ',exact:true}).count(),1);pass++;
 await click('ออมทรัพย์พิเศษ');assert.equal(await menu.getByRole('button').count(),6);pass++;
 for(const [label,pattern]of [['เปิดบัญชี',/เปิดบัญชีครั้งแรกขั้นต่ำ 500 บาท/],['ฝากเพิ่ม',/ฝากเพิ่มแต่ละครั้งขั้นต่ำ 500 บาท/],['ถอน',/1%.*100 บาท/],['ปิดบัญชี',/สมุดบัญชีเล่มสีเขียว/],['ดอกเบี้ย',/3.25%.*29 พฤศจิกายน 2565/]]){
   await click(label);assert.match(await page.locator('#out .body').textContent(),pattern);assert.equal(await menu.getByRole('button').count(),6);pass++;
 }
 await click('กลับเมนูเงินฝาก');assert.equal(await menu.getByRole('button').count(),2);pass++;
 await click('ประเภทอื่น / ไม่แน่ใจ');assert.equal(await page.locator('#contactBox').isVisible(),true);await page.locator('#closeContact').click();pass++;
 // A new member regulation still blocks all numeric rules while the navigation remains usable.
 const fixture=JSON.parse(fs.readFileSync(path.join(root,'data/official-source-registry.json'),'utf8'));
 fixture.documents.push({id:'navigation-browser-pending',title:'ระเบียบเงินฝากสมาชิกฉบับแก้ไข',affects:['deposits'],type:'REGULATION',status:'PENDING',mayAffectRules:true,originalUrl:'https://www.dlasavingcoop.com/show.php?No=807',linkVerified:true});
 await page.route('**/official-source-monitor.json',route=>route.fulfill({json:fixture}));await page.reload({waitUntil:'networkidle'});
 await page.getByRole('button',{name:'🏦 เงินฝาก เปิด · ฝาก · ถอน · ปิดบัญชี',exact:true}).click();await click('ออมทรัพย์พิเศษ');
 for(const label of ['เปิดบัญชี','ฝากเพิ่ม','ถอน','ปิดบัญชี','ดอกเบี้ย']){await click(label);const body=await page.locator('#out .body').textContent();assert.match(body,/ยัง.*ยืนยัน|กำลังยืนยัน/);assert.doesNotMatch(body,/500 บาท|1%|3\.25%/);assert.equal(await menu.getByRole('button').count(),6);pass++;}
 // Returning to the main deposit category must reset a pending conversation clarification.
 await page.getByRole('button',{name:'🏦 เงินฝาก เปิด · ฝาก · ถอน · ปิดบัญชี',exact:true}).click();assert.equal(await menu.getByRole('button').count(),2);pass++;
 assert.deepEqual(errors,[]);await page.close();
}console.log('BROWSER DEPOSIT NAVIGATION:',pass,'PASS / 0 FAIL on mobile and desktop; main menu, five operations, return, contact, evidence locks');}
finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
