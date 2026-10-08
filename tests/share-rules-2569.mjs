import assert from 'node:assert/strict';
import fs from 'node:fs';
const p=new URL('../data/share-rules-2569.review.json',import.meta.url);
const kb=JSON.parse(fs.readFileSync(p,'utf8'));
assert.equal(kb.deployment,'REVIEW_ONLY');
assert.equal(kb.rates.length,9);
assert.equal(kb.rates[0].baht_per_month,500);
assert.equal(kb.rates.at(-1).baht_per_month,2100);
for(const row of kb.rates){assert.equal(row.baht_per_month,row.shares_per_month*10);assert.equal(row.status,'DOCUMENT_VERIFIED');assert.ok(row.source.url&&row.source.page);}
function rate(income){const matches=kb.rates.filter(x=>(x.income_min===null||income>=x.income_min)&&(x.income_max===null||income<=x.income_max));return matches.length===1?matches[0].baht_per_month:null;}
assert.equal(rate(14999),500);assert.equal(rate(15000),null);assert.equal(rate(15001),700);
assert.equal(rate(30000),1100);assert.equal(rate(30001),1300);assert.equal(rate(50001),2100);
assert.ok(kb.decision_locks.some(x=>x.id==='GAP-CAP'));
assert.ok(kb.decision_locks.some(x=>x.id==='GAP-DELEGATION'));
console.log('share-rules-2569 evidence regression passed');
