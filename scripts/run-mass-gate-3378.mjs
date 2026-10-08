// Explicit execution only: node scripts/run-mass-gate-3378.mjs /secure/local/corpus.jsonl
// Never add this to always-green release tests: absence of original labelled corpus MUST be visible.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {loadMemberEngine} from '../tests/helpers/load-member-engine.mjs';
const file=process.argv[2]||process.env.MASS_GATE_CORPUS_PATH;
if(!file||!fs.existsSync(file)){console.error('MASS GATE NOT RUN: original, anonymized and labelled corpus path is required');process.exit(2);}
const data=fs.readFileSync(file);
const hash=crypto.createHash('sha256').update(data).digest('hex');
let records;try{records=data.toString('utf8').trim().split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line));}catch(e){console.error('Invalid JSONL corpus');process.exit(2);}
const expected={standalone_question:1832,personal_or_live:1546};
let counters={standalone_question:0,personal_or_live:0},fail=[],unscorable=0,pass=0;
const ids=new Set(),app=loadMemberEngine();
for(const row of records){
 if(!row.case_id||ids.has(row.case_id)||!Object.hasOwn(expected,row.group)||typeof row.question!=='string'||!row.question.trim()){fail.push({id:row.case_id||'INVALID',reason:'SCHEMA'});continue;}
 ids.add(row.case_id);counters[row.group]++;
 // No inferred expected intent/decision, never mark the case green without a human label.
 if(!row.expected_intent&&!row.expected_decision){unscorable++;continue;}
 try{
   const answer=app.answer(row.question);
   if(!answer||!answer.answer||typeof answer.answer!=='string')throw Error('EMPTY');
   if(row.expected_intent&&answer.intent!==row.expected_intent)throw Error('INTENT');
   if(row.expected_decision&&answer.decision!==row.expected_decision)throw Error('DECISION');
   if(row.expected_source_url&&!answer.sources?.some(s=>s.url===row.expected_source_url))throw Error('SOURCE');
   pass++;
 }catch(e){fail.push({id:row.case_id,reason:String(e.message||e).slice(0,30)});}
}
const coverage=Object.keys(expected).every(k=>counters[k]===expected[k]);
const ok=coverage&&records.length===3378&&unscorable===0&&fail.length===0;
console.log(JSON.stringify({run:'ORIGINAL_MASS_GATE_3378',corpusSha256:hash,records:records.length,partitions:counters,scored:pass,unscorable,failed:fail.length,failures:fail.slice(0,100),status:ok?'PASS':'NOT_ACCEPTED'},null,2));
process.exit(ok?0:1);
