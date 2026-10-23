import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);
const livePath=path.join(root,'news-browser-evidence/live-current-events.json');
const live=JSON.parse(fs.readFileSync(livePath,'utf8'));
const ordinary=live.approvalIndex?.find(x=>x.id==='official-4946');
assert.ok(ordinary&&ordinary.category==='ordinary-loan','verified ordinary approval missing');
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 const file=pathname==='/data/current-events.json'?livePath:path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'application/octet-stream');res.end(fs.readFileSync(file));}
 catch{res.writeHead(404);res.end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const report={sourceHead:process.env.GITHUB_SHA||null,scope:'local branch + live official feed, not Production',results:[]};
try{
 for(const width of [390,1365]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  try{
   await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>globalThis.COOP_APP&&typeof COOP_APP.setApprovalIndex==='function');
   await page.waitForFunction(()=>COOP_APP.answer('ผลอนุมัติเงินกู้สามัญล่าสุด').intent==='approval_announcement',{timeout:15000});
   const q=page.locator('#q');
   await q.fill('ผลอนุมัติเงินกู้สามัญล่าสุด');await q.press('Enter');
   await page.waitForFunction(()=>document.querySelector('#out .body')?.textContent?.includes('15 ตุลาคม 2569'),{timeout:15000});
   const text=await page.locator('#out .body').textContent();
   for(const word of ['30 ตุลาคม 2569','พฤศจิกายน 2569','ไม่ใช่หลักฐานว่าโอนสำเร็จ','ไม่ยืนยันว่าผู้ถามได้รับอนุมัติ'])assert.ok(text.includes(word),'answer missing '+word+' / '+width);
   const links=await page.locator('#out .reading-current a').evaluateAll(links=>links.map(a=>({text:a.textContent,href:a.href})));
   assert.ok(links.some(l=>l.href==='https://www.dlasavingcoop.com/show.php?No=4946'),'direct official announcement link');
   assert.ok(links.some(l=>l.href===ordinary.documentUrl),'direct document attachment link');
   assert.ok((await page.locator('#out .tracking-notices').innerText()).includes('ประกาศ'),'notice navigation visible');
   await page.locator('#out .follow-input input').fill('แล้วเริ่มหักเดือนไหน');
   await page.locator('#out .follow-input button').click();
   await page.waitForFunction(()=>document.querySelector('#out .body')?.textContent?.includes('พฤศจิกายน 2569'),{timeout:15000});
   const follow=await page.locator('#out .body').textContent();
   assert.match(follow,/พฤศจิกายน 2569/);
   assert.doesNotMatch(follow,/โอนเงินให้คุณเรียบร้อย|คุณได้รับอนุมัติแล้ว/);
   const answer=await page.evaluate(()=>COOP_APP.answer('ผลอนุมัติเงินกู้ฉุกเฉินล่าสุด'));
   assert.equal(answer.intent,'approval_announcement');
   assert.ok(answer.actions.every(item=>item[1]!=='https://www.dlasavingcoop.com/show.php?No=4946'),'emergency must not reference ordinary result');
   assert.deepEqual(errors,[]);
   report.results.push({width,status:'PASS',official:ordinary.directSourceUrl,hasDocument:!!ordinary.documentUrl,followup:'November 2026'});
   console.log('BROWSER_APPROVAL_ANNOUNCEMENTS '+width+'px PASS');
  }catch(error){report.results.push({width,status:'FAIL',error:String(error),errors});throw error;}
  finally{await page.close();}
 }
}finally{
 fs.mkdirSync(path.join(root,'news-browser-evidence'),{recursive:true});
 fs.writeFileSync(path.join(root,'news-browser-evidence/approval-browser-report.json'),JSON.stringify(report,null,2));
 await browser.close();await new Promise(done=>server.close(done));
}
