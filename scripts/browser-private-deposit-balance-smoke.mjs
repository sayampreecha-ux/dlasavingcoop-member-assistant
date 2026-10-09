import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);let server,url=process.env.MEMBER_APP_URL;
if(!url){server=http.createServer((req,res)=>{const p=new URL(req.url,'http://localhost').pathname,file=path.resolve(root,'.'+(p==='/'?'/index.html':p));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':'application/json');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+'/';}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});let pass=0;
try{for(const width of [390,1365]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 const fixture=JSON.parse(fs.readFileSync(path.join(root,'data/official-source-registry.json'),'utf8'));
 fixture.documents.push({id:'private-deposit-browser-pending',title:'ระเบียบเงินฝากสมาชิกฉบับแก้ไข',affects:['deposits'],type:'REGULATION',status:'PENDING',mayAffectRules:true,originalUrl:'https://www.dlasavingcoop.com/show.php?No=807',linkVerified:true});
 await page.route('**/official-source-monitor.json',route=>route.fulfill({json:fixture}));await page.goto(url,{waitUntil:'networkidle'});
 for(const q of ['เงินฝากของผมเท่าไร','เงินฝากของฉันเท่าไหร่','ผมมีเงินฝากเท่าไร','เงินฝากของดิฉันเท่าไรค่ะ']){
  await page.getByRole('button',{name:'🏠 หน้าแรก',exact:true}).click();await page.locator('#q').fill(q);await page.locator('#q').press('Enter');
  const out=page.locator('#out');await out.locator('.body').waitFor();assert.match(await out.locator('.body').textContent(),/ระบบสมาชิก/);assert.ok(await out.locator('a[href="https://member.dlasavingcoop.com/coop/"]').count());assert.doesNotMatch(await out.locator('.body').textContent(),/พบเอกสารทางการ|มีเงินฝาก.*บาท/);pass++;
 }
 for(const q of ['เปิดบัญชีเงินฝากออมทรัพย์พิเศษ','เงินฝากออมทรัพย์พิเศษดอกเบี้ยเท่าไร']){
  await page.getByRole('button',{name:'🏠 หน้าแรก',exact:true}).click();await page.locator('#q').fill(q);await page.locator('#q').press('Enter');
  await page.locator('#out .body').waitFor();assert.match(await page.locator('#out .body').textContent(),/ยัง.*ยืนยัน|กำลังยืนยัน/);assert.doesNotMatch(await page.locator('#out .body').textContent(),/500 บาท|3\.25%/);pass++;
 }
 assert.deepEqual(errors,[]);await page.close();
}console.log('BROWSER PRIVATE DEPOSIT BALANCE:',pass,'PASS / 0 FAIL on mobile and desktop; own balance self-service and pending-rule locks');}
finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
