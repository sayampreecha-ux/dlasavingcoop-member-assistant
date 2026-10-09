import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);let server,url=process.env.MEMBER_APP_URL;
if(!url){server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+(new URL(req.url,'http://localhost').pathname==='/'?'/index.html':new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':'application/json');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+'/';}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});let pass=0;
try{for(const width of [390,1365]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.goto(url,{waitUntil:'networkidle'});
 const out=page.locator('#out'),menu=out.locator('.deposit-navigation');
 const click=async label=>{await menu.getByRole('button',{name:label,exact:true}).click();await out.locator('.body').waitFor();};
 const checkEntry=async()=>{assert.match(await out.locator('.body').textContent(),/ต้องการทำรายการเงินฝากประเภทใด/);assert.equal(await out.locator('.badge').textContent(),'เลือกประเภทเงินฝาก');assert.doesNotMatch(await out.textContent(),/พบเอกสารทางการ|ต้องยืนยันหลักฐาน|ตรวจเอกสารต้นฉบับ|500 บาท|3\.25%/);assert.equal(await menu.getByRole('button').count(),2);assert.equal(await out.locator('.follow-input').count(),0);assert.equal(await out.locator('.actions a').count(),0);pass++;};
 await page.getByRole('button',{name:'🏦 เงินฝาก เปิด · ฝาก · ถอน · ปิดบัญชี',exact:true}).click();await checkEntry();
 await click('ออมทรัพย์พิเศษ');await click('เปิดบัญชี');assert.match(await out.locator('.body').textContent(),/เปิดบัญชีครั้งแรกขั้นต่ำ 500 บาท/);pass++;
 await click('กลับเมนูเงินฝาก');await checkEntry();
 await click('ประเภทอื่น / ไม่แน่ใจ');assert.equal(await page.locator('#contactBox').isVisible(),true);await page.locator('#closeContact').click();pass++;
 const fixture=JSON.parse(fs.readFileSync(path.join(root,'data/official-source-registry.json'),'utf8'));
 fixture.documents.push({id:'entry-browser-pending',title:'ระเบียบเงินฝากสมาชิกฉบับแก้ไข',affects:['deposits'],type:'REGULATION',status:'PENDING',mayAffectRules:true,originalUrl:'https://www.dlasavingcoop.com/show.php?No=807',linkVerified:true});
 await page.route('**/official-source-monitor.json',route=>route.fulfill({json:fixture}));await page.reload({waitUntil:'networkidle'});
 await page.getByRole('button',{name:'🏦 เงินฝาก เปิด · ฝาก · ถอน · ปิดบัญชี',exact:true}).click();await checkEntry();
 await click('ออมทรัพย์พิเศษ');
 for(const label of ['เปิดบัญชี','ฝากเพิ่ม','ถอน','ปิดบัญชี','ดอกเบี้ย']){await click(label);const body=await out.locator('.body').textContent();assert.match(body,/ยัง.*ยืนยัน|กำลังยืนยัน/);assert.doesNotMatch(body,/500 บาท|1%|3\.25%/);assert.equal(await menu.getByRole('button').count(),6);pass++;}
 await click('กลับเมนูเงินฝาก');await checkEntry();
 assert.deepEqual(errors,[]);await page.close();
}console.log('BROWSER DEPOSIT ENTRY:',pass,'PASS / 0 FAIL on mobile and desktop; clean intake, return, contact, pending regulation locks');}
finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
