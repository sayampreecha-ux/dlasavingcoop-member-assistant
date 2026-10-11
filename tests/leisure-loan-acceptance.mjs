import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';

const app = loadMemberEngine();
const queries = [
  'เงินกู้สามัญเพื่อการพักผ่อน',
  'กู้เพื่อการพักผ่อน',
  'กู้พักผ่อน',
  'กู้ท่องเที่ยว',
  'ขอกู้ไปเที่ยวได้ไหม',
  'กู้พักผ่อนใช้เอกสารอะไร',
  'เงินกู้เพื่อการพักผ่อนผ่อนกี่งวด',
  'กู้พักผ่อนดอกเบี้ยเท่าไร'
];
for (const query of queries) {
  const result = app.answer(query);
  const output = JSON.stringify(result);
  assert.match(output, /พักผ่อน/, 'Must identify official leisure-loan product: ' + query);
  assert.ok(output.includes('dlasavingcoop.com/show.php?No=774') || output.includes('www.dlasavingcoop.com/show.php?No=774'), 'Must link to official source page: ' + query);
  assert.doesNotMatch(output, /undefined|NaN/, 'No invalid answer values: ' + query);
}
console.log('LEISURE LOAN: 8 member questions PASS');
