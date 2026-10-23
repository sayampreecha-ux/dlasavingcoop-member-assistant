import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {languageCases} from '../tests/member-language-quality.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);let server,url=process.env.MEMBER_APP_URL;
if(!url){server=http.createServer((req,res)=>{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(p==='/'?'/index.html':p));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+'/';}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});let pass=0;
try{for(const width of [390,1365]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(url,{waitUntil:'networkidle'});
 const body=()=>page.locator('#out .body').textContent();
 for(const [q,...patterns]of languageCases){await page.locator('#homeBtn').click();await page.locator('#q').fill(q);await page.locator('#q').press('Enter');await page.locator('#out .body').waitFor();for(const p of patterns)assert.match(await body(),p,q+' '+width);pass++;}
 for(const [q,reply,p]of [['คลอดลูกขอเงินทำไง','ต้องใช้เอกสารอะไร',/สูติบัตร/],['แม่เสียต้องเตรียมไรบ้าง','ต้องใช้เอกสารอะไร',/มรณบัตร/],['ต้องส่งหุ้นเดือนละเท่าไหร่','32000',/130 หุ้น/],['ขอเงินค่าเทอมให้ลูกต้องใช้อะไรบ้าง','กู้เพื่อการศึกษา',/สถานศึกษา/]]){
  await page.locator('#homeBtn').click();await page.locator('#q').fill(q);await page.locator('#q').press('Enter');await page.locator('#out .body').waitFor();
  await page.getByLabel('ตอบข้อมูลเพิ่มเติม',{exact:true}).fill(reply);await page.getByRole('button',{name:'ส่งคำตอบ',exact:true}).click();assert.match(await body(),p);pass++;
 }
 // Targeted production QA: full UI input path on both viewports, including same-session follow-ups.
 const send=async q=>{await page.locator('#q').fill(q);await page.locator('#q').press('Enter');};
 const verify=async(pattern,tag)=>{await page.locator('#out .body').filter({hasText:pattern}).first().waitFor({timeout:10000});assert.match(await body(),pattern,tag+' '+width);pass++;};
 for(const q of ['ค้ำให้เพื่อนหลายคนแล้ว ยังขอกู้เองได้ไหม','ค้ำอยู่หลายสัญญา จะกู้เพิ่มได้บ่']){
  await page.locator('#homeBtn').click();await send(q);await verify(/การค้ำประกันเงินกู้ให้ผู้อื่นกับการขอกู้เงินของตนเองเป็นคนละประเด็น/,q);
  assert.match(await body(),/ฝ่ายสินเชื่อ/);
 }
 await page.locator('#homeBtn').click();await send('เงินฝากออมทรัพย์พิเศษ');await send('ถอนเงินอย่างไร');await send('ใช้เอกสารอะไร');
 await verify(/สำหรับการถอนเงินฝากออมทรัพย์พิเศษ ต้องตรวจแบบคำขอถอน/, 'special deposit withdrawal documents');
 await page.locator('#homeBtn').click();await send('ติดตามเอกสารเงินกู้');await send('เอกสารเงินกู้สามัญ');await send('ต้องติดต่อฝ่ายไหน');
 await verify(/ติดตามเอกสารเงินกู้สามัญที่เคยยื่นแล้ว/, 'loan tracking staff contact');
 assert.match(await body(),/ฝ่ายสินเชื่อ/);
 // Public synthetic cases for PR158: exercise visible UI; never include the private corpus.
 let pr158Pass=0;
 for(const duration of ['ไม่ถึง 3 ปี','ยังไม่ครบ 3 ปี','น้อยกว่า 36 เดือน','เกิน 3 ปี','มากกว่า 3 ปี','ไม่เกิน 3 ปี']){
  await page.locator('#homeBtn').click();
  await send('จะขอกู้พัฒนาคุณภาพชีวิต เป็นสมาชิก'+duration+' มีฉุกเฉินอยู่ แต่ไม่มีกู้สามัญ');
  await verify(/โปรดระบุอายุสมาชิกจริงเป็นปีและเดือน/,'bounded membership '+duration);
  assert.ok((await body()).includes(duration),'preserve the original duration bound');
  assert.doesNotMatch(await body(),/✓.*อายุสมาชิก|อายุสมาชิก[^\n]*\[PASS\]|ผ่านเงื่อนไขที่ตรวจได้/);
  pr158Pass++;
 }
 for(const [q,operation,completion]of [['เปิดบัญชีออมทรัพย์ต้องทำอย่างไร',/เปิดบัญชี/,/ขั้นตอนเปิดบัญชีเงินฝากออมทรัพย์พิเศษ/],['ถอนเงินฝากต้องใช้เอกสารใด',/ถอนและส่งเอกสาร/,/การถอนเงินฝากออมทรัพย์พิเศษใช้คำขอถอน/]]){
  await page.locator('#homeBtn').click();await send(q);
  await verify(/เป็นเงินฝากประเภทใด/,'member deposit operation intake');
  assert.match(await body(),operation);
  assert.doesNotMatch(await body(),/พบเอกสารทางการที่อาจเปลี่ยนเงื่อนไข/);
  await page.getByLabel('ตอบข้อมูลเพิ่มเติม',{exact:true}).fill('ออมทรัพย์พิเศษ');
  await page.getByRole('button',{name:'ส่งคำตอบ',exact:true}).click();
  await verify(completion,'deposit type reply retains operation');
  assert.doesNotMatch(await body(),/พบเอกสารทางการที่อาจเปลี่ยนเงื่อนไข/);
  pr158Pass+=2;
 }
 await page.locator('#homeBtn').click();await send('ขอกู้เงิน 100,000 บาท ต้องผ่อนเดือนเท่าไหร่');
 await verify(/เป็นเงินกู้ประเภทไหน/,'installment loan product intake');
 await page.getByLabel('ตอบข้อมูลเพิ่มเติม',{exact:true}).fill('กู้สามัญ');
 await page.getByRole('button',{name:'ส่งคำตอบ',exact:true}).click();
 await verify(/ต้องการผ่อนกี่งวดหรือกี่ปี/,'installment term follow-up');
 assert.match(await body(),/100,000/);assert.doesNotMatch(await body(),/อนุมัติแล้ว|ผ่านแน่นอน/);
 pr158Pass+=2;
 // Product chips must retain an unfinished deposit operation, just like typed replies.
 for(const [question,completion]of [['จะเปิดบัญชีเงินฝากต้องทำอย่างไร',/ขั้นตอนเปิดบัญชีเงินฝากออมทรัพย์พิเศษ/],['ถอนเงินฝากต้องเตรียมเอกสารอะไร',/การถอนเงินฝากออมทรัพย์พิเศษใช้คำขอถอน/]]){
  await page.locator('#homeBtn').click();await send(question);
  await verify(/เป็นเงินฝากประเภทใด/,'deposit operation before product chip');
  await page.locator('#out .deposit-navigation button').filter({hasText:/^ออมทรัพย์พิเศษ$/}).click();
  await verify(completion,'deposit product chip retains operation');
  assert.equal(await page.evaluate(()=>conversationState.result.intent),/เปิด/.test(question)?'deposit_open':'deposit_special_withdraw');
  assert.doesNotMatch(await body(),/ต้องการเปิดบัญชี ฝากเพิ่ม ถอน ปิดบัญชี/);
  // Explicit navigation is still allowed to start another operation or product menu.
  await page.locator('#out .deposit-navigation button').filter({hasText:/^กลับเมนูเงินฝาก$/}).click();
  await verify(/ต้องการทำรายการเงินฝากประเภทใด/,'explicit menu clears pending operation');
  pr158Pass+=3;
 }
 for(const reply of ['กู้สามัญ','กู้ไถ่ถอนจำนอง']){
  await page.locator('#homeBtn').click();await send('ที่ดินจำนองอยู่ ถ้ากู้สามัญใหม่ต้องห่างกี่เดือน');
  await verify(/หมายถึงจะกู้ไถ่ถอนจำนอง/,'mortgage interval clarification');
  await page.locator('#out .follow button').filter({hasText:new RegExp('^'+reply+'$')}).click();
  await verify(/รับทราบว่าเป็น/,'mortgage interval choice retained');
  assert.equal(await page.evaluate(()=>conversationState.result.intent),'mortgage_interval_review');
  assert.equal(await page.evaluate(()=>conversationState.result.decision),'EVIDENCE_LOCK');
  assert.doesNotMatch(await body(),/หมายถึงจะกู้ไถ่ถอน/);pr158Pass+=2;
 }
 console.log('PR158_PUBLIC_UI '+width+'px: '+pr158Pass+' checks PASS; bounded duration, deposit and mortgage choices, and follow-up amount retention; private set not included');
 assert.deepEqual(errors,[]);await page.close();
}console.log('BROWSER MEMBER LANGUAGE:',pass,'PASS / 0 FAIL on mobile and desktop');}
finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
