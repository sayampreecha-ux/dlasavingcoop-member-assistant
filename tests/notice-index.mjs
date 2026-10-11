import assert from 'node:assert/strict';
import {findNotices,officialDirectUrl} from '../scripts/notice-index.mjs';
assert.equal(officialDirectUrl('https://evil.example/show.php?No=12'),null);
assert.equal(officialDirectUrl('https://www.dlasavingcoop.com/list.php?Category=notice'),null);
const good={contentKind:'NEWS',rulePromotion:false,title:'ประกาศผลอนุมัติเงินกู้',summary:'',directSourceUrl:'https://www.dlasavingcoop.com/show.php?No=123',sourceState:'DIRECT_VERIFIED'};
assert.equal(findNotices([good],'loan').length,1);
assert.equal(findNotices([{...good,sourceState:'DIRECT_SOURCE_PENDING'}],'loan').length,0);
assert.equal(findNotices([{...good,expiresAt:'2020-01-01T00:00:00Z'}],'loan').length,0);
assert.equal(findNotices([good],'funeral').length,0);
console.log('Notice index checks passed');

import {searchOfficialSourceRegistry,officialSourceUrl} from '../scripts/notice-index.mjs';
assert.equal(officialSourceUrl('https://evil.example/list.php?Category=notice'),null);
assert.ok(officialSourceUrl('https://www.dlasavingcoop.com/show.php?Category=procedure'));
const registry={monitors:[
 {id:'ordinary',url:'https://www.dlasavingcoop.com/show.php?No=774',domains:['ordinaryLoan'],lastSuccessfulCheck:'2026-10-09'},
 {id:'notices',url:'https://www.dlasavingcoop.com/list.php?Category=notice',domains:['ordinaryLoan'],lastSuccessfulCheck:'2026-10-09'},
 {id:'evil',url:'https://evil.example/show.php?No=9',domains:['ordinaryLoan']}
]};
assert.equal(searchOfficialSourceRegistry(registry,'กู้เพื่อการพักผ่อน').length,2);
assert.equal(searchOfficialSourceRegistry(registry,'เงินกู้เคหะ').length,2);
assert.equal(searchOfficialSourceRegistry(registry,'').length,0);
assert.equal(searchOfficialSourceRegistry(registry,'กู้')[0].effectiveRuleVerified,false);
console.log('Official source discovery checks passed');
