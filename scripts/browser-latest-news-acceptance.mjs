import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(new URL('../',import.meta.url).pathname);
const dir=path.join(root,'news-browser-evidence');
fs.mkdirSync(dir,{recursive:true});
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const report={head:process.env.GITHUB_SHA||null,viewportResults:[]};
try{
 for(const width of [390,1365]){
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});
  try{
   await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelectorAll('#latestOfficialNewsList a').length===5,{timeout:15000});
   const actual=await page.locator('#latestOfficialNewsList a').evaluateAll(links=>links.map(a=>({title:a.querySelector('strong')?.textContent||'',date:a.querySelector('small')?.textContent||'',href:a.href})));
   assert.deepEqual(actual.map(x=>new URL(x.href).searchParams.get('No')),['4944','4941','4937','4936','4935']);
   assert.equal(new Set(actual.map(x=>x.href)).size,5);
   assert.ok(actual.every(x=>/^https:\/\/www\.dlasavingcoop\.com\/show\.php\?No=\d+$/.test(x.href)&&x.date.includes('2569')));
   assert.equal(await page.locator('#latestOfficialNews').isVisible(),true);
   assert.equal(await page.locator('#homeBtn').count(),1);
   await page.screenshot({path:path.join(dir,'latest-news-'+width+'.png'),fullPage:true});
   assert.deepEqual(errors,[]);
   report.viewportResults.push({width,status:'PASS',actual,errors});
   console.log('NEWS_BROWSER '+width+'px PASS');
  }catch(e){report.viewportResults.push({width,status:'FAIL',error:String(e),errors});throw e;}finally{await page.close();}
 }
}finally{
 fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,2));
 await browser.close();await new Promise(resolve=>server.close(resolve));
}
