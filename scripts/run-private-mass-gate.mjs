import fs from 'node:fs';
import crypto from 'node:crypto';
import {loadMemberEngine} from '../tests/helpers/load-member-engine.mjs';

// Inputs and per-record output stay outside the public repository. Print aggregates only.
const args=process.argv.slice(2), option=name=>args[args.indexOf(name)+1];
function block(reason){console.error(JSON.stringify({status:'BLOCKED',reason,executed:0}));process.exit(2)}
if(!args.includes('--corpus')||!args.includes('--manifest')||!args.includes('--out'))block('Private corpus, canonical classification manifest, and private output path are required');
let corpus,manifest,bytes;
try{bytes=fs.readFileSync(option('--corpus'));corpus=JSON.parse(bytes);manifest=JSON.parse(fs.readFileSync(option('--manifest')))}catch{block('Cannot read private JSON inputs')}
const sha=crypto.createHash('sha256').update(bytes).digest('hex');
if(!Array.isArray(corpus)||!Array.isArray(manifest.records)||manifest.sourceSha256!==sha)block('Manifest must bind the exact corpus SHA-256');
const ids=new Set(), classes={}, byId=new Map();
for(const record of corpus){
 if(!record.id||ids.has(String(record.id))||typeof record.question!=='string')block('Invalid or duplicate corpus record');
 ids.add(String(record.id));byId.set(String(record.id),record);
}
const classified=new Set(), kinds=new Set(['standalone_question','personal_or_live','context_conversation','review_queue','excluded']);
for(const item of manifest.records){
 if(!byId.has(String(item.id))||classified.has(String(item.id))||!kinds.has(item.kind))block('Incomplete, duplicate, or invalid classification');
 classified.add(String(item.id));classes[item.kind]=(classes[item.kind]||0)+1;
}
if(classified.size!==corpus.length)block('Every source record needs an explicit classification');
if(classes.standalone_question!==1832||classes.personal_or_live!==1546)block('Canonical gate must contain 1832 standalone and 1546 personal/live records; do not pad or reclassify to satisfy counts');
const selected=manifest.records.filter(x=>['standalone_question','personal_or_live'].includes(x.kind));
// A heuristic privacy check is necessary but not proof that names were removed.
if(manifest.privacyReview!=='DEIDENTIFIED_REVIEW_COMPLETE')block('A completed private de-identification review is required');
for(const item of selected){
 const q=byId.get(String(item.id)).question;
 if(/https?:\/\/|www\.|@[\w\u0e00-\u0e7f]|\b\d{13}\b|\b0[689](?:[- .]?\d){8}\b|(?:เลขสมาชิก|เลขบัญชี|เลขบัตร)\s*[:=]?\s*\d{5,}/i.test(q))block('Privacy preflight found a potential personal identifier; no questions printed');
}
const app=loadMemberEngine(), counters={}, results=[];
for(const item of selected){
 const row=byId.get(String(item.id)), flags=[];
 let r;
 try{r=app.answer(row.question)}catch{flags.push('ENGINE_ERROR')}
 const text=[r?.answer,...r?.details||[]].join(' ');
 if(!String(r?.answer||'').trim())flags.push('EMPTY');
 if(r?.intent==='fallback')flags.push('FALLBACK');
 if(!(r?.actions||[]).length&&!(r?.sources||[]).length&&!(r?.followups||[]).length)flags.push('DEAD_END');
 if(/ได้รับอนุมัติแล้ว|ผ่านแน่นอน|(?:เงิน(?:จะ)?เข้า|อนุมัติ|กู้ผ่าน)แน่นอน/.test(text))flags.push('UNSAFE_CERTAINTY_REVIEW');
 if(item.kind==='personal_or_live'&&!r?.privacy&&!/LIVE|MEMBER|HANDOFF|VERIFY|LOCK|NEED_INFO/.test(String(r?.decision))&&!/ระบบสมาชิก|เจ้าหน้าที่|ข้อมูล.*(?:เฉพาะ|รายรอบ)/.test(text))flags.push('PERSONAL_LIVE_ROUTE_REVIEW');
 const expected=item.expected;
 // Intent alone can never make a case pass: require reviewed content + destination checks.
 if(!expected?.requiresAnyText?.length||!expected?.requiresActionUrl?.length)flags.push('SEMANTIC_EXPECTATION_MISSING');
 else{
  if(!expected.requiresAnyText.some(s=>text.includes(s)))flags.push('WRONG_CONTENT');
  if(!expected.requiresActionUrl.some(url=>(r?.actions||[]).some(a=>a[1]===url)))flags.push('WRONG_DESTINATION');
  if(expected.forbiddenText?.some(s=>text.includes(s)))flags.push('FORBIDDEN_CONTENT');
  if(expected.intent&&r?.intent!==expected.intent)flags.push('WRONG_ROUTE');
  if(expected.evidenceState&&r?.evidenceState!==expected.evidenceState)flags.push('WRONG_EVIDENCE_STATE');
  if(expected.decision&&r?.decision!==expected.decision)flags.push('WRONG_DECISION');
 }
 for(const flag of flags)counters[flag]=(counters[flag]||0)+1;
 results.push({id:item.id,kind:item.kind,flags,intent:r?.intent,decision:r?.decision});
}
const fail=results.filter(x=>x.flags.length).length;
const report={status:fail?'FAIL':'PASS',corpusTotal:corpus.length,corpusSha256:sha,classes,executed:results.length,standaloneExecuted:classes.standalone_question,personalLiveExecuted:classes.personal_or_live,pass:results.length-fail,fail,counters,results};
fs.writeFileSync(option('--out'),JSON.stringify(report,null,2),{mode:0o600});
const {results:privateResults,...summary}=report;console.log(JSON.stringify(summary,null,2));
process.exitCode=fail?1:0;
