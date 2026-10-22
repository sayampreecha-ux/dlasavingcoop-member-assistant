import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);
let server,url=process.env.MEMBER_APP_URL;
if(!url){server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+(new URL(req.url,'http://localhost').pathname==='/'?'/index.html':new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+'/';}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{for(const width of [390,1365]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>globalThis.COOP_APP&&document.getElementById('q')&&!document.getElementById('q').disabled);
 const ask=async query=>{await page.locator('#homeBtn').click();await page.locator('#q').fill(query);await page.locator('#q').press('Enter');await page.locator('#out .body').waitFor();};
 const choose=label=>page.locator('#out .follow').getByRole('button',{name:label,exact:true}).click();
 const notices=()=>page.locator('#out .tracking-notices').first();
 const ready=()=>notices().getByText('📣 ประกาศที่ตรงกับเรื่อง',{exact:true}).waitFor();
 await ask('ติดตามผลและสถานะเอกสาร');await choose('ติดตามผลอนุมัติ');await choose('ผลอนุมัติสมัครสมาชิก');await ready();
 const actual=await notices().locator('a.tracking-notice-link').evaluateAll(as=>as.map(a=>({title:a.textContent,href:a.href})));
 assert.ok(actual.some(a=>a.href==='https://www.dlasavingcoop.com/show.php?No=4937'&&a.title.includes('เคยเป็นสมาชิก')));
 assert.ok(actual.some(a=>a.href==='https://www.dlasavingcoop.com/show.php?No=4936'&&a.title.includes('ไม่เคยเป็นสมาชิก')));
 assert.ok(actual.every(a=>/ผู้ที่ได้รับความเห็นชอบให้เป็นสมาชิกสหกรณ์|ผล(?:การ)?อนุมัติ.*สมาชิก|ผล(?:การ)?พิจารณา.*สมัครสมาชิก/.test(a.title)));
 assert.equal(new Set(actual.map(a=>a.href)).size,actual.length);
 assert.ok(actual.length<=5);
 assert.match(await page.locator('#out .body').textContent(),/ยังไม่สามารถยืนยันผลอนุมัติรายบุคคล/);
 await choose('ผลอนุมัติสวัสดิการ');await ready();const welfareText=await notices().innerText();assert.ok(/สวัสดิการ|ยังไม่พบประกาศตรงเรื่องที่ตรวจยืนยันได้/.test(welfareText),'welfare result or safe no-current-notice fallback');assert.doesNotMatch(welfareText,/ผู้ที่ได้รับความเห็นชอบให้เป็นสมาชิกสหกรณ์/);
 assert.ok(await page.locator('#readingHistory').count(),'previous answer remains available');
 await ask('เอกสารสมัครสมาชิก');await ready();const documentText=await notices().innerText();assert.ok(/เอกสารมาไม่ครบ|ยังไม่พบประกาศตรงเรื่องที่ตรวจยืนยันได้/.test(documentText),'document notice or safe no-current-notice fallback');assert.doesNotMatch(documentText,/ผู้ที่ได้รับความเห็นชอบให้เป็นสมาชิกสหกรณ์/);
 await ask('รอบสมาชิก');await ready();assert.doesNotMatch(await notices().innerText(),/ผู้ที่ได้รับความเห็นชอบให้เป็นสมาชิกสหกรณ์/);
 assert.deepEqual(errors,[]);
 console.log('BROWSER MEMBER TRACKING '+width+'px: real menu clicks, direct approved-member links, sibling navigation, document and round isolation PASS');
 await page.close();
}}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
