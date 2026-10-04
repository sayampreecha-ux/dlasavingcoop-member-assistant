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
check('dynamic dividend does not invent percent',()=>{const r=ans('ปันผลปี 2569 กี่เปอร์เซ็นต์'); if(/\d+(?:\.\d+)?\s*%/.test(r.answer||''))throw new Error('invented rate')});
check('quality cross-loan blocks ordinary without invented threshold',()=>{const r=ans('คุณภาพชีวิตส่งกี่งวดถึงกู้สามัญได้'); if(r.decision!=='NOT_YET_ELIGIBLE')throw new Error('expected current cross-loan prohibition'); const all=(r.answer||'')+' '+(r.details||[]).join(' '); if(!/ยกเว้นเงินกู้ฉุกเฉิน/.test(all))throw new Error('missing emergency exception'); if(/ต้อง(?:ส่ง|ชำระ).*\d+\s*งวด/.test(all))throw new Error('invented cross-loan threshold')});

check('ordinary guided eligibility starts before personal handoff',()=>{const r=ans('ผมกู้สามัญได้ไหม');if(r.flowId!=='ordinary_eligibility'||r.requiredFact!=='membershipMonths')throw new Error('guided ordinary flow not started')});
check('ordinary guided flow fails early on membership',()=>{const r=ans('ผมกู้สามัญได้ไหม');const x=app.continueDecision('5 เดือน',{flowId:r.flowId,requiredFact:r.requiredFact,facts:r.facts||{}});if(x.decision!=='NOT_YET_ELIGIBLE')throw new Error('expected early fail')});
check('quality guided eligibility starts',()=>{const r=ans('ผมกู้พัฒนาคุณภาพชีวิตได้ไหม');if(r.flowId!=='quality_eligibility'||r.requiredFact!=='requestAmount')throw new Error('guided quality flow not started')});
check('named housing eligibility is not misrouted to private handoff',()=>{const r=ans('ผมกู้บ้านได้ไหม');if(r.intent==='personal_handoff'||r.decision!=='NEED_RULE_EXTRACTION')throw new Error('housing rule question misrouted')});
check('release marker',()=>{if(!html.includes('4.1.0-member-decision'))throw new Error('wrong release')});
console.log('\nRESULT',pass,'passed,',failures.length,'failed');
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
