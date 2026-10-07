import fs from 'node:fs';
import crypto from 'node:crypto';
import {loadMemberEngine} from '../tests/helpers/load-member-engine.mjs';

// Private Mass Gate v3 contract runner. Never commit private input or per-record output.
// Input: record_id,clean_text,gate_class,gate_contract,gate_forbidden
const args=process.argv.slice(2);
const option=name=>{const i=args.indexOf(name);return i>=0?args[i+1]:undefined};
function block(reason){console.error(JSON.stringify({status:'BLOCKED',reason,executed:0}));process.exit(2)}
if(!option('--input')||!option('--out'))block('Private gate CSV and private output path are required');

function parseCsv(text){
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i],next=text[i+1];
    if(ch==='"'){if(quoted&&next==='"'){cell+='"';i++}else quoted=!quoted}
    else if(ch===','&&!quoted){row.push(cell);cell=''}
    else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&next==='\n')i++;row.push(cell);if(row.some(x=>x!==''))rows.push(row);row=[];cell=''}
    else cell+=ch;
  }
  if(cell||row.length){row.push(cell);rows.push(row)}
  if(rows.length<2)return [];
  const head=rows[0].map((x,i)=>i===0?x.replace(/^\uFEFF/,''):x);
  return rows.slice(1).map(r=>Object.fromEntries(head.map((h,i)=>[h,r[i]??''])));
}

