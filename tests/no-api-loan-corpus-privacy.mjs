import assert from 'node:assert/strict';
import fs from 'node:fs';

const corpus=JSON.parse(fs.readFileSync(new URL('../data/legacy-line-69-corpus.json',import.meta.url),'utf8'));
const master=JSON.parse(fs.readFileSync(new URL('../data/official-rule-master.json',import.meta.url),'utf8'));
assert.equal(corpus.records.length,69);
const loan=corpus.records.filter(r=>r.intent.startsWith('loan_'));
assert.equal(loan.length,59);
const patterns=loan.reduce((sum,r)=>sum+r.question_patterns.length,0);
assert.ok(patterns>=250,'loan pattern coverage unexpectedly shrank');

const checks=[
 ['thai_citizen_id',/(?<!\d)\d[\s-]?\d{4}[\s-]?\d{5}[\s-]?\d{2}[\s-]?\d(?!\d)/g],
 ['mobile',/(?<!\d)(?:\+66|0)[689]\d[\d -]{7,11}(?!\d)/g],
 ['bank_account',/(?:เลขบัญชี|บัญชีเลขที่)\s*[:：]?\s*\d[\d -]{7,}/g],
 ['line_id',/(?:line id|ไลน์ไอดี|id line)\s*[:：]?\s*[@\w.-]{4,}/gi],
 ['email',/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi]
];
const allowedOfficialEmail=master.rules?.emergencyLoanCurrent?.submissionEmail;
assert.ok(allowedOfficialEmail,'missing current primary emergency email evidence');
let inspected=0,emailOccurrences=0;
for(const row of corpus.records){
 for(const [field,value] of Object.entries(row)){
  inspected++;
  const text=typeof value==='string'?value:JSON.stringify(value);
  for(const [kind,re] of checks){
   for(const hit of text.matchAll(re)){
    if(kind==='email'&&row.id===45&&hit[0].toLowerCase()===allowedOfficialEmail.toLowerCase()){
     emailOccurrences++;
     continue;
    }
    throw new Error('potential private '+kind+' in corpus row '+row.id+' field '+field);
   }
  }
 }
}
assert.ok(emailOccurrences>0,'record 45 submission email expectation changed; reverify official evidence');
console.log('LINE corpus structural privacy gate:',corpus.records.length,'records,',inspected,'fields,',loan.length,'loan records,',patterns,'loan patterns, official email references',emailOccurrences);
console.log('Note: regex-based gate does not replace manual review for names and indirect identifiers');
