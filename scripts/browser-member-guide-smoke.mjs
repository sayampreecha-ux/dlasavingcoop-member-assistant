import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { strict as assert } from 'node:assert';
const browser = await chromium.launch({headless:true});
try {
  for (const width of [390,1365]) {
    const page=await browser.newPage({viewport:{width,height:844}});
    const failures=[];
    page.on('pageerror',e=>failures.push(e.message));
    await page.goto(pathToFileURL(resolve('index.html')).href);
    const entry=page.locator('a[href="./guide.html"]');
    await entry.waitFor({state:'visible'});
    assert.equal(await entry.getAttribute('href'),'./guide.html');
    await entry.click();
    await page.waitForURL(/guide\.html$/);
    assert.match(await page.title(),/คู่มือการใช้งาน/);
    assert.equal(await page.locator('details').count(),10);
    const topic=page.locator('details').first();
    await topic.locator('summary').click();
    assert.equal(await topic.evaluate(el=>el.open),true);
    await topic.locator('summary').click();
    assert.equal(await topic.evaluate(el=>el.open),false);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
    assert.equal(overflow,false,'horizontal overflow on guide');
    assert.equal(await page.locator('a[href="./index.html"]').count(),3);
    await page.getByRole('link',{name:'← กลับไปถาม AI'}).click();
    await page.waitForURL(/index\.html$/);
    await entry.waitFor({state:'visible'});
    assert.deepEqual(failures,[]);
    console.log('GUIDE_UX_PASS',JSON.stringify({width,topicCount:10,entry:true,back:true,noOverflow:true}));
    await page.close();
  }
} finally { await browser.close(); }
