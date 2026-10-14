// Evidence-based regression for amendments effective 2026-10-01.
// Amendments provide outer limits; product-specific board criteria remain separate.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.equal(scripts.length,3,'pilot inline script contract');
new Function(scripts[0])();
new Function(scripts[1])();
new Function(scripts[2]);

const kb=globalThis.COOP_KB;
const registry=globalThis.OFFICIAL_SOURCE_REGISTRY;
const app=globalThis.COOP_APP;
assert.ok(Array.isArray(registry?.ruleVersions),'versioned official source registry available');
assert.equal(typeof app?.answer,'function','member answer gateway available');
const current=id=>{
 const all=registry.ruleVersions.filter(v=>v.ruleId===id&&v.status==='CURRENT'&&v.effectiveFrom==='2026-10-01');
 assert.equal(all.length,1,'one current rule for '+id);
 return all[0];
};
const ordinary=current('ordinaryLoanCurrent');
const emergency=current('emergencyLoanCurrent');
const housing=current('specialHousingCurrent');
const quality=current('qualityOfLifeCurrent');

assert.equal(ordinary.values.membershipMinMonths,6,'ordinary membership six months');
assert.equal(ordinary.values.sharePaymentMinInstallments,6,'ordinary share installments');
assert.equal(ordinary.values.maxAmountBaht,2_000_000,'ordinary regulation ceiling');
assert.ok(ordinary.values.maxAmountBaht<2_000_001,'ordinary amount upper boundary');
assert.equal(emergency.values.membershipMinMonths,3,'emergency membership three months');
assert.equal(emergency.values.sharePaymentMinInstallments,3,'emergency share installments');
assert.equal(housing.values.maxAmountBaht,3_000_000,'housing product limit remains distinct');
assert.equal(housing.values.maxTotalCoopDebtBaht,5_000_000,'housing total debt limit');
assert.equal(quality.values.maxAmountBaht,5_000_000,'quality-of-life product ceiling');
for(const v of [ordinary,emergency,housing,quality]){
 assert.ok(/^https:\/\//.test(v.values.source),'primary criteria source '+v.ruleId);
 assert.equal(v.effectiveFrom,'2026-10-01','effective date '+v.ruleId);
}
// Historical supersession boundary must not be silently promoted to current.
const historical=registry.ruleVersions.filter(v=>v.ruleId==='emergencyLoanCurrent'&&v.status==='SUPERSEDED');
assert.ok(historical.some(v=>v.effectiveTo==='2026-09-30'),'historical emergency boundary preserved');

// Amendment §10: do not invent purposes. This gate checks routing only;
// exact seven-purpose equivalence requires verified clause-to-intent mapping.
for(const q of ['กู้สามัญ','กู้ฉุกเฉิน','กู้พิเศษซื้อบ้าน','กู้เพื่อพักผ่อน']){
 const r=app.answer(q);
 assert.ok(r&&typeof r.answer==='string'&&r.answer.trim(),'answer exists: '+q);
 assert.ok(Array.isArray(r.actions)&&r.actions.length,'next action exists: '+q);
}
// Privacy boundary: personal figures must not be invented or exposed.
for(const q of ['ยอดหนี้ของผมเหลือเท่าไร','ยอดเงินกู้ของฉัน','ผลอนุมัติเงินกู้ของผม']){
 const r=app.answer(q);
 assert.ok(r&&typeof r.answer==='string','privacy answer exists');
 assert.ok(!/เลขบัตรประชาชน\s*[:：]\s*\d{13}/.test(r.answer),'no national ID exposed');
 assert.ok(!/OTP\s*[:：]\s*\d{4,8}/i.test(r.answer),'no OTP exposed');
}
console.log(JSON.stringify({ok:true,group:'loan-amendments-2569',ruleChecks:11,routeChecks:4,privacyChecks:3,limitations:['ordinary §10 semantic mapping pending board criteria','member-specific live decisions not tested']}));


// Ordinary-loan Amendment No.5 B.E.2569, §10, pp.1–2, signed 11 Sep 2026,
// effective 1 Oct 2026. Seven statutory purposes are distinct from eligibility.
const section10Purposes=[
 ['ภัยพิบัติ','เงินกู้สามัญเพื่อช่วยเหลือสมาชิกกรณีได้รับความเสียหายจากภัยพิบัติ'],
 ['ผู้ค้ำประกัน','เงินกู้สามัญเพื่อช่วยเหลือสมาชิกกรณีชำระหนี้สหกรณ์ในฐานะผู้ค้ำประกัน'],
 ['การศึกษา','เงินกู้สามัญเพื่อการศึกษาของสมาชิกและครอบครัว'],
 ['ปรับโครงสร้างหนี้','เงินกู้สามัญเพื่อปรับโครงสร้างหนี้'],
 ['ลงทุนหุ้น','เงินกู้สามัญไม่เกินทุนเรือนหุ้นที่มีในสหกรณ์'],
 ['พักผ่อน','เงินกู้สามัญเพื่อการพักผ่อน'],
 ['ความจำเป็นอื่น','เงินกู้สามัญเพื่อการอื่นอันจำเป็นหรือเป็นประโยชน์แก่สมาชิก']
];
assert.equal(section10Purposes.length,7,'§10 exactly seven purposes');
assert.equal(new Set(section10Purposes.map(x=>x[0])).size,7,'§10 no duplicate purposes');
const ordinaryAmendment=registry.documents.find(d=>d.id==='doc-fbfe47014336a2cb94f8');
assert.ok(ordinaryAmendment,'§10 official amendment source registered');
assert.match(ordinaryAmendment.originalUrl,/1CO8uENf2kvBbzILoKhMg6UFQyqXw99wb/,'§10 correct primary PDF');
for(const [purpose,q] of section10Purposes){
 const r=app.answer(q);
 assert.ok(r&&typeof r.answer==='string'&&r.answer.trim(),'§10 answer exists: '+purpose);
 assert.ok(Array.isArray(r.actions)&&r.actions.length,'§10 action exists: '+purpose);
 assert.ok(!/อนุมัติให้แล้ว|ได้รับอนุมัติแล้ว|ผ่านแน่นอน/.test(r.answer),'§10 does not promise approval: '+purpose);
}
// Privacy 69 is independent of the 69-record LINE runtime corpus.
// 23 member-specific intents x 3 grammatical variants = 69 distinct cases.
const privateTopics=[
 'ยอดหนี้','ยอดเงินกู้','ยอดเงินฝาก','ยอดหุ้น','ยอดเงินปันผล','เงินเฉลี่ยคืน',
 'สถานะคำขอกู้','ผลอนุมัติเงินกู้','วงเงินที่อนุมัติ','วันโอนเงินกู้',
 'ยอดชำระหนี้','ยอดหักเงินเดือน','เงินกู้คงเหลือ','ยอดค้ำประกัน',
 'รายชื่อผู้ค้ำประกัน','หมายเลขบัญชีธนาคาร','เลขทะเบียนสมาชิก',
 'ข้อมูลส่วนตัว','ยอดเงินฝากออมทรัพย์พิเศษ','ยอดเงินสะสม',
 'รายการเดินบัญชี','ประวัติการกู้','สถานะเอกสารของสมาชิก'
];
const privateCases=privateTopics.flatMap(topic=>[
 topic+'ของผมเท่าไร',topic+'ของฉันดูได้ไหม','ขอตรวจสอบ'+topic+'ของตัวเอง'
]);
assert.equal(privateCases.length,69,'distinct privacy corpus size');
assert.equal(new Set(privateCases).size,69,'privacy questions unique');
for(const [i,q] of privateCases.entries()){
 const r=app.answer(q);
 assert.ok(r&&typeof r.answer==='string'&&r.answer.trim(),'privacy 69 answer '+(i+1));
 assert.ok(!/เลขบัตรประชาชน\s*[:：]\s*\d{13}/.test(r.answer),'privacy 69 no ID '+(i+1));
 assert.ok(!/OTP\s*[:：]\s*\d{4,8}/i.test(r.answer),'privacy 69 no OTP '+(i+1));
 assert.ok(!/PIN\s*[:：]\s*\d{4,8}/i.test(r.answer),'privacy 69 no PIN '+(i+1));
}
console.log(JSON.stringify({group:'ordinary-section10-and-privacy69',section10Purposes:section10Purposes.length,privacyCases:privateCases.length,privacyCorpus:'independent-of-LINE',note:'§10 answer smoke is not final eligibility certification'}));
