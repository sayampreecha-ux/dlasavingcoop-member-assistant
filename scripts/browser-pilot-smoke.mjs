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
  // Wait for the asynchronous official-source refresh before capturing expected answers.
  await page.waitForFunction(()=>document.getElementById('q') && !document.getElementById('q').disabled);
  await page.locator('.brand-logo').waitFor({state:'visible'});
  await page.evaluate(()=>{window.__memberRenderVersion=0;const out=document.getElementById('out');new MutationObserver(()=>{window.__memberRenderVersion++}).observe(out,{childList:true,subtree:true,characterData:true});});
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
  for(const row of corpus.records){
   await page.evaluate(()=>{previousTopic='';conversationState=null;});
   const expected=collected.answers[row.question].answer;
   const before=await page.evaluate(()=>window.__memberRenderVersion||0);
   await page.locator('#q').fill(row.question);await page.locator('#q').press('Enter');
   await page.waitForFunction(v=>(window.__memberRenderVersion||0)>v&&!!document.querySelector('#out .body'),before,{timeout:30000});
   const rendered=await page.locator('#out .body').textContent();
   assert.equal(rendered,expected,'rendered source question '+row.id+' ['+row.question+']');
  }
  const ask=async q=>{await page.locator('#q').fill(q);await page.locator('#q').press('Enter');};
  for(const [name,expected]of [['สามัญ',/6 เดือน/],['ฉุกเฉิน',/3 เดือน/],['รวมหนี้',/3 ปี/],['เคหะ',/6 เดือน/],['ไถ่ถอนจำนอง',/12 เดือน/]]){
   await ask('กู้'+name+'ต้องเป็นสมาชิกกี่เดือน');const answer=await page.locator('#out .body').textContent();assert.match(answer,expected);assert.doesNotMatch(answer,/undefined|NaN/);
  }
  await ask('กู้ไถ่ถอนจำนองวงเงินสูงสุดเท่าไร');assert.match(await page.locator('#out .body').textContent(),/ยอดหนี้จำนองเดิม.*3,000,000/);
  await ask('กู้ฉุกเฉินใหม่ได้ไหม');await page.getByRole('textbox',{name:'ตอบข้อมูลเพิ่มเติม',exact:true}).fill('2 งวด');await page.getByRole('button',{name:'ส่งคำตอบ',exact:true}).click();assert.match(await page.locator('#out .body').textContent(),/ยังไม่|ยังไม่ได้/);
  await ask('กู้ฉุกเฉินใหม่ได้ไหม');await page.getByRole('textbox',{name:'ตอบข้อมูลเพิ่มเติม',exact:true}).fill('3 งวด');await page.getByRole('button',{name:'ส่งคำตอบ',exact:true}).click();assert.match(await page.locator('#out .body').textContent(),/ผ่านเงื่อนไข/);
  await ask('กู้รวมหนี้ดอกเบี้ยเท่าไหร่');await ask('แล้วผ่อนได้กี่งวด');assert.match(await page.locator('#out .body').textContent(),/360 งวด/);
  await ask('ยอดหนี้ของผมเหลือเท่าไร');assert.ok(await page.locator('#out a[href="https://member.dlasavingcoop.com/coop/"]').count());assert.equal(await page.locator('#out a').filter({hasText:'รายชื่อเจ้าหน้าที่'}).count(),0);
  // Final Acceptance regressions: physical UI submission and offered buttons, on both viewports.
  const fresh=async question=>{await page.locator('#homeBtn').click();await ask(question);};
  const body=()=>page.locator('#out .body').textContent();
  const follow=async value=>{await page.getByRole('textbox',{name:'ตอบข้อมูลเพิ่มเติม',exact:true}).fill(value);await page.getByRole('button',{name:'ส่งคำตอบ',exact:true}).click();};
  const choose=label=>page.locator('#out .follow').getByRole('button',{name:label,exact:true}).click();
  const ordinary=async()=>{await fresh('ผมกู้สามัญได้ไหม');for(const value of ['12 เดือน','200000 บาท','12 งวด','30000 บาท','10000 บาท','1 คน','120 งวด','45 ปี'])await follow(value);};
  await ordinary();assert.match(await body(),/12 งวด.*ค้าง/);
  await choose('ไม่มี');assert.match(await body(),/หนี้กับสหกรณ์อื่น/);
  await choose('ไม่มี');assert.match(await body(),/ผ่านเงื่อนไขหลัก.*ผลอนุมัติจริงยังต้องตรวจ/);
  await ordinary();await follow('ไม่มี');assert.match(await body(),/หนี้กับสหกรณ์อื่น/);await follow('ไม่มี');assert.match(await body(),/ผ่านเงื่อนไขหลัก/);
  await ordinary();await choose('มี');assert.match(await body(),/ยังไม่ผ่าน/);
  for(const [question,expected]of [['ผ่อนได้กี่งวด',/240 งวด/],['กู้ใหม่หักกลบสัญญาเดิมต้องส่งกี่งวด',/12 งวด.*หักกลบ/],['กู้ต้องค้ำกี่คน',/500,000.*1 คน/]]){
   await fresh(question);await choose('กู้สามัญ');assert.match(await body(),expected,'type choice must answer the original question');
  }
  await fresh('ผ่อนได้กี่งวด');await ask('กู้ฉุกเฉินวงเงินสูงสุดเท่าไร');assert.match(await body(),/30,000.*60,000/);assert.doesNotMatch(await body(),/ผ่อนได้/);
  await fresh('ขอสวัสดิการบุตรต้องใช้เอกสารอะไร');assert.match(await body(),/คลอดบุตร.*ทุนการศึกษา/);
  await choose('คลอดบุตร');assert.match(await body(),/คลอดบุตร/);assert.ok(await page.locator('#out a[href*="1Xzby7B_dQqS3Uwn6dfXp07h7OxgW_M9I"]').count(),'childbirth must expose direct welfare original');
  await fresh('ขอสวัสดิการบุตรต้องใช้เอกสารอะไร');await choose('ทุนการศึกษาบุตร');assert.match(await body(),/ทุน|การศึกษา/);
  await fresh('ขอรายละเอียดเพิ่มเติม');await choose('เป็นเรื่องสวัสดิการ');assert.equal(await page.locator('#out .follow').getByRole('button',{name:'เป็นเรื่องสวัสดิการ',exact:true}).count(),0);assert.ok(await page.locator('#out .follow button').count());
  await fresh('กู้ฉุกเฉินใหม่ได้ไหม');await follow('2 งวด');assert.match(await body(),/ยังไม่ได้/);await ask('แก้เป็น 3 งวดครับ');assert.match(await body(),/ผ่านเงื่อนไข.*หักกลบ/);await ask('เปลี่ยนเป็น 2 งวดครับ');assert.match(await body(),/ยังไม่ได้/);
  await fresh('ผมกู้สามัญได้ไหม');await follow('5 เดือน');assert.match(await body(),/ยังไม่ผ่าน/);await ask('แก้เป็น 12 เดือนครับ');assert.match(await body(),/ต้องการกู้ประมาณเท่าไร/);
  await fresh('หุ้นของผมมีเท่าไร');assert.ok(await page.locator('#out a[href="https://member.dlasavingcoop.com/coop/"]').count());
  await fresh('กู้สามัญได้กี่บาทและลาออกต้องทำยังไง');assert.match(await body(),/2,000,000/);assert.match(await body(),/ลาออก/);assert.ok(await page.locator('#out a[href*="member_end"]').count());
  await fresh('กู้สามัญใช้หุ้นค้ำได้ไหม');assert.match(await body(),/ทุนเรือนหุ้น.*ยังไม่มีหลักเกณฑ์เฉพาะ/);assert.doesNotMatch(await body(),/\d/);await page.locator('#out details.more summary').click();assert.match(await page.locator('#out').innerText(),/Evidence Lock/);
  await page.locator('#homeBtn').click();await page.getByRole('button',{name:'🧮 ประเมินเงินกู้',exact:true}).click();await choose('คำนวณกู้ฉุกเฉิน');
  assert.match(await body(),/ประเมินเงินกู้/);const calculatorActions=await page.locator('#out .actions').innerText();assert.doesNotMatch(calculatorActions,/เงินกู้สามัญ/);assert.match(calculatorActions,/เงินกู้ฉุกเฉิน/);await page.locator('#out details.more summary').click();assert.match(await page.locator('#out').innerText(),/ไม่ใช่ผลอนุมัติสินเชื่อ/);
  await fresh('กู้ฉุกเฉิน');await page.getByRole('button',{name:'🧮 ประเมินเงินกู้',exact:true}).click();assert.match(await body(),/ประเมินเงินกู้/);assert.doesNotMatch(await page.locator('#out .actions').innerText(),/เงินกู้สามัญ/);assert.match(await page.locator('#out .actions').innerText(),/เงินกู้ฉุกเฉิน/);
  console.log('FINAL ACCEPTANCE UI '+width+'px: all eight reported issues, positive/negative facts, main-input corrections and type/category buttons PASS');
  await ask('กู้สามัญ');assert.ok(await page.getByRole('button',{name:'🧮 ประเมินเงินกู้',exact:true}).count());
  const fbNavLinks=await page.locator('a.fb[href*="facebook.com"]').evaluateAll(as=>as.map(a=>a.href));
  assert.ok(fbNavLinks.length>0,'Facebook navigation exists');
  assert.ok(fbNavLinks.every(h=>h==='https://www.facebook.com/dlasaving'),'all Facebook navigation uses canonical cooperative page');
  assert.equal(fbNavLinks.filter(h=>/\/share\//i.test(h)).length,0,'navigation must never use Facebook share URLs');
  assert.equal(fbNavLinks.filter(h=>/Dlasavingcooppage/i.test(h)).length,0,'no legacy Facebook vanity URL remains');
  await page.locator('#currentEvents:not(.hidden)').waitFor({state:'visible'});
  const shareCard=page.locator('.now-card').filter({hasText:'การกำหนดอัตราเงินได้รายเดือน และการถือหุ้น พ.ศ. 2569'});
  if(await shareCard.count()){
    const direct=shareCard.locator('a[data-direct-source="true"]');
    assert.equal(await direct.count(),1,'share-rate card must expose exactly one direct original');
    assert.equal(await direct.textContent(),'โพสต์ต้นฉบับจาก Facebook');
    assert.equal(await direct.getAttribute('href'),'https://www.facebook.com/share/p/1EvnJMdZzn/?mibextid=wwXIfr');
    assert.doesNotMatch(await shareCard.innerText(),/กำลังตรวจต้นฉบับ/);
  }
  const directCards=page.locator('.now-card a[data-direct-source="true"]');
  const directHrefs=await directCards.evaluateAll(as=>as.map(a=>a.href));
  assert.ok(directHrefs.every(h=>/dlasavingcoop\.com\/show\.php\?No=\d+/i.test(h)||/drive\.google\.com\/file\/d\//i.test(h)||/facebook\.com\/share\/p\/[A-Za-z0-9_-]+\/?/i.test(h)),'current-event original buttons must be direct sources');
  assert.ok(await page.locator('text=Pilot Version').count());
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no mobile horizontal overflow');assert.deepEqual(errors,[],'no runtime JS error');
  if(process.env.MEMBER_BROWSER_OUTPUT_DIR){fs.mkdirSync(process.env.MEMBER_BROWSER_OUTPUT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.MEMBER_BROWSER_OUTPUT_DIR,'pilot-'+width+'.png'),fullPage:true});}
  console.log('BROWSER '+width+'px: 69/69 records, '+result.patterns+' source patterns, 69 rendered answers, follow-ups, self-service, Facebook, calculator and layout PASS');await page.close();
 }
}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
