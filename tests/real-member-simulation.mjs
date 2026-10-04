import fs from 'node:fs';import vm from 'node:vm';
const html=fs.readFileSync('index.html','utf8'),script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
const noop=()=>{},el=()=>({value:'',innerHTML:'',textContent:'',className:'',classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,querySelectorAll:()=>[],scrollIntoView:noop});
const sandbox={console,document:{getElementById:()=>el(),querySelectorAll:()=>[],querySelector:()=>el(),addEventListener:noop},window:{},location:{hash:''},setTimeout:f=>{f();return 1},clearTimeout:noop,URL,Date,Math};vm.createContext(sandbox);vm.runInContext(script,sandbox);
const app=sandbox.COOP_APP||sandbox.window.COOP_APP;if(!app)throw Error('COOP_APP unavailable');
const cases=[
['ฉุกเฉิน 3','ผมกู้ฉุกเฉินอยู่ ส่งมา 3 งวดแล้ว จะกู้ใหม่ได้ไหม',r=>r.intent==='decision_emergency_repeat'&&r.decision==='ELIGIBLE_CONDITION'],
['ฉุกเฉิน 2','ฉุกเฉินผมเพิ่งส่ง 2 เดือน ขอใหม่ได้มั้ย',r=>r.intent==='decision_emergency_repeat'&&r.decision==='NOT_YET_ELIGIBLE'],
['สามัญ 12','สามัญเดิมส่งมา 12 งวดแล้ว ยื่นใหม่ได้ไหม',r=>r.intent==='decision_ordinary_repeat'&&r.decision==='ELIGIBLE_CONDITION'],
['สามัญ 8','กู้สามัญใหม่ ส่งแล้ว 8 งวด',r=>r.decision==='NOT_YET_ELIGIBLE'],
['การศึกษา 6','กู้การศึกษาลูกคนแรกส่ง 6 งวด จะกู้ให้ลูกอีกคนได้ไหม',r=>r.decision==='ELIGIBLE_CONDITION'],
['การศึกษา 3','กู้เพื่อการศึกษาส่งมา 3 งวด ลูกอีกคนยื่นได้ไหม',r=>r.decision==='NOT_YET_ELIGIBLE'],
['ผู้ค้ำ 2','ตอนนี้ผมค้ำกู้สามัญให้ 2 คน จะค้ำให้อีกคนได้ไหม',r=>r.decision==='ELIGIBLE_CONDITION'],
['ผู้ค้ำ 3','ค้ำสามัญอยู่ 3 คนแล้ว ยังเซ็นค้ำเพิ่มได้ไหม',r=>r.decision==='NOT_YET_ELIGIBLE'],
['หุ้นเพิ่ม','ตอนนี้สมาชิกซื้อหุ้นเพิ่มได้ไหม',r=>!!r.intent],
['สวัสดิการแม่เสีย','แม่ผมเสีย ขอเงินสวัสดิการอะไรได้บ้าง',r=>r.intent==='welfare_family_death'],
['ทุนลูก','ทุนการศึกษาลูกสมัครยังไง',r=>r.intent==='scholarship'],
['ลาออก','ผมจะลาออกจากสหกรณ์ ต้องทำอะไรบ้าง',r=>r.intent==='resignation'],
['ปันผลความรู้','ปันผลกับเฉลี่ยคืนต่างกันยังไง',r=>r.intent==='dividend_knowledge'&&r.answerClass==='KNOWLEDGE'],
['ปันผลส่วนตัว','ปีนี้ผมจะได้ปันผลเท่าไร',r=>r.intent==='personal_handoff'&&r.privacy],
['ผลกู้ส่วนตัว','กู้ของผมอนุมัติหรือยัง',r=>r.intent==='personal_handoff'&&r.privacy],
['คุณภาพชีวิตข้ามประเภท','คุณภาพชีวิตส่งกี่งวดถึงกู้สามัญได้',r=>r.decision==='UNVERIFIED_RULE'&&!/ขอทราบ.*กี่งวด/.test(r.answer)],
['หักกลบผสม','มีสามัญเดิมกับคุณภาพชีวิต ถ้ากู้สามัญใหม่ต้องปิดตัวไหนบ้าง',r=>r.intent==='loan_compound_reasoning'&&r.decision==='UNVERIFIED_RULE'],
['คำถามรวม','สามัญส่ง 12 งวด ค้ำอยู่ 2 คน มีคุณภาพชีวิตด้วย ผมกู้ใหม่ได้ไหม',r=>r.intent==='loan_compound_reasoning'&&r.decision==='UNVERIFIED_RULE'&&/12 งวด/.test((r.details||[]).join(' '))&&/2 คน/.test((r.details||[]).join(' '))],
['คำถามรวมไม่ผ่าน','สามัญส่ง 8 งวด ค้ำอยู่ 2 คน มีคุณภาพชีวิตด้วย ผมกู้ใหม่ได้ไหม',r=>r.intent==='loan_compound_reasoning'&&r.decision==='NOT_YET_ELIGIBLE'],
['ไม่แต่งเกณฑ์คุณภาพชีวิต','คุณภาพชีวิตส่ง 5 งวดแล้ว กู้สามัญได้ไหม',r=>r.decision==='UNVERIFIED_RULE'&&!/ต้อง(?:ส่ง|ชำระ).*\d+\s*งวด/.test((r.answer||'')+' '+(r.details||[]).join(' '))],
['ไม่แต่งปันผล','ปันผลปี 2569 กี่เปอร์เซ็นต์',r=>!/\d+(?:\.\d+)?\s*%/.test(r.answer||'')],
['ยอดหนี้ส่วนตัว','ยอดหนี้ผมเหลือเท่าไร',r=>r.intent==='personal_handoff'],
['เงินฝากส่วนตัว','เงินฝากของผมเท่าไร',r=>r.intent==='personal_handoff'],
['ประกาศรายรอบ','รอบอนุมัติกู้ฉุกเฉินวันไหน',r=>r.intent==='live_schedule'],
['release','เงินกู้มีกี่แบบ',r=>html.includes('3.5.0-rule-master')]
];
let bad=0;for(const [name,q,assert] of cases){const r=app.answer(q);const ok=!!assert(r);if(!ok)bad++;console.log((ok?'PASS':'FAIL')+' | '+name+' | intent='+r.intent+' decision='+(r.decision||'-')+' status='+r.status);if(!ok)console.log('  answer='+r.answer+'\n  details='+(r.details||[]).join(' | '));}
console.log('REAL MEMBER SEMANTIC SIMULATION',cases.length-bad,'passed,',bad,'failed');if(bad)process.exit(1);
