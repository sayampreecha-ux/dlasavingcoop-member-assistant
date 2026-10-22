import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const root=path.resolve(new URL('../',import.meta.url).pathname);
const output=path.join(root,'news-browser-evidence');
fs.mkdirSync(output,{recursive:true});
const sandbox=fs.mkdtempSync(path.join(os.tmpdir(),'coop-live-news-'));
fs.cpSync(path.join(root,'scripts'),path.join(sandbox,'scripts'),{recursive:true});
fs.mkdirSync(path.join(sandbox,'data'));
const dataPath=path.join(sandbox,'data/current-events.json');
const prior=fs.readFileSync(path.join(root,'data/current-events.json'));
const report={head:process.env.GITHUB_SHA||null,mode:'live-official-ingestion',status:'NOT_VERIFIED',items:[]};
try{
 const baseline=JSON.parse(prior.toString('utf8'));
 // Remove hand-seeded entries to prove the fetcher rediscovers each item.
 baseline.latestNews=[];
 baseline.trackingNotices=[];
 fs.writeFileSync(dataPath,JSON.stringify(baseline,null,2)+'\n');
 const run=spawnSync(process.execPath,['scripts/update-current-events.mjs'],{cwd:sandbox,encoding:'utf8',timeout:300000,env:{...process.env,NEWS_PIPELINE_DIAGNOSTICS:'1',NEWS_DIAGNOSTIC_IDS:'official-4944,official-4941'}});
 report.stdout=run.stdout?.slice(-12000);report.stderr=run.stderr?.slice(-3000);
 const diagnostic=(run.stdout||'').split('\n').find(line=>line.startsWith('NEWS_PIPELINE_DIAGNOSTICS '));
 if(diagnostic){try{report.pipeline=JSON.parse(diagnostic.slice('NEWS_PIPELINE_DIAGNOSTICS '.length));}catch{report.pipelineRaw=diagnostic.slice(0,3000);}}

 const stages=(run.stdout||'').split('\n').find(line=>line.startsWith('NEWS_PIPELINE_STAGES '));
 if(stages)report.stages=JSON.parse(stages.slice('NEWS_PIPELINE_STAGES '.length));
 assert.equal(run.status,0,'official ingestion process failed');
 const fresh=JSON.parse(fs.readFileSync(dataPath,'utf8'));
 assert.ok(fresh.sourceHealth?.notices==='ok','official notices source unavailable');
 const expected=new Map([['official-4944','2026-10-21T09:18:07.000Z'],['official-4941','2026-10-14T02:14:23.000Z']]);
 const rows=fresh.latestNews||[];
 for(const [id,date] of expected){
  const item=rows.find(x=>x.id===id);
  assert.ok(item,'not ingested automatically: '+id);
  assert.equal(item.publishedAt,date,'source publication date mismatch: '+id);
  assert.equal(item.sourceState,'DIRECT_VERIFIED');
  report.items.push({id,date,source:item.directSourceUrl});
 }
 assert.ok(rows.every((x,i)=>i===0||Date.parse(rows[i-1].publishedAt)>=Date.parse(x.publishedAt)),'not chronologically ordered');
 assert.ok(rows.every(x=>Number.isFinite(Date.parse(x.publishedAt))&&Date.now()-Date.parse(x.publishedAt)<=30*86400000&&(!x.expiresAt||Date.parse(x.expiresAt)>Date.now())),'stale/undated/expired item');
 fs.writeFileSync(path.join(output,'live-current-events.json'),JSON.stringify(fresh,null,2)+'\n');
 report.status='PASS';
 console.log('LIVE_OFFICIAL_NEWS_INGESTION PASS',JSON.stringify(report.items));
}catch(e){report.status='FAIL';report.error=String(e);console.error('LIVE_OFFICIAL_NEWS_INGESTION FAIL',e);process.exitCode=1;}
finally{fs.writeFileSync(path.join(output,'live-ingestion-report.json'),JSON.stringify(report,null,2));fs.rmSync(sandbox,{recursive:true,force:true});}
