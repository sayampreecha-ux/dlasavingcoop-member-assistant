import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
new Function(scripts[0])(); new Function(scripts[1])(); new Function(scripts[2]);
const A=q=>globalThis.COOP_APP.answer(q), failures=[];
const cases=[
 ['เอกสารผ่านแล้วเงินจะเข้าวันไหน','live_schedule'],
 ['เอกสารผ่านแล้วแต่ไม่มีชื่ออนุมัติ เพราะอะไร','status_center'],
 ['เอกสารลงรับแล้วทำไมยังขึ้นรอตรวจสอบ','status_center'],
 ['เอกสารไม่ผ่าน แต่ยังไม่มีเจ้าหน้าที่แจ้งว่าเพราะอะไร','status_center'],
 ['รอบันทึกข้อมูล จะเข้าประชุมรอบนี้ไหม','live_schedule'],
 ['ผมจะเช็คได้อย่างไรว่ายังติดค้ำประกันใครอยู่','member_self_service'],
 ['ผู้ค้ำของผมเกษียณแล้ว ต้องเปลี่ยนผู้ค้ำไหม','retired_guarantor_current'],
 ['ผู้ค้ำเสียชีวิต ต้องหาผู้ค้ำใหม่อย่างไร','loan_change_guarantor'],
 ['ปิดยอดฉุกเฉินแล้วแต่หน่วยงานยังหักหน้าฎีกา ต้องแจ้งสหกรณ์ไหม','payment'],
 ['กู้สามัญอยู่และมีพัฒนาคุณภาพชีวิต จะกู้ฉุกเฉินเพิ่มได้ไหม','loan_compound_reasoning'],
 ['ครบงวดตามเกณฑ์แล้ว แต่ระบบยังไม่ตัดชำระ ถือว่าครบหรือยัง','personal_handoff'],
 ['ยื่นก่อนวันสิ้นสุดหลักเกณฑ์ แต่ตรวจหลังวันสิ้นสุด ใช้เกณฑ์ไหน','personal_handoff'],
 ['โอนเงินสามัญบัญชี ธกส. พร้อมกรุงไทยไหม','live_schedule'],
 ['ลาออกแล้วเอกสารถึงสหกรณ์ แต่ยังขึ้นรอบันทึกข้อมูล ติดอะไรไหม','status_center'],
 ['สมัครฌาปนกิจแล้ว เหลือแต่อนุมัติ ตรวจสถานะตรงไหน','funeral']
];
for(const [q,expected] of cases){
 const r=A(q), all=[r.answer,...(r.details||[]),...(r.followups||[])].join(' ');
 if(r.intent!==expected) failures.push({q,expected,actual:r.intent,group:'intent'});
 if(!r.answer) failures.push({q,group:'empty'});
 // Dynamic/personal cases must not fabricate a definite live outcome.
 if(['live_schedule','status_center','member_self_service','personal_handoff'].includes(expected) &&
    /ได้รับอนุมัติแล้ว|เงินจะเข้าแน่นอน|ผ่านแน่นอน/.test(all))
   failures.push({q,group:'unsafe-certainty',answer:r.answer});
}
const round2=[
 ['กู้เพื่อการศึกษาอยู่ ถ้าจะกู้สามัญเพิ่มต้องหักกลบสัญญาเดิมไหม',null],
 ['ส่งพัฒนาคุณภาพชีวิตครบแล้ว แต่ยอดงวดยังไม่ขึ้นในระบบ จะยื่นฉุกเฉินได้เลยไหม',null],
 ['เงินเดือนเหลือหลังหักประมาณห้าพัน จะกู้เพิ่มได้ไหม',null],
 ['หุ้นยังไม่ถึงเกณฑ์ ใช้เงินฝากมารวมเป็นหลักประกันได้ไหม',null],
 ['เคยปรับโครงสร้างหนี้ ตอนนี้อยากกู้ฉุกเฉิน ต้องรอกี่งวด',null],
 ['กู้โดยใช้หุ้นค้ำ ต้องมีผู้ค้ำอีกไหม',null],
 ['ขอลาออกจากสมาชิกแล้ว แต่ยังมีภาระค้ำประกันคนอื่นอยู่ ลาออกได้เลยไหม',null],
 ['เปลี่ยนผู้รับผลประโยชน์ต้องใช้เอกสารอะไร และทำออนไลน์ได้ไหม',null],
 ['เกษียณแล้ว สิทธิสมาชิกกับเงินกู้เดิมต้องทำอะไรต่อ',null],
 ['ผู้กู้เสียชีวิต สหกรณ์หักจากประกัน หุ้น หรือฌาปนกิจก่อน',null],
 ['เงินปันผลกับเงินเฉลี่ยคืนคิดจากอะไรเหมือนกันไหม',null],
 ['หักเงินเดือนชำระแล้ว แต่ยอดในระบบสมาชิกยังไม่ลด ต้องทำอย่างไร',null],
 ['เอกสารกู้ถึงสหกรณ์แล้ว อยากรู้ว่าตอนนี้อยู่ขั้นตอนไหน',null],
 ['ยื่นกู้วันนี้ จะเข้าประชุมและได้เงินวันไหน',null],
 ['ประกาศหลักเกณฑ์กู้มีฉบับใหม่ ต้องใช้ฉบับไหนกับคำขอที่ยื่นไปแล้ว',null]
];
for(const [q] of round2){
 const r=A(q), all=[r.answer,...(r.details||[]),...(r.followups||[])].join(' ');
 if(r.intent==='fallback'||r.intent==='empty') failures.push({q,group:'round2-fallback'});
 if(!r.answer) failures.push({q,group:'round2-empty'});
 if(/ได้รับอนุมัติแล้ว|เงินจะเข้าแน่นอน|ผ่านแน่นอน/.test(all)) failures.push({q,group:'round2-unsafe-certainty'});
 if(!r.evidence && !r.decision && !(r.sources||[]).length && !(r.actions||[]).length && !/ตรวจ|เจ้าหน้าที่|ข้อมูล|หลักเกณฑ์|ระเบียบ/.test(all))
   failures.push({q,group:'round2-no-boundary'});
}
const edge=[
 'ครบ 12 งวดพอดีวันเปลี่ยนหลักเกณฑ์ ยื่นกู้สามัญใหม่ได้ไหม',
 'เอกสารผ่านแต่รอเอกสารผู้ค้ำ จะทันรอบโอนไหม',
 'กู้สามัญเดิมกับคุณภาพชีวิต ถ้าจะกู้ใหม่ต้องหักกลบสัญญาไหน',
 'ผู้ค้ำเกษียณแล้วแต่ในระบบยังติดค้ำอยู่ ต้องทำอย่างไร'
];
for(const q of edge){
 const r=A(q), all=[r.answer,...(r.details||[])].join(' ');
 if(r.intent==='fallback'||r.intent==='empty') failures.push({q,group:'edge-fallback'});
 if(!r.answer) failures.push({q,group:'edge-empty'});
 if(!r.evidence && !r.decision && !(r.sources||[]).length && !/ตรวจสอบ|เจ้าหน้าที่|ข้อมูล/.test(all)) failures.push({q,group:'edge-no-boundary'});
}
if(failures.length){console.error(JSON.stringify({ok:false,source:'OpenChat รวมพลังฅนท้องถิ่น',failures},null,2));process.exit(1);}
console.log(JSON.stringify({ok:true,source:'OpenChat รวมพลังฅนท้องถิ่น',cases:cases.length,edge:edge.length,round2:round2.length,total:cases.length+round2.length+edge.length},null,2));
