import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
import {groups} from '../tests/funeral-facets-semantic-20261024.mjs';
const root=path.resolve(new URL('../',import.meta.url).pathname),rows=[];
const remote=process.env.FUNERAL_BASE_URL;
const server=http.createServer((req,res)=>{let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(file===root)file=path.join(root,'index.html');if(!file.startsWith(root+'/')){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'text/javascript');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
if(!remote)await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const width of [390,1365]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(remote||'http://127.0.0.1:'+server.address().port,{waitUntil:'domcontentloaded'});
  for(const [facet,pattern,qs]of groups)for(const q of qs){
   await page.locator('#q').fill(q);await page.locator('#form').evaluate(el=>el.requestSubmit());
   const answer=await page.locator('#out .body').innerText();
   const special=q==='ฌาปนกิจเลขสมาชิกดูที่ไหน';
   assert.match(answer,special?/เลขสมาชิกสมาคมฌาปนกิจ.*ติดต่อสมาคม/:pattern,q);
   if(!['apply','approval'].includes(facet))assert.doesNotMatch(answer,/ต้องการสมัคร ชำระเงิน หรือสอบถามสิทธิ/);
   if(['debt','beneficiary'].includes(facet)){
    assert.match(answer,/แบบ.*ข้อบังคับ พ.ศ. 2565/);
    assert.match(answer,/ลำดับที่ 1.*ก่อน.*(?:เหลือ|ลำดับที่ 2)/);
    assert.ok(await page.locator('#out a[href*="1sxikYqV3"]').count(),'missing published beneficiary form');
   }
   assert.ok(await page.locator('#out a').count(),q+' missing actions');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'horizontal overflow');
   rows.push({width,question:q,facet,answer,status:'PASS'});
  }
  // Click the actual explicit follow-up and verify the user-visible answer.
  await page.locator('#q').fill('ฌาปนกิจค่าบำรุงรายปีเท่าไร');await page.locator('#form').evaluate(el=>el.requestSubmit());
  await page.locator('#out').getByRole('button',{name:'ฌาปนกิจหักหนี้สหกรณ์หรือไม่',exact:true}).click();
  assert.match(await page.locator('#out .body').innerText(),/แยกหนี้สมาคม.*หนี้เงินกู้สหกรณ์/);
  assert.deepEqual(errors,[]);
  if(process.env.FUNERAL_SCREENSHOT_DIR){fs.mkdirSync(process.env.FUNERAL_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.FUNERAL_SCREENSHOT_DIR,'funeral-'+width+'.png'),fullPage:true});}
  await page.close();
 }
 assert.equal(rows.length,120);
 if(process.env.FUNERAL_BROWSER_OUTPUT)fs.writeFileSync(process.env.FUNERAL_BROWSER_OUTPUT,JSON.stringify({target:remote||'local candidate',rows},null,2));
 console.log('FUNERAL REAL UI: 120/120 (60 x mobile390/desktop1365), actual follow-up click x2, overflow/console PASS');
}finally{if(browser)await browser.close();if(!remote)await new Promise(r=>server.close(r));}
