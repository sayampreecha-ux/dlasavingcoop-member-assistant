const fs=require('fs');
const c=JSON.parse(fs.readFileSync('data/legacy-line-69-corpus.json','utf8'));
if(c.recordCount!==69||c.records.length!==69) throw new Error('expected 69 real records');
const ids=new Set(c.records.map(x=>x.id));
if(ids.size!==69||Math.min(...ids)!==1||Math.max(...ids)!==69) throw new Error('record IDs incomplete');
for(const r of c.records){
 if(!r.question||!r.intent) throw new Error('missing question/intent '+r.id);
 if(r.legacy_answer_policy!=='NEVER_AUTHORITY') throw new Error('legacy authority violation '+r.id);
 if(Object.prototype.hasOwnProperty.call(r,'legacy_answer')) throw new Error('legacy answer must not be executable authority '+r.id);
}
const counts=c.records.reduce((a,r)=>(a[r.intent]=(a[r.intent]||0)+1,a),{});
const expected={loan_debt_consolidation:17,contact:1,greeting:1,loan_housing:15,loan_emergency:11,loan_ordinary_related:16,membership:8};
for(const [k,v] of Object.entries(expected)) if(counts[k]!==v) throw new Error(k+' expected '+v+' got '+counts[k]);
console.log('legacy LINE real corpus OK: 69 records',counts);
