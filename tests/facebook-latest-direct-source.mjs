import assert from 'node:assert/strict';
import {directFacebookPost,facebookTopicKey,normalizeGraphPosts,chooseLatestFacebookByTopic} from '../scripts/facebook-direct-source.mjs';

const scoreTitle=s=>/หุ้น/.test(s)?97:/ประชุมใหญ่/.test(s)?95:0;
const eventMeta=s=>/หุ้น/.test(s)?{status:'notice',statusLabel:'ประกาศใหม่',ask:'อัตราเงินได้รายเดือนและการถือหุ้น 2569'}:{status:'notice',statusLabel:'ประกาศใหม่',ask:'ประชุมใหญ่'};

assert.equal(directFacebookPost('https://www.facebook.com/dlasaving'),false);
assert.equal(directFacebookPost('https://www.facebook.com/share/p/abc123/'),true);
assert.equal(facebookTopicKey('ประกาศการถือหุ้น 2569'),'shares');

const posts=[
  {id:'1',message:'ประกาศการถือหุ้น 2569 ฉบับเดิม',created_time:'2026-10-06T01:00:00Z',permalink_url:'https://www.facebook.com/share/p/old123/'},
  {id:'2',message:'ประกาศการถือหุ้น 2569 ฉบับใหม่',created_time:'2026-10-07T01:00:00Z',permalink_url:'https://www.facebook.com/share/p/new123/'},
  {id:'3',message:'ประชุมใหญ่สามัญ 2569',created_time:'2026-10-07T00:00:00Z',permalink_url:'https://www.facebook.com/share/p/agm123/'},
  {id:'4',message:'ประกาศหุ้นที่ไม่มี permalink',created_time:'2026-10-07T01:30:00Z'}
];
const normalized=normalizeGraphPosts(posts,{now:new Date('2026-10-07T02:00:00Z'),scoreTitle,eventMeta});
assert.equal(normalized.length,3);
assert.ok(normalized.every(x=>x.sourceState==='DIRECT_VERIFIED'));
assert.ok(normalized.every(x=>x.directSourceVerification==='GRAPH_API_PAGE_POST'));

const seed=[{
  id:'seed',topicKey:'shares',title:'การถือหุ้น 2569',publishedAt:'2026-10-06T00:00:00Z',
  directSourceUrl:'https://www.facebook.com/share/p/seed123/',source:'official-facebook'
}];
const latest=chooseLatestFacebookByTopic([...seed,...normalized]);
const share=latest.find(x=>x.topicKey==='shares');
assert.ok(share);
assert.equal(share.directSourceUrl,'https://www.facebook.com/share/p/new123/');
assert.equal(latest.filter(x=>x.topicKey==='shares').length,1);
assert.ok(latest.some(x=>x.topicKey==='agm'));

console.log('FACEBOOK LATEST DIRECT SOURCE: newest verified permalink replaces older topic card PASS');
