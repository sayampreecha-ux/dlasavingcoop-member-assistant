import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {runLegacy69} from '../tests/legacy-line-69-runtime.mjs';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);let server,url=process.env.MEMBER_APP_URL;
if(!url){server=http.createServer((req,res)=>{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(p==='/'?'/index.html':p));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+'/';}
const browser=await chromium.launch({headless:true,...(process.env.MEMBER_CHROMIUM_PATH?{executablePath:process.env.MEMBER_CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-gpu']});
try{
 const corpus=JSON.parse(fs.readFileSync(path.join(root,'data/legacy-line-69-corpus.json')));
 for(const width of [390,1365]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!globalThis.COOP_APP);
  await page.locator('.brand-logo').waitFor({state:'visible'});
  assert.ok(await page.locator('.brand-logo').evaluate(img=>img.complete&&img.naturalWidth>0),'cooperative logo loads');
  assert.equal(await page.locator('meta[name="theme-color"]').getAttribute('content'),'#176b45','original theme retained');
  // Execute every source pattern through the real browser engine, including product-context variants.
  const collected=await page.evaluate(rows=>{
   const answers={},contexts={};for(const row of rows)for(const q of row.question_patterns){answers[q]=COOP_APP.answer(q);if(row.expected_rule){const c=COOP_APP.contextualize(q,row.expected_rule);contexts[row.expected_rule+'|'+q]=c;answers[c]=COOP_APP.answer(c);}if(row.id===48)answers['กู้สามัญ '+q]=COOP_APP.answer('กู้สามัญ '+q);}
   return {answers,contexts};
  },corpus.records);
  const result=runLegacy69({answer:q=>{assert.ok(Object.hasOwn(collected.answers,q),'browser query must have executed');return collected.answers[q];},contextualize:(q,k)=>collected.contexts[k+'|'+q]});
  assert.deepEqual(result.counts,{PASS:69,PARTIAL:0,FAIL:0},JSON.stringify(result.report.filter(x=>x.errors.length)));
  // Exercise the actual input and renderer for all 69 source records. Reset conversation between independent cases.
  for(const row of corpus.records){await page.evaluate(()=>{previousTopic='';conversationState=null;});await page.locator('#q').fill(row.question);await page.locator('#q').press('Enter');const rendered=await page.locator('#out .body').textContent();assert.equal(rendered,collected.answers[row.question].answer,'rendered source question '+row.id);}
  const ask=async q=>{await page.locator('#q').fill(q);await page.locator('#q').press('Enter');};
  for(const [name,expected]of [['สามัญ',/6 เดือน/],['ฉุกเฉิน',/3 เดือน/],['รวมหนี้',/3 ปี/],['เคหะ',/6 เดือน/],['ไถ่ถอนจำนอง',/12 เดือน/]]){
   await ask('กู้'+name+'ต้องเป็นสมาชิกกี่เดือน');const answer=await page.locator('#out .body').textContent();assert.match(answer,expected);assert.doesNotMatch(answer,/undefined|NaN/);
  }
  await ask('กู้ไถ่ถอนจำนองวงเงินสูงสุดเท่าไร');assert.match(await page.locator('#out .body').textContent(),/ยอดหนี้จำนองเดิม.*3,000,000/);
  await ask('กู้ฉุกเฉินใหม่ได้ไหม');await page.getByRole('textbox',{name:'ตอบข้อมูลเพิ่มเติม',exact:true}).fill('2 งวด');await page.getByRole('button',{name:'ส่งคำตอบ',exact:true}).click();assert.match(await page.locator('#out .body').textContent(),/ยังไม่|ยังไม่ได้/);
  await ask('กู้ฉุกเฉินใหม่ได้ไหม');await page.getByRole('textbox',{name:'ตอบข้อมูลเพิ่มเติม',exact:true}).fill('3 งวด');await page.getByRole('button',{name:'ส่งคำตอบ',exact:true}).click();assert.match(await page.locator('#out .body').textContent(),/ผ่านเงื่อนไข/);
  await ask('กู้รวมหนี้ดอกเบี้ยเท่าไหร่');await ask('แล้วผ่อนได้กี่งวด');assert.match(await page.locator('#out .body').textContent(),/360 งวด/);
  await ask('ยอดหนี้ของผมเหลือเท่าไร');assert.ok(await page.locator('#out a[href="https://member.dlasavingcoop.com/coop/"]').count());assert.equal(await page.locator('#out a').filter({hasText:'รายชื่อเจ้าหน้าที่'}).count(),0);
  await ask('กู้สามัญ');assert.ok(await page.getByRole('button',{name:'🧮 ประเมินเงินกู้',exact:true}).count());
  assert.ok(await page.locator('a[href="https://www.facebook.com/Dlasavingcooppage"]').count());
  assert.ok(await page.locator('text=Pilot Version').count());
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no mobile horizontal overflow');assert.deepEqual(errors,[],'no runtime JS error');
  if(process.env.MEMBER_BROWSER_OUTPUT_DIR){fs.mkdirSync(process.env.MEMBER_BROWSER_OUTPUT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.MEMBER_BROWSER_OUTPUT_DIR,'pilot-'+width+'.png'),fullPage:true});}
  console.log('BROWSER '+width+'px: 69/69 records, '+result.patterns+' source patterns, 69 rendered answers, follow-ups, self-service, Facebook, calculator and layout PASS');await page.close();
 }
}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
