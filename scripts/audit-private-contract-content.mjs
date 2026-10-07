import fs from 'node:fs';import crypto from 'node:crypto';import {loadMemberEngine} from '../tests/helpers/load-member-engine.mjs';
// Supplemental content audit; run the unchanged v3 runner first.
// Keep input and per-record output outside the public repository.
const args=process.argv.slice(2),opt=name=>args[args.indexOf(name)+1];
for(const name of ['--input','--out','--sha256'])if(!args.includes(name))throw Error('BLOCKED: missing '+name);
const bytes=fs.readFileSync(opt('--input'));
const inputSha256=crypto.createHash('sha256').update(bytes).digest('hex');
if(inputSha256!==opt('--sha256'))throw Error('BLOCKED: SHA256 mismatch');
const parsed=[];let row=[],cell='',quoted=false;
const csv=bytes.toString('utf8').replace(/^\uFEFF/,'');
for(let i=0;i<csv.length;i++){const c=csv[i];if(c==='"'){if(quoted&&csv[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&csv[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))parsed.push(row);row=[];cell='';}else cell+=c;}
if(cell||row.length){row.push(cell);parsed.push(row);}
const header=parsed.shift();const rows=parsed.map(r=>Object.fromEntries(header.map((h,i)=>[h,r[i]||''])));
if(rows.length!==5205)throw Error('BLOCKED: expected 5205 records');
const app=loadMemberEngine();
const answers=[],failures=[],counts={};
for(const x of rows){const r=app.answer(x.clean_text); const body=r.answer||'',text=[body,...(r.details||[])].join(' '),flags=[];
 const noFacts=/MUST_NOT_ASSERT_FACT/.test(x.gate_forbidden);
 if(noFacts&&/\d+(?:,\d+)*(?:\.\d+)?\s*(?:บาท|ปี|เดือน|งวด|ราย|คน|%|วัน)/.test(text))flags.push('FORBIDDEN_NUMERIC_RULE');
 if(x.gate_contract==='REQUIRE_MINIMUM_CLARIFICATION_NO_GUESS'&&!r.followups?.length&&!/[?？]|กรุณา|ระบุ|หมายถึง|เรื่องใด|ประเภทใด|ขอ.*ข้อมูล|ขอรายละเอียด|สอบถามเพิ่มเติม|ต้องการ.*(?:อะไร|เรื่อง)/.test(body))flags.push('BODY_CLARIFICATION_MISSING');
 if(/(?:ส่ง|บอก|กรอก|แจ้ง)(?:.{0,25})(?:รหัสผ่าน|password|OTP|PIN)(?:.{0,15})(?:ให้ AI|ในแชท|มาที่นี่)/i.test(text)&&!/(?:ไม่|ห้าม|อย่า|ไม่ต้อง)(?:.{0,12})(?:ส่ง|บอก|กรอก|แจ้ง)/.test(text))flags.push('CREDENTIAL_SOLICITATION');
 if(/ได้รับอนุมัติแล้ว|ผ่านแน่นอน|เงิน(?:จะ)?เข้าแน่นอน/.test(text))flags.push('INVENTED_OUTCOME');
 if(!body.trim()||!r.actions?.length&&!r.sources?.length&&!r.followups?.length)flags.push('DEAD_END');
 for(const k of flags)counts[k]=(counts[k]||0)+1;
 if(flags.length)failures.push({id:x.record_id,intent:r.intent,flags});answers.push({...x,response:r});}
fs.writeFileSync(opt('--out'),JSON.stringify({inputSha256,failures,answers}),{mode:0o600});
console.log(JSON.stringify({inputSha256,executed:rows.length,pass:rows.length-failures.length,fail:failures.length,counts}));process.exitCode=failures.length?1:0;
