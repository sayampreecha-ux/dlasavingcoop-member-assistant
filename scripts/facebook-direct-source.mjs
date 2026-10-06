export function directFacebookPost(url=''){
  try{
    const u=new URL(url);
    if(!/^(www\.)?facebook\.com$/i.test(u.hostname)) return false;
    if(/^\/share\/p\/[A-Za-z0-9_-]+\/?$/i.test(u.pathname)) return true;
    return /\/posts\/|\/permalink\.php|\/photo|\/reel\//i.test(u.pathname+u.search);
  }catch{return false}
}

export function facebookTopicKey(text=''){
  const s=String(text);
  if(/กำหนดอัตราเงินได้รายเดือน|อัตรา.*ถือหุ้น|การถือหุ้น|ซื้อหุ้นเพิ่ม|หุ้นเพิ่ม/i.test(s)) return 'shares';
  if(/ประชุมใหญ่สามัญ|ประชุมใหญ่/i.test(s)) return 'agm';
  if(/ปันผล|เฉลี่ยคืน/i.test(s)) return 'dividend';
  if(/ยืนยันยอด/i.test(s)) return 'balance-confirmation';
  if(/ทุนการศึกษา|สวัสดิการ/i.test(s)) return 'welfare';
  if(/เงินกู้|กู้สามัญ|กู้ฉุกเฉิน|เคหะ|รวมหนี้|ไถ่ถอน/i.test(s)) return 'loan';
  if(/ประกัน/i.test(s)) return 'insurance';
  if(/สมาชิก|คืนสู่เหย้า/i.test(s)) return 'membership';
  return null;
}

export function facebookTitle(message=''){
  const line=String(message).split(/\r?\n/).map(x=>x.trim()).find(Boolean)||'ประกาศจาก Facebook สหกรณ์';
  return line.replace(/^#+\s*/,'').slice(0,180);
}

export function normalizeGraphPosts(posts,{officialPageUrl='https://www.facebook.com/dlasaving',now=new Date(),maxAgeDays=7,scoreTitle,eventMeta}={}){
  if(!Array.isArray(posts)||typeof scoreTitle!=='function'||typeof eventMeta!=='function') return [];
  const maxAge=maxAgeDays*24*60*60*1000;
  const out=[];
  for(const p of posts){
    const message=String(p?.message||'').trim();
    const permalink=String(p?.permalink_url||'').trim();
    const publishedAt=p?.created_time ? new Date(p.created_time).toISOString() : null;
    if(!message||!directFacebookPost(permalink)||!publishedAt) continue;
    const age=now-new Date(publishedAt);
    if(age<0||age>maxAge) continue;
    const score=scoreTitle(message);
    if(score<60) continue;
    const topicKey=facebookTopicKey(message);
    if(!topicKey) continue;
    const meta=eventMeta(message);
    out.push({
      contentKind:'NEWS',
      rulePromotion:false,
      id:'facebook-'+String(p.id||topicKey+'-'+publishedAt).replace(/[^A-Za-z0-9_-]/g,'-'),
      topicKey,
      title:facebookTitle(message),
      summary:'ประกาศใหม่จาก Facebook ทางการ — เปิดโพสต์ต้นฉบับเพื่อดูรายละเอียด',
      status:meta.status,
      statusLabel:meta.statusLabel,
      priority:Math.max(score,90),
      url:officialPageUrl,
      ask:meta.ask,
      source:'official-facebook',
      publishedAt,
      directSourceUrl:permalink,
      discoveryUrl:officialPageUrl,
      sourceState:'DIRECT_VERIFIED',
      sourceLabel:'โพสต์ต้นฉบับจาก Facebook',
      directSourceVerification:'GRAPH_API_PAGE_POST',
      eventDate:null,
      expiresAt:null
    });
  }
  return out;
}

export function chooseLatestFacebookByTopic(items=[]){
  const map=new Map();
  for(const item of items){
    if(!item?.directSourceUrl||!directFacebookPost(item.directSourceUrl)) continue;
    const key=item.topicKey||facebookTopicKey(item.title)||item.id;
    const prev=map.get(key);
    const t=Date.parse(item.publishedAt||0)||0;
    const pt=Date.parse(prev?.publishedAt||0)||0;
    if(!prev||t>pt) map.set(key,{...item,topicKey:key});
  }
  return [...map.values()];
}
