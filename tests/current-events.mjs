import fs from 'node:fs';

const data=JSON.parse(fs.readFileSync(new URL('../data/current-events.json',import.meta.url),'utf8'));
const errors=[];
const now=new Date();

if(data.schemaVersion!==1) errors.push('schemaVersion must be 1');
if(data.mode!=='official-auto') errors.push('mode must be official-auto');
if(!Array.isArray(data.events)) errors.push('events must be an array');
if((data.events||[]).length>3) errors.push('homepage current events must be <= 3');
if(!data.lastCheckedAt||Number.isNaN(Date.parse(data.lastCheckedAt))) errors.push('lastCheckedAt missing/invalid');

const ids=new Set(),urls=new Set();

function isDirectSource(url=''){
  try{
    const u=new URL(url);
    if(u.hostname==='drive.google.com'&&/\/file\/d\//.test(u.pathname)) return true;
    if(/^(www\.)?dlasavingcoop\.com$/i.test(u.hostname)){
      if(/\.pdf$/i.test(u.pathname)) return true;
      if(/show\.php$/i.test(u.pathname)&&/^\d+$/.test(u.searchParams.get('No')||'')) return true;
    }
    if(/^(www\.)?facebook\.com$/i.test(u.hostname)){
      if(/^\/share\/p\/[A-Za-z0-9_-]+\/?$/i.test(u.pathname)) return true;
      if(/\/share\//i.test(u.pathname)||/^\/dlasaving\/?$/i.test(u.pathname)) return false;
      return /\/posts\/|\/permalink\.php|\/photo|\/reel\//i.test(u.pathname+u.search);
    }
    return false;
  }catch{return false}
}
function isAggregateOrProfile(url=''){
  try{
    const u=new URL(url);
    if(/^(www\.)?facebook\.com$/i.test(u.hostname)){
      if(/^\/dlasaving\/?$/i.test(u.pathname)) return true;
      if(/\/share\//i.test(u.pathname)&&!/^\/share\/p\/[A-Za-z0-9_-]+\/?$/i.test(u.pathname)) return true;
    }
    if(/^(www\.)?dlasavingcoop\.com$/i.test(u.hostname)){
      if(u.pathname==='/'||/\/list\.php$/i.test(u.pathname)||u.searchParams.has('Category')) return true;
    }
  }catch{}
  return false;
}
for(const e of data.events||[]){
  if(!e.id||ids.has(e.id)) errors.push('duplicate/missing id: '+e.id);
  ids.add(e.id);
  if(!e.title||!e.summary||!e.statusLabel) errors.push('missing display fields: '+e.id);
  if(!/^https:\/\/(www\.)?dlasavingcoop\.com\//i.test(e.url||'') && !(e.source==='official-facebook' && e.rulePromotion===false && /^https:\/\/(www\.)?facebook\.com\/dlasaving\/?/i.test(e.url||''))) errors.push('non-official URL: '+e.url);
  if(/board_(?:content|post)\.php/i.test(e.url||'')) errors.push('member board must not be promoted as official current event: '+e.url);
  if(!e.sourceState||!['DIRECT_VERIFIED','DIRECT_SOURCE_PENDING'].includes(e.sourceState)) errors.push('invalid sourceState: '+e.id);
  if(e.sourceState==='DIRECT_VERIFIED'){
    if(!e.directSourceUrl||!isDirectSource(e.directSourceUrl)) errors.push('verified event lacks direct source: '+e.id);
    if(e.sourceLabel!=='ต้นฉบับทางการ'&&e.sourceLabel!=='โพสต์ต้นฉบับจาก Facebook') errors.push('verified event has misleading source label: '+e.id);
  } else {
    if(e.directSourceUrl) errors.push('pending event must not expose directSourceUrl: '+e.id);
    if(e.sourceLabel!=='กำลังตรวจต้นฉบับ') errors.push('pending event must show pending label: '+e.id);
    if(!e.discoveryUrl) errors.push('pending event missing discoveryUrl: '+e.id);
  }
  if(e.directSourceUrl&&isAggregateOrProfile(e.directSourceUrl)) errors.push('aggregate/profile cannot be direct source: '+e.id);
  if(e.directSourceUrl&&/^https:\/\/(www\.)?facebook\.com\/share\/p\//i.test(e.directSourceUrl)){
    if(e.source!=='official-facebook') errors.push('Facebook exact-post link must be official-facebook discovery: '+e.id);
    if(e.directSourceVerification!=='USER_SUPPLIED_EXACT_POST') errors.push('Facebook share-post link lacks explicit exact-post verification: '+e.id);
  }
  const dedupeUrl=e.directSourceUrl||e.discoveryUrl||e.url;
  if(urls.has(dedupeUrl)) errors.push('duplicate URL: '+dedupeUrl);
  urls.add(dedupeUrl);
  if(!e.ask) errors.push('missing internal ask route: '+e.id);
  if(e.source==='official-facebook' && e.rulePromotion!==false) errors.push('Facebook discovery must never promote rules: '+e.id);
  const currentThaiYear=new Date().getFullYear()+543;
  const years=[...String(e.title||'').matchAll(/25\d{2}/g)].map(m=>Number(m[0]));
  if(years.some(y=>y<currentThaiYear)) errors.push('prior-year headline must not be current: '+e.id);
  if(e.expiresAt){
    const d=new Date(e.expiresAt);
    if(Number.isNaN(d.getTime())) errors.push('invalid expiresAt: '+e.id);
    if(d<=now) errors.push('expired event must not be published: '+e.id);
  }
}

if(!data.sourceHealth||!['ok','error'].includes(data.sourceHealth.homepage)||!['ok','error'].includes(data.sourceHealth.notices)){
  errors.push('sourceHealth invalid');
}
if(data.sourceHealth?.homepage==='error'&&data.sourceHealth?.notices==='error') errors.push('both official sources unavailable');

if(errors.length){
  console.error(JSON.stringify({ok:false,errors},null,2));
  process.exit(1);
}
console.log(JSON.stringify({ok:true,events:data.events.length,lastCheckedAt:data.lastCheckedAt},null,2));
