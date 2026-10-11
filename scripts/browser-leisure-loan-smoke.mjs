import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);
let server,url=process.env.MEMBER_APP_URL;
if(!url){
  server=http.createServer((req,res)=>{
    const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(p==='/'?'/index.html':p));
    if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
    try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+'/';
}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});let pass=0;
try{
  for(const width of [390,1365]){
    const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    // Exercise the asynchronous real monitor. Never replace it to make a rule pass.
    await page.goto(url,{waitUntil:'networkidle'});
    const ask=async q=>{await page.locator('#homeBtn').click();await page.locator('#q').fill(q);await page.locator('#q').press('Enter');await page.locator('#out .body').waitFor();return page.locator('#out .body').textContent();};
    await ask('เงินกู้');
    const loanIndexes=[['📂 เปิดหน้าหลักเกณฑ์และแบบเงินกู้สามัญ','774'],['📂 เปิดหน้าหลักเกณฑ์และแบบเงินกู้ฉุกเฉิน','773'],['📂 เปิดหน้าหลักเกณฑ์และแบบเงินกู้พิเศษ','2385']];
    for(const [label,no]of loanIndexes){assert.equal(await page.locator('#out .actions a').filter({hasText:label}).getAttribute('href'),'https://www.dlasavingcoop.com/show.php?No='+no);pass++;}
    assert.equal(await page.locator('#out .actions a[href*="Category=procedure"]').count(),0,'Loan menu must not link to the bylaw index');pass++;
    const menu=page.locator('#out .follow.loan-product-menu');
    assert.deepEqual(await menu.locator('button').allTextContents(),['กู้ฉุกเฉิน','กู้สามัญ','กู้พัฒนาคุณภาพชีวิต','กู้เคหะ','กู้เพื่อการศึกษา','กู้เพื่อการพักผ่อน','กู้ภัยพิบัติ','กู้ไถ่ถอนจำนอง']);pass++;
    assert.equal(await menu.evaluate(e=>{const b=e.getBoundingClientRect();return [...e.querySelectorAll('button')].every(x=>x.getBoundingClientRect().bottom<=b.bottom+1)&&getComputedStyle(e).position==='static'&&getComputedStyle(e).maxHeight==='none';}),true,'All loan choices displayed without inner scrolling or clipping');pass++;
    await menu.getByRole('button',{name:'กู้เพื่อการพักผ่อน',exact:true}).click();
    assert.match(await page.locator('#out .body').textContent(),/300,000 บาท.*36 งวด/);pass++;
    assert.match(await page.locator('#out .actions a').filter({hasText:'หลักเกณฑ์กู้พักผ่อน'}).getAttribute('href'),/1PlpK5Cprkz3NV5ey23Ix60Uo10F7IlFS/);pass++;
    assert.equal(await page.locator('#out .actions a').filter({hasText:'📂 เปิดหน้าหลักเกณฑ์และแบบเงินกู้พักผ่อน'}).getAttribute('href'),'https://www.dlasavingcoop.com/show.php?No=774');pass++;
    assert.equal(await page.locator('#out .actions a[href*="Category=procedure"]').count(),0,'Leisure answer must not link to the bylaw index');pass++;
    for(const q of ['กู้พักผ่อน','กู้ท่องเที่ยว','ขอกู้ไปเที่ยวได้ไหม','เงินกู้สามัญเพื่อการพักผ่อน']){
      assert.match(await ask(q),/300,000 บาท.*36 งวด.*75 ปี/);pass++;
      assert.match(await page.locator('#out details.more').textContent(),/เงินได้รายเดือน.*15%.*6,000 บาท/);pass++;
      const rule=page.locator('#out .actions a').filter({hasText:'หลักเกณฑ์กู้พักผ่อน'});
      assert.match(await rule.getAttribute('href'),/1PlpK5Cprkz3NV5ey23Ix60Uo10F7IlFS/);pass++;
      assert.notEqual(await rule.getAttribute('href'),await page.locator('#out .actions a').filter({hasText:'แบบที่เผยแพร่'}).getAttribute('href'));pass++;
    }
    for(const [q,pattern]of [
      ['กู้พักผ่อนคุณสมบัติอะไร',/สมาคมฌาปนกิจ.*ยกเว้นสมาชิกสมทบ.*สหกรณ์อื่น.*วินัยอย่างร้ายแรง.*12 งวด/],
      ['กู้พักผ่อนใช้เอกสารอะไร',/หนังสือยินยอม.*กรุงไทย.*โปรแกรมนำเที่ยว.*แบบ.*12 งวด.*36 งวด.*ยืนยัน/],
      ['กู้พักผ่อนใช้หลักประกันอะไร',/ผู้ค้ำ 1 คน.*ไม่ใช่คู่สมรส.*6 งวด.*เงินฝาก/],
      ['กู้พักผ่อนดอกเบี้ยเท่าไร',/ยังไม่ยืนยัน/],
      ['กู้พักผ่อนสิ้นสุดเมื่อไร',/ไม่ระบุวันสิ้นสุด/]
    ]){assert.match(await ask(q),pattern);pass++;}
    await ask('กู้ท่องเที่ยว');
    await page.locator('#out .follow').getByRole('button',{name:'กู้พักผ่อนใช้เอกสารอะไร',exact:true}).click();
    assert.match(await page.locator('#out .body').textContent(),/โปรแกรมนำเที่ยว/);pass++;
    assert.ok(await page.locator('#readingHistory .body').count(),'Earlier answer remains readable');pass++;
    await page.getByLabel('ตอบข้อมูลเพิ่มเติม',{exact:true}).fill('ต้องมีผู้ค้ำไหม');
    await page.getByRole('button',{name:'ส่งคำตอบ',exact:true}).click();
    assert.match(await page.locator('#out .body').textContent(),/ผู้ค้ำ 1 คน/);pass++;
    assert.match(await ask('กู้ฉุกเฉินผ่อนได้กี่งวด'),/15 งวด/);pass++;
    assert.match(await ask('กู้สามัญผ่อนได้กี่งวด'),/240 งวด/);pass++;
    assert.deepEqual(errors,[]);
    if(process.env.LEISURE_SCREENSHOT_DIR){fs.mkdirSync(process.env.LEISURE_SCREENSHOT_DIR,{recursive:true});await ask('กู้พักผ่อน');await page.locator('#out details.more').evaluate(e=>e.open=true);await page.screenshot({path:path.join(process.env.LEISURE_SCREENSHOT_DIR,'leisure-'+width+'.png'),fullPage:true});}
    await page.close();
  }
  console.log('BROWSER LEISURE LOAN:',pass,'PASS / 0 FAIL on mobile and desktop; current rules, direct PDF, form/rate caveats, follow-ups and legacy isolation');
}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
