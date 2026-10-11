import assert from 'node:assert/strict';import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const app=loadMemberEngine();
for(const q of ['ทุนการศึกษาบุตร','ทุนเรียนลูก','ทุนบุตร','ขอทุนการศึกษาบุตร']){const r=app.answer(q);assert.equal(r.intent,'scholarship',q);assert.doesNotMatch(r.answer,/หรือเงินกู้เพื่อการศึกษา/);assert.ok(r.actions.some(x=>x[1]==='https://www.dlasavingcoop.com/show.php?No=4887'));assert.ok(r.actions.some(x=>x[1].includes('1_7VIQigZV7SFCH7QOdZGkvTfs-8SHsjt')));assert.ok(!r.actions.some(x=>/Category=notice|No=775/.test(x[1])));assert.ok(!r.actions.some(x=>/หน้ารวมทางการ/.test(x[0])));}
assert.equal(app.answer('กู้เพื่อการศึกษา').domain,'education');
console.log('SCHOLARSHIP DIRECT SOURCE: 25 checks PASS');
