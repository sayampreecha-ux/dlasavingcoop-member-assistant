import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const master=JSON.parse(fs.readFileSync(new URL('../data/official-rule-master.json',import.meta.url),'utf8'));
const rule=master.rules.ordinaryLoanCurrent;
const official='https://drive.google.com/file/d/1QQo5gux4sB3xdcbFvxYBeV-D30gOkXnV/view?usp=sharing';
assert.equal(rule.status,'VERIFIED_PRIMARY');
assert.equal(rule.effectiveFrom,'2026-10-01');
assert.equal(rule.maxAmountBaht,2000000);
assert.equal(rule.maxTermInstallments,240);
assert.equal(rule.maxAgeAtEnd,75);
assert.equal(rule.membershipMinMonths,6);
assert.equal(rule.sharePaymentMinInstallments,6);
assert.equal(rule.remainingIncomeMinPercent,15);
assert.equal(rule.remainingIncomeMinBaht,6000);
assert.equal(rule.noArrearsInstallments,12);
assert.deepEqual(JSON.parse(JSON.stringify(rule.guarantorBands)),[{max:500000,minGuarantors:1},{min:500001,max:1000000,minGuarantors:2},{min:1000001,max:2000000,minGuarantors:3}]);
assert.equal(rule.guarantorMaxBorrowers,3);
assert.equal(rule.realEstateCollateralMaxPercentOfAppraisal,90);
assert.ok(rule.source===official || rule.source.replace('?usp=sharing','')===official.replace('?usp=sharing',''));
assert.equal(rule.interestRatePercent,undefined,'Do not infer infographic 7.50 as interest rate from this announcement');
const app=loadMemberEngine();
for(const question of ['เงินกู้สามัญ','เงินกู้สามัญต้องส่งหุ้นกี่งวด','กู้สามัญสูงสุดเท่าไร']){
  const answer=app.answer(question);
  assert.ok(answer&&answer.answer,question);
  assert.ok(answer.sources?.length||answer.actions?.length,question+' no official reference');
}
console.log('PRIMARY ORDINARY INFOGRAPHIC AUDIT PASS: 2569 primary terms aligned; interest requires separate source');
