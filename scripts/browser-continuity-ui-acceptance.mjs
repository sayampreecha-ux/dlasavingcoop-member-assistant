import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);
const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;let file=path.resolve(root,'.'+pathname);if(file===root)file=path.join(root,'index.html');if(!file.startsWith(root+'/')){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'text/javascript');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;const rows=[],fullRows=[];
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const width of [390,1365]){
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'domcontentloaded'});
  const scripted=[
   ['เงินกู้สามัญกู้ได้ไหม',null],
   ['คุณสมบัติอะไรบ้าง',null],
   ['วงเงินสูงสุดเท่าไร',null],
   ['ผ่อนได้กี่งวด',/240[ ]*งวด/],
   ['สวัสดิการคลอดบุตร',null],
   ['ได้รับเท่าไร',/1,?000[ ]*บาท/],
   ['ทุนการศึกษาบุตรสมาชิก',null],
   ['ได้ทุนเท่าไร',/ทุน|การศึกษา|เกณฑ์|ประกาศ/],
   ['การส่งหุ้นรายเดือน',null],
   ['ใช้เอกสารอะไร',/หุ้น/],
   ['สมัครสมาชิกสหกรณ์',null],
   ['คุณสมบัติอะไรบ้าง',/สมาชิก/],
   ['สมาคมฌาปนกิจสงเคราะห์',null],
   ['สมัครอย่างไร',/ฌาปนกิจ/],
   ['ใช้เอกสารอะไร',/ฌาปนกิจ/],
   ['ลาออกได้ไหม',null],
   ['ถ้ามีหนี้อยู่ทำอย่างไร',/หนี้|ภาระค้ำประกัน/],
  ];
  for(const [question,expected] of scripted){
   await page.locator('#q').fill(question);
   await page.locator('#form').evaluate(el=>el.requestSubmit());
   const answer=await page.locator('#out .body').innerText();
   assert.ok(answer.trim(),question+' empty');
   if(expected)assert.match(answer,expected,question);
   assert.doesNotMatch(answer,/เป็นเงินกู้ประเภทไหนครับ/,question+' misrouted to loan');
   rows.push({width,question,answer:answer.slice(0,180),status:'PASS'});
  }
  await page.close();
  // Preserve the original34 UI assertions, then exercise all110 reviewed turns.
  const reviewed=JSON.parse(fs.readFileSync(path.join(root,'docs/quality/semantic-full-answer-review-110-20261024.json'),'utf8'));
  const norm=s=>s.replace(/\s+/g,' ').trim();
  let reviewPage,domain;
  for(const row of reviewed.rows){
   if(domain!==row.domain){
    if(reviewPage)await reviewPage.close();
    reviewPage=await browser.newPage({viewport:{width,height:900}});domain=row.domain;
    await reviewPage.goto(process.env.CONTINUITY_BASE_URL||'http://127.0.0.1:'+server.address().port,{waitUntil:'domcontentloaded'});
   }
   await reviewPage.locator('#q').fill(row.question);
   await reviewPage.locator('#form').evaluate(el=>el.requestSubmit());
   const actual=await reviewPage.locator('#out .body').innerText();
   if(domain==='notices'){
    // Real UI may load the live official announcement index; offline VM does not.
    assert.match(actual,/ประกาศ|อนุมัติ|เอกสาร|สินเชื่อ|สถานะ/,domain+'/'+row.turn);
    assert.doesNotMatch(actual,/คุณได้รับอนุมัติแล้ว|โอนให้คุณแล้ว/);
   }else assert.ok(norm(actual).includes(norm(row.answerFull)),domain+'/'+row.turn+' FULL visible answer mismatch: '+actual);
   assert.ok(await reviewPage.locator('#out a').count(),domain+'/'+row.turn+' official links missing');
   assert.ok(await reviewPage.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),domain+'/'+row.turn+' horizontal overflow');
   fullRows.push({width,domain,turn:row.turn,question:row.question,actualAnswer:actual,semanticDisposition:row.status,status:'PASS'});
  }
  await reviewPage.close();
 }
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
console.log(JSON.stringify({kind:'real-ui-multi-turn',rows}));
assert.equal(rows.length,34);

assert.equal(fullRows.length,220);
fs.mkdirSync(path.join(root,'continuity-110-evidence'),{recursive:true});
fs.writeFileSync(path.join(root,'continuity-110-evidence','results.json'),JSON.stringify({rows:fullRows},null,2));
console.log('FULL110 REAL UI: 220/220 (mobile390 + desktop1365); static full-answer parity, live-notice safety, links and overflow PASS');
