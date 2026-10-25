import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const report=JSON.parse(fs.readFileSync(new URL('../docs/quality/semantic-full-answer-review-110-20261024.json',import.meta.url),'utf8'));
const html=fs.readFileSync(new URL('../index.html',import.meta.url));
const hash=createHash('sha1').update(Buffer.from(`blob ${html.length}\0`)).update(html).digest('hex');
assert.equal(report.runtimeIndexBlobSHA,hash,'manual review must match exact runtime blob');
assert.equal(report.rows.length,110);
const app=loadMemberEngine(),counts={};let state,domain;
for(const row of report.rows){
 if(domain!==row.domain){state=undefined;domain=row.domain;}
 const t=app.conversationTurn(row.question,state,{continuation:row.turn>1});state=t.state;
 assert.equal(t.result.answer,row.answerFull,`${domain}/${row.turn}: reviewed FULL answer is stale`);
 assert.equal(JSON.stringify(t.result.sources.map(x=>({title:x.title,url:x.url}))),JSON.stringify(row.sourceRefs),`${domain}/${row.turn}: reviewed sources are stale`);
 assert.equal(row.reviewAccepted,true);
 assert.ok(['CORRECT','SAFE_HANDOFF'].includes(row.status),`${domain}/${row.turn}: unresolved semantic disposition`);
 assert.ok(row.reason.length>50&&row.sourceRefs.length>0,`${domain}/${row.turn}: missing explicit evidence/reason`);
 counts[row.status]=(counts[row.status]||0)+1;
}
assert.equal(counts.CORRECT,report.summary.CORRECT);assert.equal(counts.SAFE_HANDOFF,report.summary.SAFE_HANDOFF);
console.log('110 full answers + exact sourceRefs match independently authored review; '+JSON.stringify(counts));

// Apply the same published monitor as Browser and preserve its separate locked variant.
const monitorBytes=fs.readFileSync(new URL('../data/official-source-monitor.json',import.meta.url));
const monitorHash=createHash('sha1').update(Buffer.from(`blob ${monitorBytes.length}\0`)).update(monitorBytes).digest('hex');
assert.equal(report.sourceMonitorBlobSHA,monitorHash,'reviewed monitor snapshot changed');
const monitored=loadMemberEngine();monitored.applySourceMonitor(JSON.parse(monitorBytes));
state=undefined;domain=undefined;let variants=0;
for(const row of report.rows){
 if(domain!==row.domain){state=undefined;domain=row.domain;}
 const t=monitored.conversationTurn(row.question,state,{continuation:row.turn>1});state=t.state;
 const expected=row.monitorVariants?.[0]||row;
 if(row.monitorVariants){variants++;assert.equal(row.status,'SAFE_HANDOFF');assert.match(expected.reason,/pending-guarantor gate/);}
 assert.equal(t.result.answer,expected.answerFull,`${domain}/${row.turn}: full monitored answer differs`);
 assert.equal(JSON.stringify(t.result.sources.map(x=>({title:x.title,url:x.url}))),JSON.stringify(expected.sourceRefs),`${domain}/${row.turn}: monitored sources differ`);
 if(domain==='emergency-loan'&&[6,7].includes(row.turn)){
  assert.equal(t.state.topic,'emergencyLoanCurrent');assert.doesNotMatch(t.result.answer,/เป็นผู้ค้ำประกันของเงินกู้ประเภทใด/);
 }
}
assert.equal(variants,1);console.log('Published-monitor full110 parity PASS; retired-guarantor lock preserved; emergency facets stay in product');

// Each reviewed citation needs a recorded successful availability check.
const links=JSON.parse(fs.readFileSync(new URL('../docs/quality/pr166-final-source-link-validation-20261025.json',import.meta.url),'utf8'));
const availableHTTP=new Set(links.httpURLs.filter(x=>x.http==='200').map(x=>x.url));
const availableDrive=new Set(links.driveFiles.filter(x=>x.metadataAvailable).map(x=>x.id));
for(const row of report.rows)for(const ref of row.sourceRefs){
 const id=ref.url.match(/drive\.google\.com\/file\/d\/([^/]+)/)?.[1];
 assert.ok(id?availableDrive.has(id):availableHTTP.has(ref.url),row.domain+'/'+row.turn+' missing checked source URL: '+ref.url);
 assert.doesNotMatch(ref.url,/change%20member%20information27012023/,'dead legacy source must not return');
}
assert.ok(report.rows.find(x=>x.domain==='membership'&&x.turn===7).sourceRefs.some(x=>x.url.includes('1Q-L8lPZ')));
console.log('All110 sourceRefs have availability evidence; active member-change form replaces proven404');
