import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {loadMemberEngine} from '../tests/helpers/load-member-engine.mjs';
import {journeyMonitor,scenarios} from '../tests/live-monitor-member-journey.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);let server,url=process.env.MEMBER_APP_URL;
if(!url){server=http.createServer((req,res)=>{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(p==='/'?'/index.html':p));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+'/';}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});let pass=0;
try{for(const width of [390,1365]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 // Local CI must exercise the same asynchronous state merge as Production.
 // Production mode never intercepts or replaces live monitor data.
 if(!process.env.MEMBER_APP_URL)await page.route('**/official-source-monitor.json',route=>route.fulfill({json:journeyMonitor(loadMemberEngine())}));
 await page.goto(url,{waitUntil:'domcontentloaded'});
 const read=()=>page.locator('#out').textContent();
 const ask=async q=>{await page.locator('#homeBtn').click();await page.locator('#q').fill(q);await page.locator('#q').press('Enter');await page.locator('#out .body').waitFor();return read();};
 for(const [q,nextOrExpected,last]of scenarios){let text=await ask(q);
  if(last){await page.locator('#out .follow').getByRole('button',{name:nextOrExpected,exact:true}).click();await page.locator('#out .body').waitFor();text=await read();}
  assert.match(text,last||nextOrExpected,q+' at '+width);
  if(/น้ำท่วม|สวัสดิการ/.test(q))assert.doesNotMatch(text,/รับฝากเงิน.*ฌาปนกิจ/);
  if(q.includes('ย้าย')&&last)assert.doesNotMatch(await page.locator('#out .body').textContent(),/ต้องแยกก่อน/);
  assert.ok(await page.locator('#out .actions a,#out .follow button').count(),'no practical next step');pass++;
 }
 // Exact menu controls must work as well as equivalent typed questions.
 for(const [q,expect]of [['เงินกู้มีกี่แบบ',/ประเภท/],['สวัสดิการทั้งหมด',/สวัสดิการ/],['แบบฟอร์มทั้งหมด',/แบบ/],['ยอดหนี้ของผมเหลือเท่าไร',/สมาชิก/]]){
  await page.locator('#homeBtn').click();await page.locator('[data-q="'+q+'"]').click();await page.locator('#out .body').waitFor();assert.match(await read(),expect);pass++;
 }
 // Typed follow-up, not just a chip click.
 await ask('ย้ายไปทำงานอีกจังหวัด ต้องแจ้งอะไรบ้าง');await page.getByLabel('ตอบข้อมูลเพิ่มเติม',{exact:true}).fill('ย้ายต้นสังกัด');await page.getByRole('button',{name:'ส่งคำตอบ',exact:true}).click();assert.match(await read(),/สำเนาคำสั่ง/);pass++;
 assert.deepEqual(errors,[]);await page.close();
}console.log('BROWSER LIVE JOURNEY:',pass,'PASS / 0 FAIL on mobile and desktop');}
finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
