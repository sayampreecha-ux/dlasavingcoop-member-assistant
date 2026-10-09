import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {depositCases} from '../tests/special-deposit-mass-acceptance.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);let server,url=process.env.MEMBER_APP_URL;
if(!url){server=http.createServer((req,res)=>{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(p==='/'?'/index.html':p));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+'/';}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});let pass=0;
try{for(const width of [390,1365]){const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.goto(url,{waitUntil:'networkidle'});
 for(const [q,...patterns]of depositCases){await page.locator('#homeBtn').click();await page.locator('#q').fill(q);await page.locator('#q').press('Enter');await page.locator('#out .body').waitFor();const text=await page.locator('#out').textContent();for(const p of patterns)assert.match(text,p,q+' '+width);pass++;}
 assert.deepEqual(errors,[]);await page.close();}console.log('BROWSER SPECIAL DEPOSIT: '+pass+' PASS / 0 FAIL on mobile and desktop');}
finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
