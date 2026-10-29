import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);
const url=process.env.MEMBER_APP_URL||null;
let server;
if(!url){
 server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const width of [390,1365]){
  const page=await browser.newPage({viewport:{width,height:844}});
  try{
   await page.goto(url||'http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
   const format=await page.evaluate(()=>[displayOfficialThaiDate('2026-10-15'),displayOfficialThaiDate('2026-10-30'),displayOfficialThaiDate('2026-11',true),displayOfficialThaiDate('invalid')]);
   assert.deepEqual(format,['15 ต.ค. 2569','30 ต.ค. 2569','พ.ย. 2569','']);
   await page.locator('#q').fill('ผลอนุมัติเงินกู้สามัญล่าสุด');await page.locator('#q').press('Enter');
   await page.locator('.tracking-notices .tracking-notice-link').first().waitFor({timeout:20000});
   const block=page.locator('.tracking-notices').first();
   const text=await block.innerText();
   assert.match(text,/พบประกาศผลอนุมัติเงินกู้สามัญ/);
   assert.match(text,/ตัดเอกสาร 15 ต.ค. 2569/);
   assert.match(text,/กำหนดรอบโอน 30 ต.ค. 2569/);
   assert.match(text,/เริ่มงวดแรก พ.ย. 2569/);
   assert.doesNotMatch(text,/ตัดเอกสาร 2026-10-15|กำหนดรอบโอน 2026-10-30/);
   assert.match(await block.locator('.notice-found-lead').innerText(),/ไม่สามารถยืนยันผลอนุมัติรายบุคคลหรือการโอนเงินสำเร็จ/);
   const more=block.locator('details.notice-more');
   const count=await page.evaluate(async()=>{const feed=await (await fetch('./data/current-events.json')).json();return selectTrackingNotices(feed,'ผลอนุมัติเงินกู้สามัญล่าสุด').length});
   assert.equal(await more.count(),count>1?1:0,'expanded group exists exactly when multiple matching official notices exist');
   if(count>1){assert.equal(await more.evaluate(e=>e.open),false);await more.locator('summary').click();assert.equal(await more.evaluate(e=>e.open),true);
     assert.equal(await more.locator('a[href*="show.php?No="]').count(),Math.min(count-1,4),'all remaining notices accessible');}
   const links=await block.locator('a').evaluateAll(as=>as.map(a=>a.href));
   assert.ok(links.includes('https://www.dlasavingcoop.com/show.php?No=4946'));
   assert.ok(links.some(h=>h.startsWith('https://drive.google.com/file/d/')));
   await page.locator('#homeBtn').click();
   await page.locator('#q').fill('ติดตามผลและสถานะเอกสาร');await page.locator('#q').press('Enter');
   await page.locator('.reading-current .follow').first().waitFor({timeout:10000});
   const layout=await page.locator('.reading-current .follow').first().evaluate(e=>({position:getComputedStyle(e).position,width:e.getBoundingClientRect().width,screen:innerWidth}));
   assert.equal(layout.position,'static','follow-up buttons must not overlay content');
   assert.ok(layout.width<=layout.screen,'navigation must fit viewport');

   fs.mkdirSync(path.join(root,'news-browser-evidence'),{recursive:true});
   await page.screenshot({path:path.join(root,'news-browser-evidence','pr162-layout-'+width+'.png'),fullPage:true});
   await page.route('**/data/current-events.json',route=>route.fulfill({json:{trackingNotices:[{title:'กำหนดรอบรับเอกสารเงินกู้',category:'ordinary-loan',sourceState:'DIRECT_VERIFIED',directSourceUrl:'https://www.dlasavingcoop.com/',publishedAt:'2026-10-29'}]}}));
   await page.evaluate(()=>render({status:'ข้อมูลทดสอบ',answer:'ข้อมูลจำลองสำหรับตรวจ UI'},'ติดตามเงินกู้รอบล่าสุด'));
   const synthetic=page.locator('#out .tracking-notices').last();
   await synthetic.locator('.tracking-notice-link').first().waitFor();
   assert.match(await synthetic.innerText(),/กำหนดรอบรับเอกสารเงินกู้/);
   assert.equal(await synthetic.locator('.notice-found-lead').count(),0,'non-approval notices must not claim an approval result');
   console.log('PR162_NOTICE_TYPE '+width+'px PASS: verified approval lead and non-approval guard');
   console.log('MOBILE_APPROVAL_UI '+width+'px PASS: Thai dates, exact source, expand, no overlay');
  }finally{await page.close();}
 }
}finally{await browser.close();if(server)await new Promise(resolve=>server.close(resolve));}
