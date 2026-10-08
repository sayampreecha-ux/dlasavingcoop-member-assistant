(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.OFFICIAL_FRESHNESS=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const clone=x=>JSON.parse(JSON.stringify(x));
  const special=['qualityOfLife','specialHousing','redeemMortgage'];
  const all=['ordinaryLoan','emergencyLoan',...special,'educationLoan','disasterLoan','shares','deposits','welfare','membership','resignation','guarantor','dividendPatronage','interest'];
  function officialPage(url){try{const u=new URL(url);return u.protocol==='https:'&&/^(www\.)?dlasavingcoop\.com$/.test(u.hostname)&&!/(?:board|forum)/i.test(u.pathname);}catch{return false;}}
  function canonical(url){try{const u=new URL(url);u.hash='';u.protocol='https:';if(/^(www\.)?dlasavingcoop\.com$/.test(u.hostname))u.hostname='www.dlasavingcoop.com';const id=u.pathname.match(/\/file\/d\/([^/]+)/);if(u.hostname==='drive.google.com'&&id)return 'https://drive.google.com/file/d/'+id[1]+'/view';u.searchParams.sort();return u.toString();}catch{return '';}}
  function primary(doc){
    if(!doc||!['BYLAW','REGULATION','AMENDMENT','ANNOUNCEMENT','CRITERIA','OFFICIAL_DOCUMENT'].includes(doc.type))return false;
    if(/infographic|ประชาสัมพันธ์|สรุป/i.test(doc.title||''))return false;
    if(officialPage(doc.originalUrl))return !/infographic|ประชาสัมพันธ์|สรุป/.test(doc.title||'');
    try{const u=new URL(doc.originalUrl);return u.protocol==='https:'&&u.hostname==='drive.google.com'&&officialPage(doc.officialIndexUrl)&&doc.linkVerified===true;}catch{return false;}
  }
  function domains(text=''){
    const d=[];const add=x=>{if(!d.includes(x))d.push(x);};
    if(/หุ้น|ทุนเรือน/.test(text))add('shares');
    if(/เงินฝาก|รับฝาก/.test(text))add('deposits');
    if(/สวัสดิการ|คลอดบุตร|คลอดลูก|สมรส|แต่งงาน|เรียนจบ|สำเร็จการศึกษา|จบการศึกษา|แม่เสีย|พ่อเสีย|ทุนการศึกษา|สงเคราะห์|ศาสนกิจ|อุปสมบท|บวช|(?:สมาชิก|บุคคลในครอบครัว).*(?:เสียชีวิต|ถึงแก่กรรม)/.test(text)&&!/ฌาปนกิจ/.test(text))add('welfare');
    if(/น้ำท่วม|อุทกภัย|ภัยพิบัติ|สาธารณภัย|ไฟไหม้/.test(text)&&!/กู้|ประกัน(?:ภัย|อัคคีภัย|ไฟไหม้)|กรมธรรม์/.test(text))add('welfare');
    if(/ฉุกเฉิน/.test(text))add('emergencyLoan');
    if(/การศึกษา|ค่าเทอม|ค่าเล่าเรียน/.test(text)&&/กู้/.test(text))add('educationLoan');
    if((/ภัยพิบัติ/.test(text)||/น้ำท่วม|ไฟไหม้/.test(text)&&!/ประกัน(?:อัคคีภัย|ไฟไหม้)|กรมธรรม์/.test(text))&&/กู้/.test(text))add('disasterLoan');
    if(/รวมหนี้|คุณภาพชีวิต/.test(text))add('qualityOfLife');
    if(/เคหะ|กู้บ้าน|ซื้อบ้าน|ปลูกบ้าน|สร้างบ้าน/.test(text))add('specialHousing');
    if(/ไถ่ถอน|จำนอง|รีไฟแนนซ์บ้าน/.test(text))add('redeemMortgage');
    if(/กู้พิเศษ|เงินกู้พิเศษ/.test(text)&&!special.some(x=>d.includes(x)))special.forEach(add);
    if(/สามัญ/.test(text)&&!/การศึกษา|ภัยพิบัติ/.test(text))add('ordinaryLoan');
    if(/ค้ำ|หลักประกัน/.test(text))add('guarantor');
    if(/สมัครสมาชิก|สมาชิกภาพ|เกษียณ|บำนาญ|ข้อบังคับ|โอนสมาชิก/.test(text))add('membership');
    if(/ลาออก|ออกจากสหกรณ์|สิ้นสุดสมาชิก|พ้นสมาชิก/.test(text))add('resignation');
    if(/ปันผล|เฉลี่ยคืน/.test(text))add('dividendPatronage');
    if(/ดอกเบี้ย/.test(text))add('interest');
    if(/เงินกู้|กู้/.test(text)&&!d.some(x=>/Loan|qualityOfLife|specialHousing|redeemMortgage/.test(x)))['ordinaryLoan','emergencyLoan',...special].forEach(add);
    return d;
  }
  // Dependency edges are conditional: a share amendment does not invalidate a term-only loan inquiry.
  function queryDomains(text){
    const d=domains(text);
    if(/กู้.*(?:ได้ไหม|ได้มั้ย|ผ่านไหม|มีสิทธิ)|มีสิทธิ.*กู้/.test(text)&&!d.includes('shares'))d.push('shares');
    return d;
  }
  const months={'มกราคม':1,'กุมภาพันธ์':2,'มีนาคม':3,'เมษายน':4,'พฤษภาคม':5,'มิถุนายน':6,'กรกฎาคม':7,'สิงหาคม':8,'กันยายน':9,'ตุลาคม':10,'พฤศจิกายน':11,'ธันวาคม':12};
  function iso(y,m,d){y=+y;if(y<100)y+=2500;if(y>2400)y-=543;const v=y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0'),date=new Date(v+'T00:00:00Z');return /^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===v?v:null;}
  function asOf(text,now=new Date()){
    // Relative debt/payment history is not an instruction to apply a historical rule.
    const current=now.toLocaleDateString('en-CA',{timeZone:'Asia/Bangkok'});
    const ruleYear=text.match(/(?:กฎ|ระเบียบ|หลักเกณฑ์|ประกาศ)[^\n]{0,30}ปี\s*(\d{4})/);
    if(ruleYear){const y=+ruleYear[1]>2400?+ruleYear[1]-543:+ruleYear[1];if(y>+current.slice(0,4))return {date:null,historical:true};}
    if(/ตอนนี้|ปัจจุบัน|วันนี้/.test(text))return {date:current,historical:false};
    if(!/(?:^|\s)ณ(?:\s|วันที่)|(?:^|\s)วันที่\s|เมื่อวันที่|ย้อนหลัง|กฎ.*ก่อน|หลักเกณฑ์เดิม|ก่อนวันที่|ใช้.*(?:ปี|เดือน)|ในวันที่/.test(text))return {date:current,historical:false};
    let m=text.match(/(20\d{2})-(\d{2})-(\d{2})/),date=m&&iso(m[1],m[2],m[3]);
    if(!date){m=text.match(/(\d{1,2})\s*(มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)\s*(\d{2,4})/);if(m)date=iso(m[3],months[m[2]],m[1]);}
    if(!date){m=text.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);if(m)date=iso(m[3],m[2],m[1]);}
    if(date&&/ก่อน(?:วันที่)?\s/.test(text)){const t=new Date(date+'T00:00:00Z');t.setUTCDate(t.getUTCDate()-1);date=t.toISOString().slice(0,10);}
    return {date:date||null,historical:true};
  }
  function versionAt(registry,ruleId,date){
    if(!date)return null;
    const variants=(registry.ruleVersions||[]).filter(v=>v.ruleId===ruleId&&v.status!=='PENDING_VERIFICATION'&&v.effectiveFrom&&v.effectiveFrom<=date&&(!v.effectiveTo||date<=v.effectiveTo));
    const valid=variants.filter(v=>{const doc=registry.documents.find(d=>d.id===v.documentId);return primary(doc)&&v.review?.primaryVerified===true;}).sort((a,b)=>b.effectiveFrom.localeCompare(a.effectiveFrom));
    if(!valid.length||valid.filter(v=>v.effectiveFrom===valid[0].effectiveFrom).length>1)return null;
    return valid[0];
  }
  function documentScope(doc,text=''){
    const declared=doc.affects||[];
    if(/รับฝากเงิน.*ฌาปนกิจ/.test(doc.title||'')&&!/สมาคม|ฌาปนกิจ/.test(text)&&/เงินฝาก.*(?:ค้ำ|หลักประกัน)|(?:ค้ำ|หลักประกัน).*เงินฝาก|เงินฝากของสมาชิก|ออมทรัพย์|ฝากพิเศษ/.test(text))return [];
    let scope=/รับฝากเงิน.*ฌาปนกิจ/.test(doc.title||'')?declared.filter(x=>x!=='welfare'):declared;
    const loanDomains=['ordinaryLoan','emergencyLoan',...special,'educationLoan','disasterLoan'];
    const requested=domains(text).filter(x=>loanDomains.includes(x));
    const titled=domains(doc.title||'').filter(x=>loanDomains.includes(x));
    if(requested.length===1&&titled.length&&!titled.includes(requested[0]))scope=scope.filter(x=>x!=='guarantor');
    // A named specialised loan does not govern every ordinary-loan inquiry.
    if(/พักผ่อน/.test(doc.title||'')&&!/พักผ่อน/.test(text))return [];
    if(/เพื่อปรับโครงสร้างหนี้/.test(doc.title||'')&&(!/กู้[^\n]{0,25}(?:ปรับโครงสร้างหนี้|รีไฟแนนซ์|refinance)/i.test(text)||/เคยปรับ|ปรับโครงสร้างหนี้(?:แล้ว|มา)|หลัง(?:จาก)?ปรับ/.test(text)))return [];
    if(/ไม่เกินทุนเรือนหุ้น/.test(doc.title||'')&&!/ไม่เกิน.*(?:หุ้น|เงินฝาก)|กู้(?:เท่า|ตาม)หุ้น|กู้หุ้น/.test(text))return [];
    if(/ชำระหนี้สหกรณ์ในฐานะผู้ค้ำ/.test(doc.title||'')&&!/ชำระ.*(?:ฐานะผู้ค้ำ|แทนผู้กู้)|ผู้ค้ำ.*(?:ชำระ|ถูกเรียก|จ่ายแทน)/.test(text))return [];
    if(/อัตราดอกเบี้ยเงินกู้/.test(doc.title||''))return declared.filter(x=>x==='interest');
    return scope;
  }
  function removedArchiveHasCurrentEvidence(registry,doc,ds,date){
    if(doc.pendingReason!=='PRIMARY_LINK_REMOVED'||!date)return false;
    const versions=(registry.ruleVersions||[]).filter(v=>v.documentId===doc.id);
    const archived=versions.length?versions.every(v=>v.effectiveTo&&v.effectiveTo<date):doc.removedNonGoverningBaseline===true;
    if(!archived)return false;
    return documentScope(doc).filter(x=>ds.includes(x)).every(domain=>(registry.ruleVersions||[]).some(v=>{
      const current=registry.documents.find(d=>d.id===v.documentId);
      const covered=v.domain===domain||domain==='guarantor'&&doc.removedNonGoverningBaseline===true&&documentScope(doc).includes(v.domain)&&ds.includes(v.domain)&&/Loan|qualityOfLife|specialHousing|redeemMortgage/.test(v.domain);
      return covered&&v.status==='CURRENT'&&v.effectiveFrom<=date&&(!v.effectiveTo||date<=v.effectiveTo)&&v.review?.primaryVerified===true&&current?.status==='CURRENT'&&current.contentHash&&primary(current);
    }));
  }
  function pendingFor(registry,ds,date,text=''){return (registry.documents||[]).filter(d=>d.status==='PENDING'&&d.mayAffectRules===true&&documentScope(d,text).some(x=>ds.includes(x))&&(!d.effectiveDate||!date||d.effectiveDate<=date)&&!removedArchiveHasCurrentEvidence(registry,d,ds,date));}
  function gate(registry,text,{now=new Date(),personal=false}={}){
    const ds=queryDomains(text),time=asOf(text,now);
    if(personal||!ds.length||/^(?:เบอร์โทร|ติดต่อ|รายชื่อเจ้าหน้าที่)/.test(text))return {allowed:true,domains:ds,...time};
    if(time.date&&time.date>asOf('ตอนนี้',now).date)return {allowed:false,reason:'FUTURE_RULE_NOT_CONFIRMED',documents:[],domains:ds,...time};
    const pending=pendingFor(registry,ds,time.date,text);
    if(pending.length)return {allowed:false,reason:'PENDING_DOCUMENT',documents:pending,domains:ds,...time};
    const stale=(registry.monitors||[]).filter(m=>m.domains.some(x=>ds.includes(x))&&(!m.lastSuccessfulCheck||now-new Date(m.lastSuccessfulCheck)>(registry.policy.maxIndexAgeHours||72)*3600000||new Date(m.lastSuccessfulCheck)>now));
    if(stale.length)return {allowed:false,reason:'STALE_SOURCE',documents:[],sources:stale,domains:ds,...time};
    const oldBytes=(registry.documents||[]).filter(d=>d.status==='CURRENT'&&d.contentHash&&documentScope(d,text).some(x=>ds.includes(x))&&(!d.lastContentCheck||now-new Date(d.lastContentCheck)>(registry.policy.maxPrimaryAgeHours||336)*3600000));
    if(oldBytes.length)return {allowed:false,reason:'STALE_PRIMARY_DOCUMENT',documents:[],sources:oldBytes.map(d=>({url:d.officialIndexUrl})),domains:ds,...time};
    return {allowed:true,domains:ds,...time};
  }
  function lock(result,registry){
    const pending=result.documents?.[0],title=pending?.title||'แหล่งทางการ';
    const url=pending?.originalUrl||pending?.officialIndexUrl||result.sources?.[0]?.url||registry.monitors[0].url;
    const message=result.reason==='PENDING_DOCUMENT'?'พบเอกสารทางการที่อาจเปลี่ยนเงื่อนไขเรื่องนี้ กำลังยืนยันผลกระทบครับ จึงยังใช้ตัวเลขหรือเงื่อนไขเดิมฟันธงไม่ได้':'ยังยืนยันกฎที่มีผลในช่วงเวลาที่ถามไม่ได้ครับ กรุณาตรวจหลักเกณฑ์ทางการหรือให้เจ้าหน้าที่ตรวจฉบับที่ใช้กับกรณีนี้';
    return {intent:'freshness_evidence_lock',answer:message+' ต้องการตรวจประเภทคำขอและประเด็นใดครับ? ระบุเรื่องเพิ่มเติมเพื่อให้เจ้าหน้าที่ตรวจฉบับและข้อที่ตรงกรณี โดยไม่ส่งรหัสผ่าน OTP หรือ PIN',status:'ต้องยืนยันหลักฐาน',decision:'EVIDENCE_LOCK',evidenceState:result.reason,answerClass:'CURRENT_RULE',details:[title,'ตรวจวันที่มีผลและข้อที่แก้ไขก่อนประเมินสิทธิสมาชิก'],actions:[['ตรวจเอกสารต้นฉบับ',url],['ติดต่อเจ้าหน้าที่','https://www.dlasavingcoop.com/show.php?Category=contact'],...(pending?.officialIndexUrl&&pending.officialIndexUrl!==url?[['หน้าที่เผยแพร่ต้นฉบับ',pending.officialIndexUrl]]:[])],sources:[{title,url}],freshness:result};
  }
  // A monitor snapshot can only add locks/check timestamps; it cannot supply answer values or promote rules.
  function mergeMonitor(base,snapshot){
    if(snapshot.schemaVersion!==base.schemaVersion||!Array.isArray(snapshot.monitors)||!Array.isArray(snapshot.documents))throw Error('Invalid monitor snapshot');
    const next=clone(base);
    for(const m of next.monitors){const found=snapshot.monitors.find(x=>x.id===m.id&&canonical(x.url)===canonical(m.url));if(found&&found.lastSuccessfulCheck&&(!m.lastSuccessfulCheck||found.lastSuccessfulCheck>m.lastSuccessfulCheck)){m.lastSuccessfulCheck=found.lastSuccessfulCheck;m.lastError=found.lastError||null;}}
    for(const d of snapshot.documents){
      const reviewed=next.documents.find(x=>x.id===d.id);
      if(reviewed?.contentHash&&reviewed.contentHash===d.contentHash&&d.lastContentCheck&&(!reviewed.lastContentCheck||d.lastContentCheck>reviewed.lastContentCheck))reviewed.lastContentCheck=d.lastContentCheck;
      if(d.status!=='PENDING'||!d.mayAffectRules||!primary(d))continue;
      const known=next.documents.find(x=>x.id===d.id);
      // Human-reviewed form classification is bound to exact bytes and label.
      // New bytes or an unreviewed label must still lock for review.
      if(known?.metadataReview?.documentRole==='APPLICATION_FORM'&&known.metadataReview.primaryBytesVerified&&known.contentHash===d.contentHash&&known.metadataReview.reviewedLinkFingerprints.includes(d.fingerprint)&&d.pendingReason==='OFFICIAL_LINK_METADATA_CHANGED')continue;
      // A missing inventory-only link is not a new rule. Trust the reviewed baseline,
      // never a marker supplied by the asynchronous monitor itself.
      const baselineOnly=(base.nonGoverningBaselineDocumentIds||[]).includes(d.id)||known?.removedNonGoverningBaseline===true||known?.status==='PENDING'&&known.mayAffectRules===false&&known.pendingReason==='BASELINE_INVENTORY_NOT_RULE_PROMOTION';
      // Ignore resolved locks if the bundled reviewed document has the very same bytes/link fingerprint.
      if(known&&known.status!=='PENDING'&&known.contentHash===d.contentHash&&(known.fingerprint===d.fingerprint||known.metadataReview?.primaryBytesVerified&&known.metadataReview.reviewedLinkFingerprints.includes(d.fingerprint))&&d.pendingReason!=='PRIMARY_LINK_REMOVED')continue;
      if(known)Object.assign(known,{status:'PENDING',mayAffectRules:true,affects:all.filter(x=>(d.affects||[]).includes(x)),pendingReason:d.pendingReason,removedNonGoverningBaseline:baselineOnly});
      else next.documents.push({...d,affects:all.filter(x=>(d.affects||[]).includes(x)),removedNonGoverningBaseline:baselineOnly});
    }
    if(snapshot.lastSyncAt&&(!next.lastSyncAt||snapshot.lastSyncAt>next.lastSyncAt))next.lastSyncAt=snapshot.lastSyncAt;
    return next;
  }
  return {clone,all,officialPage,canonical,primary,domains,queryDomains,asOf,versionAt,pendingFor,gate,lock,mergeMonitor};
});