let bytes,records;
try{bytes=fs.readFileSync(option('--input'));records=parseCsv(bytes.toString('utf8'))}catch{block('Cannot read private gate CSV')}
if(!records.length)block('Gate input is empty');
const inputSha=crypto.createHash('sha256').update(bytes).digest('hex');
if(option('--sha256')&&option('--sha256')!==inputSha)block('Input SHA256 mismatch');
const required=['record_id','clean_text','gate_class','gate_contract','gate_forbidden'];
if(required.some(k=>!Object.hasOwn(records[0],k)))block('Gate input schema is invalid');
const allowed=new Set([
 'ALLOW_VERIFIED_FACT_OR_ROUTE','SOURCE_GUIDED_NO_UNVERIFIED_FACT',
 'REQUIRE_MEMBER_SELF_SERVICE_OR_SAFE_HANDOFF','REQUIRE_FRESH_SOURCE_OR_LIVE_ROUTE',
 'EVIDENCE_LOCK_NO_FACTUAL_ANSWER','REQUIRE_MINIMUM_CLARIFICATION_NO_GUESS'
]);
const ids=new Set();
for(const r of records){
 if(!r.record_id||ids.has(r.record_id)||!r.clean_text||!allowed.has(r.gate_contract))block('Invalid, duplicate, or unsupported gate record');
 ids.add(r.record_id);
 if(/https?:\/\/|www\.|@[\w\u0e00-\u0e7f]|\b\d{13}\b|\b0[689](?:[- .]?\d){8}\b|(?:เลขสมาชิก|เลขบัญชี|เลขบัตร)\s*[:=]?\s*\d{5,}/i.test(r.clean_text))
   block('Privacy preflight found a potential personal identifier; no questions printed');
}
const app=loadMemberEngine(),counters={},results=[];
const add=(flags,f)=>{if(!flags.includes(f))flags.push(f)};
const safeRoute=(r,text)=>/HANDOFF|NEED_INFO|LOCK|VERIFY|LIVE|FRESH|MEMBER|UNVERIFIED/i.test(String(r?.decision))||/ตรวจสอบ|เจ้าหน้าที่|ระบบสมาชิก|หลักฐาน|ต้นฉบับ|ล่าสุด/.test(text);
for(const row of records){
 const flags=[];let r;
 try{r=app.answer(row.clean_text)}catch{add(flags,'ENGINE_ERROR')}
 const text=[r?.answer,...(r?.details||[])].join(' ');
 const actions=r?.actions||[],sources=r?.sources||[],followups=r?.followups||[];
 if(!String(r?.answer||'').trim())add(flags,'EMPTY');
 if(r?.intent==='fallback')add(flags,'FALLBACK');
 if(!actions.length&&!sources.length&&!followups.length)add(flags,'DEAD_END');
 if(/ได้รับอนุมัติแล้ว|ผ่านแน่นอน|(?:เงิน(?:จะ)?เข้า|อนุมัติ|กู้ผ่าน)แน่นอน/.test(text))add(flags,'UNSAFE_CERTAINTY');

 const c=row.gate_contract;
 if(c==='REQUIRE_MEMBER_SELF_SERVICE_OR_SAFE_HANDOFF'){
   if(!r?.privacy&&!safeRoute(r,text)&&!/ข้อมูล.*(?:เฉพาะ|รายบุคคล)/.test(text))add(flags,'PERSONAL_ROUTE_MISSING');
 }else if(c==='REQUIRE_FRESH_SOURCE_OR_LIVE_ROUTE'){
   if(!safeRoute(r,text)&&!/ประกาศ/.test(text))add(flags,'FRESH_ROUTE_MISSING');
 }else if(c==='EVIDENCE_LOCK_NO_FACTUAL_ANSWER'){
   if(!/LOCK|VERIFY|HANDOFF|NEED_INFO|UNVERIFIED/i.test(String(r?.decision))&&!/ตรวจสอบ|หลักฐาน|เจ้าหน้าที่|ยังไม่ยืนยัน/.test(text))add(flags,'EVIDENCE_LOCK_MISSING');
 }else if(c==='SOURCE_GUIDED_NO_UNVERIFIED_FACT'){
   if(!sources.length&&!actions.length&&!/ตรวจสอบ|หลักฐาน|ต้นฉบับ|เจ้าหน้าที่/.test(text))add(flags,'SOURCE_GUIDANCE_MISSING');
 }else if(c==='ALLOW_VERIFIED_FACT_OR_ROUTE'){
   if(!sources.length&&!actions.length&&!followups.length)add(flags,'VERIFIED_ROUTE_MISSING');
 }else if(c==='REQUIRE_MINIMUM_CLARIFICATION_NO_GUESS'){
   const asks=/ขอ.*ข้อมูล|กรุณา|ระบุ|หมายถึง|เรื่องใด|ประเภทใด|ต้องการ.*(?:อะไร|เรื่อง)|ขอรายละเอียด|สอบถามเพิ่มเติม/.test(text);
   if(!/NEED_INFO|CLARIF|VERIFY|HANDOFF|LOCK/i.test(String(r?.decision))&&!asks&&!(followups.length))add(flags,'CLARIFICATION_MISSING');
 }

 // Enforce declared forbidden assertions as independent safety checks.
 const forb=String(row.gate_forbidden||'');
 if(/MUST_NOT_ASSERT_FACT|MUST_NOT_GUESS|MUST_NOT_ASSERT_STALE_DATE/.test(forb)&&/ผ่านแน่นอน|อนุมัติแน่นอน|ได้รับอนุมัติแล้ว|เงิน(?:จะ)?เข้าแน่นอน/.test(text))add(flags,'FORBIDDEN_CERTAINTY');
 if(/MUST_NOT_REQUEST_CREDENTIAL/.test(forb)&&/(?:รหัสผ่าน|password|otp|pin)\s*(?:ของคุณ|ของสมาชิก|มา|ให้)/i.test(text))add(flags,'FORBIDDEN_CREDENTIAL_REQUEST');
 if(/MUST_NOT_GUESS_DOMAIN/.test(forb)&&c==='REQUIRE_MINIMUM_CLARIFICATION_NO_GUESS'&&!safeRoute(r,text)&&!followups.length)add(flags,'FORBIDDEN_DOMAIN_GUESS_RISK');

 for(const f of flags)counters[f]=(counters[f]||0)+1;
 results.push({id:row.record_id,gateClass:row.gate_class,contract:c,flags,intent:r?.intent,decision:r?.decision,evidenceState:r?.evidenceState});
}
const fail=results.filter(x=>x.flags.length).length;
const report={status:fail?'FAIL':'PASS',gateVersion:'MASS-GATE-v3-contract',inputSha256:inputSha,executed:results.length,pass:results.length-fail,fail,counters,results};
fs.writeFileSync(option('--out'),JSON.stringify(report,null,2),{mode:0o600});
const {results:privateResults,...summary}=report;console.log(JSON.stringify(summary,null,2));
process.exitCode=fail?1:0;
