import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';
const F=createRequire(import.meta.url)('../scripts/official-freshness.js');
const base=JSON.parse(fs.readFileSync(new URL('../data/official-source-registry.json',import.meta.url)));
const pending={id:'doc-8ef30ac9bd3b05e970e9',title:'ผลการคัดเลือกบริษัทประเมินหลักทรัพย์',originalUrl:'https://www.dlasavingcoop.com/show.php?No=4941',officialIndexUrl:'https://www.dlasavingcoop.com/list.php?Category=notice',type:'ANNOUNCEMENT',linkVerified:true,status:'PENDING',mayAffectRules:true,affects:['ordinaryLoan'],pendingReason:'NEW_OFFICIAL_DOCUMENT'};
const now=new Date('2026-10-14T12:00:00Z');
const test=d=>{const r=structuredClone(base);r.documents.push(d);return F.gate(r,'กู้สามัญเพื่อการพักผ่อน',{now});};
assert.equal(test(pending).allowed,true,'Unproven broad discovery does not supersede verified product');
assert.equal(test({...pending,title:'ประกาศเปลี่ยนเงื่อนไขกู้พักผ่อน'}).allowed,false,'Named product pending locks');
assert.equal(test({...pending,affectedRuleIds:['leisureLoanCurrent']}).allowed,false,'Explicit rule scope locks');
assert.equal(test({...pending,status:'CONFLICT',conflictsWithDocumentIds:['doc-5c893b2d819d747e4a6c']}).reason,'CONFLICTING_DOCUMENT');
const unverified=structuredClone(base);unverified.ruleVersions=unverified.ruleVersions.filter(v=>v.ruleId!=='leisureLoanCurrent');unverified.documents.push({...pending,title:'ประกาศหลักเกณฑ์เงินกู้ฉบับใหม่'});
assert.equal(F.gate(unverified,'กู้สามัญเพื่อการพักผ่อน',{now}).allowed,false,'No verified source means no exception');
const app=loadMemberEngine();const snapshot=app.getSourceRegistry();snapshot.documents.push(pending);app.applySourceMonitor(snapshot);
for(const q of ['กู้พักผ่อน','กู้ท่องเที่ยว','ขอกู้ไปเที่ยวได้ไหม','กุ้ท่องเที่ยว']){
 const r=app.answer(q);assert.equal(r.intent,'loan_vacation');assert.match(r.answer,/300,000 บาท.*36 งวด/);assert.match([r.answer,...r.details].join(' '),/4\.25% ต่อปี.*ประชาสัมพันธ์/);
}
assert.equal(app.getSourceRegistry().documents.find(d=>d.id===pending.id).status,'PENDING','Monitor discovery remains pending');
assert.notEqual(app.answer('กู้สามัญ').decision,'EVIDENCE_LOCK','Administrative discovery must not block ordinary rules');
assert.match(app.answer('กู้ฉุกเฉินผ่อนได้กี่งวด').answer,/15 งวด/,'Administrative discovery must not block emergency rules');
console.log('SOURCE-SPECIFIC GATE: VERIFIED / broad PENDING / relevant PENDING / CONFLICT / missing evidence / synonyms / other domain PASS');

const conflict=app.getSourceRegistry();conflict.documents.push({...pending,id:'explicit-conflict',status:'CONFLICT',conflictsWithDocumentIds:['doc-5c893b2d819d747e4a6c']});app.applySourceMonitor(conflict);assert.equal(app.answer('กู้พักผ่อน').decision,'EVIDENCE_LOCK','Runtime conflict is retained');
