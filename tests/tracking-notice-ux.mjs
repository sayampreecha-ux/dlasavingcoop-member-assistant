import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert.match(html,/if\(\/\^\(\?:ติดตาม\|ผลอนุมัติ/);
assert.match(html,/fetch\('\.\/data\/current-events\.json',\{cache:'default'\}\)/);
assert.doesNotMatch(html,/กำลังตรวจประกาศทางการสำหรับ/);
console.log('Tracking notice UX static checks passed');
