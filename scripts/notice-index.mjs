// Zero-token official notice index. No AI calls, no personal member lookup.
export const NOTICE_TOPICS = Object.freeze({
  loan: /เงินกู้|อนุมัติ.*กู้|กู้.*อนุมัติ/,
  welfare: /สวัสดิการ|ช่วยเหลือ|ภัยพิบัติ|น้ำท่วม|ไฟไหม้/,
  membership: /สมัครสมาชิก|รับสมาชิก|สมาชิกใหม่/,
  funeral: /ฌาปนกิจ|สงเคราะห์ศพ|เสียชีวิต/
});
const OFFICIAL = /^(www\.)?dlasavingcoop\.com$/i;
export function officialDirectUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && OFFICIAL.test(url.hostname)
      && /\/show\.php$/i.test(url.pathname) && /^\d+$/.test(url.searchParams.get('No') || '')
      ? url.href : null;
  } catch { return null; }
}
export function indexNotices(events = [], now = Date.now()) {
  return events.filter(event => {
    if (!event || event.contentKind !== 'NEWS' || event.rulePromotion !== false) return false;
    if (!officialDirectUrl(event.directSourceUrl)) return false;
    if (event.sourceState !== 'DIRECT_VERIFIED') return false;
    if (event.expiresAt && Date.parse(event.expiresAt) < now) return false;
    return true;
  }).map(event => ({
    title: String(event.title || '').slice(0, 240),
    summary: String(event.summary || '').slice(0, 400),
    url: officialDirectUrl(event.directSourceUrl),
    publishedAt: event.publishedAt || null,
    topics: Object.entries(NOTICE_TOPICS).filter(([, pattern]) =>
      pattern.test([event.title,event.summary,event.ask].join(' '))).map(([key]) => key)
  }));
}
export function findNotices(events, topic, now = Date.now()) {
  if (!Object.hasOwn(NOTICE_TOPICS, topic)) return [];
  return indexNotices(events, now).filter(item => item.topics.includes(topic));
}


// Search the verified official-source registry as well as the NEWS feed.
// Registry entries are discovery links, not proof that every clause is current.
const SOURCE_ALIASES = Object.freeze({
  loan: /เงินกู้|กู้|พักผ่อน|ท่องเที่ยว|เคหะ|จำนอง|ฉุกเฉิน|สามัญ|loan/i,
  welfare: /สวัสดิการ|ภัยพิบัติ|น้ำท่วม|ไฟไหม้|welfare/i,
  membership: /สมัครสมาชิก|สมาชิก|membership/i,
  funeral: /ฌาปนกิจ|สงเคราะห์ศพ|funeral/i,
  shares: /หุ้น|ถือหุ้น|shares/i,
  deposits: /ฝาก|ถอน|เงินฝาก|deposits/i
});
const SOURCE_DOMAINS = Object.freeze({
  loan: /loan|mortgage|housing|guarantor/i,
  welfare: /welfare|disaster/i,
  membership: /membership|resignation/i,
  funeral: /funeral|welfare/i,
  shares: /shares/i,
  deposits: /deposits|interest/i
});
export function searchOfficialSourceRegistry(registry, query) {
  const input = String(query || '').trim();
  if (!input || !registry || !Array.isArray(registry.monitors)) return [];
  const topic = Object.keys(SOURCE_ALIASES).find(key => SOURCE_ALIASES[key].test(input));
  if (!topic) return [];
  const domainPattern = SOURCE_DOMAINS[topic];
  const results = [];
  const seen = new Set();
  for (const monitor of registry.monitors) {
    if (!Array.isArray(monitor.domains) || !monitor.domains.some(d => domainPattern.test(d))) continue;
    const url = officialSourceUrl(monitor.url);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    results.push({
      title: monitor.id || 'แหล่งเอกสารทางการ',
      url,
      topic,
      sourceState: monitor.lastSuccessfulCheck && !monitor.lastError ? 'INDEXED_SOURCE' : 'CHECK_REQUIRED',
      effectiveRuleVerified: false
    });
  }
  return results;
}
export function officialSourceUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !OFFICIAL.test(url.hostname)) return null;
    if (/^\\/(?:show|list)\\.php$/i.test(url.pathname) &&
      ((url.pathname.toLowerCase() === '/show.php' && (/^\\d+$/.test(url.searchParams.get('No') || '') || /^[a-z]+$/i.test(url.searchParams.get('Category') || ''))) ||
      (url.pathname.toLowerCase() === '/list.php' && /^[a-z]+$/i.test(url.searchParams.get('Category') || '')))) return url.href;
    return null;
  } catch { return null; }
}
