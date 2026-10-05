import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync('index.html','utf8');
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
if(!script) throw new Error('No inline app script found');
const noop=()=>{};
const element=()=>({value:'',innerHTML:'',textContent:'',className:'',classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,querySelectorAll:()=>[],scrollIntoView:noop});
const document={getElementById:()=>element(),querySelectorAll:()=>[],querySelector:()=>element(),addEventListener:noop};
const sandbox={console,document,window:{},location:{hash:''},setTimeout:(f)=>{f();return 1},clearTimeout:noop,URL,Date,Math};
vm.createContext(sandbox); vm.runInContext(script,sandbox);
const app=sandbox.COOP_APP||sandbox.window.COOP_APP;
if(!app) throw new Error('COOP_APP not exposed');
let pass=0; const failures=[];
function check(name,fn){try{fn();pass++;console.log('PASS',name)}catch(e){failures.push(name+': '+e.message);console.error('FAIL',name,e.message)}}
function ans(q){return app.answer(q)}
function includes(v,s){if(!String(v||'').includes(s))throw new Error('expected '+JSON.stringify(v)+' to include '+s)}
check('emergency 2 not yet',()=>includes(ans('กู้ฉุกเฉินใหม่ ส่งแล้ว 2 งวด').status,'ยังไม่ผ่าน'));
check('emergency 3 passes condition',()=>includes(ans('กู้ฉุกเฉินใหม่ ส่งแล้ว 3 งวด').status,'ผ่านเงื่อนไข'));
check('ordinary 8 not yet',()=>includes(ans('กู้สามัญใหม่ ส่งแล้ว 8 งวด').status,'ยังไม่ผ่าน'));
check('ordinary 12 passes',()=>includes(ans('กู้สามัญใหม่ ส่งแล้ว 12 งวด').status,'ผ่านเงื่อนไข'));
check('education 3 not yet',()=>includes(ans('กู้เพื่อการศึกษาลูกอีกคน ส่งแล้ว 3 งวด').status,'ยังไม่ผ่าน'));
check('education 6 passes',()=>includes(ans('กู้เพื่อการศึกษาลูกอีกคน ส่งแล้ว 6 งวด').status,'ผ่านเงื่อนไข'));
check('guarantor 3 blocks',()=>includes(ans('ค้ำกู้สามัญอยู่ 3 คน ค้ำเพิ่มได้ไหม').status,'ยังไม่ผ่าน'));
check('guarantor 2 passes',()=>includes(ans('ค้ำกู้สามัญอยู่ 2 คน ค้ำอีกคนได้ไหม').status,'ผ่านเงื่อนไข'));
for(const [name,q,reply,status] of [
 ['emergency follow-up','กู้ฉุกเฉินใหม่ได้ไหม','6 งวด','ผ่านเงื่อนไข'],
 ['ordinary follow-up','กู้สามัญใหม่ได้ไหม','15 งวด','ผ่านเงื่อนไข'],
 ['education follow-up','กู้เพื่อการศึกษาลูกอีกคนได้ไหม','12 งวด','ผ่านเงื่อนไข'],
 ['guarantor follow-up','ค้ำกู้สามัญเพิ่มได้ไหม','2 คน','ผ่านเงื่อนไข']]){
 check(name,()=>{const first=ans(q); if(!first.ruleId||!first.requiredFact)throw new Error('missing structured state'); const second=app.smartDecision(reply,{ruleId:first.ruleId,requiredFact:first.requiredFact}); includes(second.status,status);});
}
check('personal approval routes away from invented answer',()=>{const r=ans('กู้ของผมอนุมัติหรือยัง'); if(!app.personal('กู้ของผมอนุมัติหรือยัง'))throw new Error('not detected personal'); if(/อนุมัติแล้ว|ผ่านแล้ว/.test(r.answer||''))throw new Error('invented approval')});
check('personal debt detected',()=>{if(!app.personal('ยอดหนี้ผมเหลือเท่าไร'))throw new Error('not personal')});
check('personal deposit detected',()=>{if(!app.personal('เงินฝากของผมเท่าไร'))throw new Error('not personal')});

