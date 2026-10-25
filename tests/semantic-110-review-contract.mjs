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
