import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=path.resolve(new URL('../',import.meta.url).pathname),expected=fs.readFileSync(path.join(root,'index.html'));
const base=process.env.MEMBER_APP_URL||'https://sayampreecha-ux.github.io/dlasavingcoop-member-assistant/';
let actual,checkedURL,attempts=0;
for(;attempts<7;attempts++){
 checkedURL=new URL('?release='+encodeURIComponent(process.env.GITHUB_SHA||'manual')+'&attempt='+attempts,base).href;
 const r=await fetch(checkedURL,{cache:'no-store'});assert.ok(r.ok,'Production HTTP '+r.status);
 actual=Buffer.from(await r.arrayBuffer());
 if(actual.equals(expected))break;
 if(attempts<6)await new Promise(r=>setTimeout(r,5000));
}
assert.ok(actual?.equals(expected),'Production index bytes differ from reviewed checkout; no acceptance allowed');
const blob=createHash('sha1').update(Buffer.from(`blob ${actual.length}\0`)).update(actual).digest('hex');
const out=path.join(root,'production-runtime-evidence');fs.mkdirSync(out,{recursive:true});
const evidence={productionURL:base,verifiedAt:new Date().toISOString(),deploymentSHA:process.env.GITHUB_SHA||null,indexBlobSHA:blob,bytes:actual.length,attempts:attempts+1,exactReviewedIndexMatch:true};
fs.writeFileSync(path.join(out,'runtime.json'),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence));