check('member debt uses official self-service before staff',()=>{const r=ans('ยอดหนี้ผมเหลือเท่าไร');if(r.intent!=='member_self_service')throw new Error('expected member self service');if(!(r.actions||[]).some(x=>x[1]==='https://member.dlasavingcoop.com/coop/'))throw new Error('missing official member portal');if((r.actions||[]).some(x=>x[1]==='#staff-directory'))throw new Error('should not force staff for self-service data')});
check('member shares use official self-service',()=>{const r=ans('ยอดหุ้นของผมเท่าไร');if(r.intent!=='member_self_service')throw new Error('expected member self service')});
check('member deposit uses official self-service',()=>{const r=ans('เงินฝากของผมเท่าไร');if(r.intent!=='member_self_service')throw new Error('expected member self service')});
check('member approval status uses self-service first',()=>{const r=ans('กู้ของผมอนุมัติหรือยัง');if(r.intent!=='member_self_service')throw new Error('expected self service status')});
check('guarantor failure reason still hands off to staff',()=>{const r=ans('ทำไมผู้ค้ำของผมไม่ผ่าน ติดอะไร');if(r.intent!=='personal_handoff')throw new Error('expected staff handoff for judgment')});

check('dividend routes to exact official notice',()=>{const r=ans('ปันผลปี 2569 ออกเมื่อไร');if(!(r.actions||[]).some(x=>x[1]==='https://www.dlasavingcoop.com/show.php?No=4916'))throw new Error('missing direct dividend notice');if((r.actions||[]).some(x=>/Category=notice/.test(x[1]||'')))throw new Error('must not route dividend to notice index')});
check('dividend knowledge routes to exact notice',()=>{const r=ans('ปันผลกับเฉลี่ยคืนต่างกันยังไง');if(!(r.actions||[]).some(x=>x[1]==='https://www.dlasavingcoop.com/show.php?No=4916'))throw new Error('missing direct dividend notice')});
check('dynamic dividend does not invent percent',()=>{const r=ans('ปันผลปี 2569 กี่เปอร์เซ็นต์'); if(/\d+(?:\.\d+)?\s*%/.test(r.answer||''))throw new Error('invented rate')});
check('quality cross-loan blocks ordinary without invented threshold',()=>{const r=ans('คุณภาพชีวิตส่งกี่งวดถึงกู้สามัญได้'); if(r.decision!=='NOT_YET_ELIGIBLE')throw new Error('expected current cross-loan prohibition'); const all=(r.answer||'')+' '+(r.details||[]).join(' '); if(!/ยกเว้นเงินกู้ฉุกเฉิน/.test(all))throw new Error('missing emergency exception'); if(/ต้อง(?:ส่ง|ชำระ).*\d+\s*งวด/.test(all))throw new Error('invented cross-loan threshold')});

check('ordinary guided eligibility starts before personal handoff',()=>{const r=ans('ผมกู้สามัญได้ไหม');if(r.flowId!=='ordinary_eligibility'||r.requiredFact!=='membershipMonths')throw new Error('guided ordinary flow not started')});
check('ordinary guided flow fails early on membership',()=>{const r=ans('ผมกู้สามัญได้ไหม');const x=app.continueDecision('5 เดือน',{flowId:r.flowId,requiredFact:r.requiredFact,facts:r.facts||{}});if(x.decision!=='NOT_YET_ELIGIBLE')throw new Error('expected early fail')});
check('quality guided eligibility starts',()=>{const r=ans('ผมกู้พัฒนาคุณภาพชีวิตได้ไหม');if(r.flowId!=='quality_eligibility'||r.requiredFact!=='requestAmount')throw new Error('guided quality flow not started')});
check('named housing eligibility is not misrouted to private handoff',()=>{const r=ans('ผมกู้บ้านได้ไหม');if(r.intent==='personal_handoff'||r.decision!=='NEED_RULE_EXTRACTION')throw new Error('housing rule question misrouted')});
check('release marker',()=>{if(!html.includes('4.4.0-member-journey'))throw new Error('wrong release')});

// Safe Calculator 4.2 gate: calculate only verified constraints/rates; never invent a monthly payment.
for(const [q,expect] of [
 ['คำนวณกู้สามัญ 800000 บาท 120 งวด','7.50%'],
 ['คำนวณกู้พัฒนาคุณภาพชีวิต 4000000 บาท 360 งวด','6.50%'],
 ['คำนวณกู้บ้าน 2000000 บาท 240 งวด','ดอกเบี้ยขั้นบันได']
]){
 const r=app.answer(q); const all=[r.answer,...(r.details||[])].join(' ');
 if(r.intent!=='loan_safe_calculator'||!all.includes(expect)||!/ยังไม่แสดง/.test(all)||!/ไม่อนุมานสูตรค่างวด/.test(all)) failures.push({q,group:'safe-calculator',intent:r.intent,all});
}
{
 const r=app.answer('คำนวณกู้สามัญ 2500000 บาท 120 งวด');
 if(r.intent!=='loan_safe_calculator'||r.decision!=='NOT_YET_ELIGIBLE'||!/(เกินเพดาน)/.test((r.details||[]).join(' '))) failures.push({group:'safe-calculator-cap',r});
}
console.log('\nRESULT',pass,'passed,',failures.length,'failed');
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
