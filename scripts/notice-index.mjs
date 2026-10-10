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
