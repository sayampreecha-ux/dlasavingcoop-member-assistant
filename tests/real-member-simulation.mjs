import fs from 'node:fs';import vm from 'node:vm';
const html=fs.readFileSync('index.html','utf8'),script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
const noop=()=>{},el=()=>({value:'',innerHTML:'',textContent:'',className:'',classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,querySelectorAll:()=>[],scrollIntoView:noop});
const sandbox={console,document:{getElementById:()=>el(),querySelectorAll:()=>[],querySelector:()=>el(),addEventListener:noop},window:{},location:{hash:''},setTimeout:f=>{f();return 1},clearTimeout:noop,URL,Date,Math};vm.createContext(sandbox);vm.runInContext(script,sandbox);
const app=sandbox.COOP_APP||sandbox.window.COOP_APP;if(!app)throw Error('COOP_APP unavailable');
const cases=[
['ฉุกเฉินพูดธรรมชาติ','ผมกู้ฉุกเฉินอยู่ ส่งมา 3 งวดแล้ว จะกู้ใหม่ได้ไหม','decision_emergency_repeat'],
['ฉุกเฉินไม่ผ่าน','ฉุกเฉินผมเพิ่งส่ง 2 เดือน ขอใหม่ได้มั้ย','decision_emergency_repeat'],
['สามัญธรรมชาติ','สามัญเดิมส่งมา 12 งวดแล้ว ยื่นใหม่ได้ไหม','decision_ordinary_repeat'],
['สามัญภาษาพูด','ผมส่งกู้สามัญมา 15 เดือนละ กู้ใหม่ได้มั้ย','decision_ordinary_repeat'],
['การศึกษาธรรมชาติ','กู้การศึกษาลูกคนแรกส่ง 6 งวด จะกู้ให้ลูกอีกคนได้ไหม','decision_education_repeat'],
['การศึกษาไม่ผ่าน','กู้เพื่อการศึกษาส่งมา 3 งวด ลูกอีกคนยื่นได้ไหม','decision_education_repeat'],
['ผู้ค้ำสองคน','ตอนนี้ผมค้ำกู้สามัญให้ 2 คน จะค้ำให้อีกคนได้ไหม','decision_ordinary_guarantor_capacity'],
['ผู้ค้ำสามคน','ค้ำสามัญอยู่ 3 คนแล้ว ยังเซ็นค้ำเพิ่มได้ไหม','decision_ordinary_guarantor_capacity'],
['หุ้นเพิ่ม','ตอนนี้สมาชิกซื้อหุ้นเพิ่มได้ไหม',null],
['หุ้นกับกู้ผสม','ผมมีหุ้นห้าหมื่น ฝากแสนห้า จะกู้สองล้านได้ไหม',null],
['สวัสดิการแม่เสีย','แม่ผมเสีย ขอเงินสวัสดิการอะไรได้บ้าง','welfare_family_death'],
['ทุนลูก','ทุนการศึกษาลูกสมัครยังไง','scholarship'],
['ลาออก','ผมจะลาออกจากสหกรณ์ ต้องทำอะไรบ้าง','resignation'],
['ปันผลความรู้','ปันผลกับเฉลี่ยคืนต่างกันยังไง',null],
['ปันผลส่วนตัว','ปีนี้ผมจะได้ปันผลเท่าไร',null],
['ผลกู้ส่วนตัว','กู้ของผมอนุมัติหรือยัง',null],
['คุณภาพชีวิตข้ามประเภท','คุณภาพชีวิตส่งกี่งวดถึงกู้สามัญได้',null],
['หักกลบผสม','มีสามัญเดิมกับคุณภาพชีวิต ถ้ากู้สามัญใหม่ต้องปิดตัวไหนบ้าง',null],
['คำถามรวม','สามัญส่ง 12 งวด ค้ำอยู่ 2 คน มีคุณภาพชีวิตด้วย ผมกู้ใหม่ได้ไหม',null]
];
let bad=0;for(const [name,q,expected] of cases){const r=app.answer(q);const ok=!expected||r.intent===expected;if(!ok)bad++;console.log((ok?'PASS':'FAIL')+' | '+name+' | '+q+'\n  intent='+r.intent+' status='+r.status+'\n  answer='+r.answer+'\n');}
console.log('SIMULATION',cases.length-bad,'passed routing expectations,',bad,'failed');if(bad)process.exit(1);
