import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);
const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+'/')){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':'application/json');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='https://script.google.com/macros/s/AKfycbyyX1KfFiE68C8JE4i4IYFUlVb70QSBVVuNtzASt8kgO0A0KM12yhQeOlo0h2Rmxw1K1Q/exec';
const label='🧮 ทดลองคำนวณเงินกู้ (ระบบสหกรณ์)';
const note='คำนวณประมาณการผ่านระบบของสหกรณ์ ผลคำนวณไม่ใช่การอนุมัติเงินกู้';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let assertions=0;
const check=(id,expected,actual)=>{assert.deepEqual(actual,expected);assertions++;console.log(JSON.stringify({id,expected,actual,status:'PASS'}));};
try{for(const width of [390,1365]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(process.env.MEMBER_APP_URL||'http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle'});
 check(width+' home has no calculator',0,await page.locator('[data-ordinary-loan-calculator]').count());
 await page.getByRole('button',{name:'💰 เงินกู้ ประเภท · หลักเกณฑ์ · ปิดหนี้',exact:true}).click();
 await page.locator('#out').getByRole('button',{name:'กู้สามัญ',exact:true}).click();
 const link=page.locator('#out').getByRole('link',{name:label,exact:true});
 check(width+' ordinary menu',true,(await page.locator('#out .body').innerText()).includes('เงินกู้สามัญ'));
 check(width+' unique button',1,await link.count());
 check(width+' visible button',true,await link.isVisible());
 check(width+' URL',url,await link.getAttribute('href'));
 check(width+' new tab','_blank',await link.getAttribute('target'));
 check(width+' rel','noopener noreferrer',await link.getAttribute('rel'));
 check(width+' disclaimer',note,await page.locator('#out [data-ordinary-loan-calculator-note]').innerText());
 const bounds=await link.boundingBox();check(width+' fits viewport',true,bounds.x>=0&&bounds.x+bounds.width<=width+1);
 const before=await page.locator('#out').innerText(),history=await page.locator('#readingHistory').innerText();
 const popupPromise=page.waitForEvent('popup');await link.click();const popup=await popupPromise;
 await popup.waitForURL(url,{waitUntil:'commit',timeout:60000});
 check(width+' click opens expected URL',url,popup.url());
 await popup.close();await page.bringToFront();
 check(width+' conversation preserved',before,await page.locator('#out').innerText());
 check(width+' history preserved',history,await page.locator('#readingHistory').innerText());
 await page.locator('#q').fill('กู้สามัญ');await page.locator('#q').press('Enter');
 check(width+' repeat no duplicate',1,await page.locator('#out [data-ordinary-loan-calculator]').count());
 for(const query of ['กู้ฉุกเฉิน','กู้พัฒนาคุณภาพชีวิต','กู้เคหะ','กู้เพื่อการศึกษา','กู้ภัยพิบัติ','กู้ไม่เกินทุนเรือนหุ้น','กู้ปรับโครงสร้างหนี้','กู้ในฐานะผู้ค้ำประกัน','หุ้นและทุนเรือนหุ้น']){
  await page.locator('#q').fill(query);await page.locator('#q').press('Enter');
  check(width+' other menu '+query,0,await page.locator('#out [data-ordinary-loan-calculator]').count());
  check(width+' existing answer '+query,true,(await page.locator('#out .body').innerText()).length>20);
 }
 // Reproduce the member's actual entry: homepage assessment, then ordinary calculator.
 await page.reload({waitUntil:'networkidle'});
 await page.getByRole('button',{name:'🧮 ประเมินเงินกู้',exact:true}).click();
 const entry=page.locator('#out').getByRole('link',{name:label,exact:true});
 check(width+' assessment direct link',1,await entry.count());
 check(width+' assessment old dead-end replaced',0,await page.locator('#out').getByRole('button',{name:'คำนวณกู้สามัญ',exact:true}).count());
 for(const name of ['คำนวณกู้ฉุกเฉิน','คำนวณกู้รวมหนี้','คำนวณกู้เคหะ'])check(width+' assessment retains '+name,true,await page.locator('#out').getByRole('button',{name,exact:true}).isVisible());
 const entryBounds=await entry.boundingBox();check(width+' assessment fits viewport',true,entryBounds.x>=0&&entryBounds.x+entryBounds.width<=width+1);
 check(width+' assessment disclaimer',note,await page.locator('#out [data-ordinary-loan-calculator-note]').innerText());
 const entryBefore=await page.locator('#out').innerText(),entryHistory=await page.locator('#readingHistory').innerText();
 const entryPopupPromise=page.waitForEvent('popup');await entry.click();const entryPopup=await entryPopupPromise;
 await entryPopup.waitForURL(url,{waitUntil:'commit',timeout:60000});check(width+' assessment opens official calculator',url,entryPopup.url());
 await entryPopup.close();await page.bringToFront();check(width+' assessment conversation preserved',entryBefore,await page.locator('#out').innerText());check(width+' assessment history preserved',entryHistory,await page.locator('#readingHistory').innerText());
 for(const query of ['คำนวณกู้สามัญ','คำนวนกู้สามัญ','ทดลองคำนวณเงินกู้สามัญ']){
  await page.locator('#q').fill(query);await page.locator('#q').press('Enter');
  check(width+' typed ordinary assessment '+query,1,await page.locator('#out').getByRole('link',{name:label,exact:true}).count());
  check(width+' typed ordinary disclaimer '+query,note,await page.locator('#out [data-ordinary-loan-calculator-note]').innerText());
 }
 for(const query of ['คำนวณกู้ฉุกเฉิน','คำนวณกู้รวมหนี้','คำนวณกู้เคหะ']){
  await page.locator('#q').fill(query);await page.locator('#q').press('Enter');
  check(width+' other assessment unchanged '+query,0,await page.locator('#out [data-ordinary-loan-calculator]').count());
  check(width+' other assessment still safe '+query,true,(await page.locator('#out').innerText()).includes('SAFE CALCULATOR'));
 }
 await page.locator('#homeBtn').click();check(width+' home visible',true,await page.locator('#q').isVisible());
 check(width+' JS errors',[],errors);await page.close();
}console.log('ORDINARY CALCULATOR BROWSER:',assertions,'assertions PASS on mobile 390 and desktop 1365');}
finally{await browser.close();await new Promise(r=>server.close(r));}
