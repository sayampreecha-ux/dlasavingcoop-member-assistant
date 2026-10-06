import fs from 'node:fs';
import assert from 'node:assert/strict';
import {loadMemberEngine} from './helpers/load-member-engine.mjs';

function isDirectSource(url=''){
  try{
    const u=new URL(url);
    if(u.hostname==='drive.google.com'&&/\/file\/d\//.test(u.pathname)) return true;
    if(/^(www\.)?dlasavingcoop\.com$/i.test(u.hostname)){
      if(/\.pdf$/i.test(u.pathname)) return true;
      if(/\/show\.php$/i.test(u.pathname)&&/^\d+$/.test(u.searchParams.get('No')||'')){
        return !['772','773','774','775','807','2385'].includes(u.searchParams.get('No'));
      }
    }
    if(/^(www\.)?facebook\.com$/i.test(u.hostname)){
      return !/\/share\//i.test(u.pathname)&&!/^\/dlasaving\/?$/i.test(u.pathname)&&/\/posts\/|\/permalink\.php|\/photo|\/reel\//i.test(u.pathname+u.search);
    }
  }catch{}
  return false;
}

const events=JSON.parse(fs.readFileSync(new URL('../data/current-events.json',import.meta.url),'utf8'));
for(const e of events.events||[]){
  if(e.sourceState==='DIRECT_VERIFIED'){
    assert.ok(isDirectSource(e.directSourceUrl),'event must link to direct original: '+e.id);
    assert.ok(['ต้นฉบับทางการ','โพสต์ต้นฉบับจาก Facebook'].includes(e.sourceLabel),'verified event label');
  }else{
    assert.equal(e.directSourceUrl,null,'pending event must not expose a fake direct URL: '+e.id);
    assert.equal(e.sourceLabel,'กำลังตรวจต้นฉบับ','pending event label: '+e.id);
  }
}

const ruleMaster=JSON.parse(fs.readFileSync(new URL('../data/official-rule-master.json',import.meta.url),'utf8'));
const requiredRules=[
  'ordinaryLoanCurrent','emergencyLoanCurrent','qualityOfLifeCurrent',
  'specialHousingCurrent','specialRedeemMortgageCurrent','sharesClause7Current',
  'welfareChildbirth','welfareMarriage','welfareReligion','welfareGraduation',
  'welfareGratuity','welfareMemberDeath','welfareFamilyDeath','welfareDisaster',
  'memberInformationChange'
];
for(const key of requiredRules){
  const r=ruleMaster.rules?.[key];
  assert.ok(r,'missing rule '+key);
  const direct=r.detailSource||r.source;
  assert.ok(isDirectSource(direct),'verified rule lacks direct source '+key+' -> '+direct);
}

const engine=loadMemberEngine();
const probes=[
  ['กู้สามัญได้กี่บาท',/1QQo5gux4sB3xdcbFvxYBeV-D30gOkXnV/],
  ['กู้ฉุกเฉินได้เท่าไร',/1XZYfuXWgzqWp6K_Ld0aosuO58pxKXU5p/],
  ['คลอดบุตรได้สวัสดิการเท่าไร',/1Xzby7B_dQqS3Uwn6dfXp07h7OxgW_M9I/],
  ['เปลี่ยนอัตราหุ้นรายเดือน',/1035C9tf9AU--HHJFq581v9uCwsF6ANL_/]
];
for(const [q,re] of probes){
  const r=engine.answer(q);
  const urls=[...(r.sources||[]).map(x=>x.url),...(r.actions||[]).map(x=>x[1])].filter(x=>/^https:/i.test(x||''));
  assert.ok(urls.some(u=>re.test(u)),'answer must expose verified direct source for: '+q+'\n'+JSON.stringify(urls));
}

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert.ok(html.includes("if(e.directSourceUrl)"),'current-event renderer must use directSourceUrl');
assert.ok(html.includes("e.sourceState==='DIRECT_VERIFIED'&&!!e.directSourceUrl"),'member-facing current events must filter out pending discovery-only items');
assert.ok(!/e\.url[^\n]{0,180}ต้นฉบับทางการ/.test(html),'generic event url must never be labeled as original');

console.log('DIRECT SOURCE LAYER: verified originals, pending discovery hidden from members, core member topics PASS');
