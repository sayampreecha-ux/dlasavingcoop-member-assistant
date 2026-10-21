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
const evidenceDir=process.env.CALCULATOR_EVIDENCE_DIR;
const openCalculatorPopup=async(page,link,width,entry)=>{
 const ctx=page.context(),seen={pagesBefore:ctx.pages().length,events:[]},children=new Set();
 const record=(type,detail={})=>seen.events.push({at:new Date().toISOString(),elapsedMs:Date.now()-started,type,...detail});
 const started=Date.now();
 const external=u=>/https:\/\/(?:script\.google\.com|[^/]*googleusercontent\.com)\//.test(u);
 const requestFailed=request=>{if(external(request.url()))record('requestfailed',{url:request.url(),error:request.failure()?.errorText||'unknown'});};
 const response=response=>{if(external(response.url()))record('response',{url:response.url(),status:response.status(),redirectFrom:response.request().redirectedFrom()?.url()||null});};
 const attachChild=opened=>{
  if(children.has(opened))return;
  children.add(opened);
  record('context.page',{url:opened.url(),openerKnown:!opened.isClosed()});
  opened.on('framenavigated',frame=>{if(frame===opened.mainFrame())record('popup.framenavigated',{url:frame.url()});});
  opened.on('requestfailed',requestFailed);
  opened.on('response',response);
  opened.on('close',()=>record('popup.closed'));
 };
 const popup=opened=>{record('page.popup',{url:opened.url()});attachChild(opened);};
 const contextPage=opened=>attachChild(opened);
 const navigation=frame=>{if(frame===page.mainFrame())record('origin.framenavigated',{url:frame.url()});};
 ctx.on('requestfailed',requestFailed);
 ctx.on('response',response);
 ctx.on('page',contextPage);
 page.on('popup',popup);
 page.on('framenavigated',navigation);
 let traceStarted=false;
 try{
  if(evidenceDir){await ctx.tracing.start({screenshots:true,snapshots:true,sources:false});traceStarted=true;}
  record('click.start',{entry,width});
  const popupPromise=page.waitForEvent('popup',{timeout:30000});
  await link.click();
  record('click.done');
  const opened=await popupPromise;
  record('popup.received',{url:opened.url()});
  if(evidenceDir){
   fs.mkdirSync(evidenceDir,{recursive:true});
   const prefix=path.join(evidenceDir,'popup-'+width+'-'+entry);
   await opened.waitForURL(url,{waitUntil:'commit',timeout:60000});
   record('popup.url.confirmed',{url:opened.url()});
   const diagnostic={status:'PASS',width,entry,pageUrl:page.url(),popupUrl:opened.url(),linkHref:await link.getAttribute('href'),pagesAfter:ctx.pages().map(p=>p.url()),...seen};
   fs.writeFileSync(prefix+'.json',JSON.stringify(diagnostic,null,2));
   await page.screenshot({path:prefix+'.png',fullPage:true});
   if(traceStarted){await ctx.tracing.stop({path:prefix+'.zip'});traceStarted=false;}
  }
  return opened;
 }catch(error){
  const diagnostic={width,entry,pageUrl:page.url(),linkHref:await link.getAttribute('href'),target:await link.getAttribute('target'),rel:await link.getAttribute('rel'),linkVisible:await link.isVisible(),pagesAfter:ctx.pages().map(p=>p.url()),...seen,error:String(error)};
  console.error('CALCULATOR_POPUP_DIAGNOSTIC',JSON.stringify(diagnostic));
  if(evidenceDir){fs.mkdirSync(evidenceDir,{recursive:true});const prefix=path.join(evidenceDir,'popup-'+width+'-'+entry);fs.writeFileSync(prefix+'.json',JSON.stringify(diagnostic,null,2));await page.screenshot({path:prefix+'.png',fullPage:true}).catch(e=>console.error('SCREENSHOT_ERROR',String(e)));if(traceStarted){await ctx.tracing.stop({path:prefix+'.zip'}).catch(e=>console.error('TRACE_ERROR',String(e)));traceStarted=false;}}
  throw error;
 }finally{
  if(traceStarted)await ctx.tracing.stop().catch(()=>{});
  ctx.off('requestfailed',requestFailed);
  ctx.off('response',response);
  ctx.off('page',contextPage);
  page.off('popup',popup);
  page.off('framenavigated',navigation);
  for(const opened of children){opened.off('requestfailed',requestFailed);opened.off('response',response);}
 }
};
try{for(const width of [390,1365]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(process.env.MEMBER_APP_URL||'http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle'});
 check(width+' home has no calculator',0,await page.locator('[data-ordinary-loan-calculator]').count());
 check(width+' first main menu remains shares','หุ้นและทุนเรือนหุ้น',await page.locator('#home .grid > button').first().getAttribute('data-q'));
 check(width+' unique homepage assessment',1,await page.locator('#home [data-q="ทดลองคำนวณเงินกู้"]').count());
 check(width+' assessment is first in additional services',1,await page.locator('#home .chips [data-q="ทดลองคำนวณเงินกู้"]').count());
 check(width+' first additional service is assessment','ทดลองคำนวณเงินกู้',await page.locator('#home .chips > button').first().getAttribute('data-q'));
 check(width+' assessment absent from main grid',0,await page.locator('#home .grid [data-q="ทดลองคำนวณเงินกู้"]').count());
 const homeCard=await page.locator('#home .chips > button').first().boundingBox();check(width+' first assessment chip fits viewport',true,homeCard.x>=0&&homeCard.x+homeCard.width<=width+1);
 check(width+' existing main menu order retained',['หุ้นและทุนเรือนหุ้น','เงินกู้มีกี่แบบ','วิธีชำระเงินสหกรณ์','เงินฝาก','เรื่องสมาชิก','สวัสดิการมีกี่แบบ','ฌาปนกิจสงเคราะห์','ติดตามผลและสถานะเอกสาร'],await page.locator('#home .grid > button').evaluateAll(elements=>elements.map(el=>el.getAttribute('data-q'))));

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
 const popup=await openCalculatorPopup(page,link,width,'ordinary-menu');
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
 const entryPopup=await openCalculatorPopup(page,entry,width,'homepage-assessment');
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
