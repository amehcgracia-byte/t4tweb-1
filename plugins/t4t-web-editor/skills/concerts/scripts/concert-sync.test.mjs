import {test} from 'node:test';
import assert from 'node:assert/strict';
import {changesFor, findMatch, planConcert, syncConcert, validateConcert} from './concert-sync.mjs';

const event = {flyerAttached:true,artist:'Tales for the Tillerman',venue:'ART Stalker',venueAliases:['ART Stalker - Kunst + Bar + Events'],address:'Kaiser-Friedrich-Str. 67, 10627 Berlin',city:'Berlin',country:'Germany',date:'2026-11-13',time:'19:30',timezone:'Europe/Berlin',price:15,currency:'EUR',eventUrl:'https://www.facebook.com/events/1144183394632015/',flyerSourceUrl:'https://www.facebook.com/photo/?fbid=10215891639800110'};
const snapshot = records => ({observedAt:'2026-10-29T13:00:00Z', listingComplete:true, records});
const record = {...event,id:'existing'};

test('reuses a stable ID when the date or venue changes', () => {
  const desired = {...event, date:'2026-11-14',platformIds:{sanity:'existing'}};
  assert.equal(findMatch(desired,[record],'sanity').record.id,'existing');
});
test('matches accents and verified venue aliases without fuzzy guessing', () => {
  assert.equal(findMatch(event,[{...record,city:'Berlín',venue:event.venueAliases[0]}],'bandsintown').record.id,'existing');
  assert.equal(findMatch(event,[{...record,eventUrl:null,venue:'Another venue'}],'bandsintown').record,undefined);
});
test('two same-day candidates block writes rather than duplicate or merge', () => {
  assert.ok(findMatch(event,[record,{...record,id:'second'}],'songkick').conflict);
});
test('draft and published versions count as one event', () => {
  assert.equal(findMatch(event,[record,{...record,id:'drafts.existing'}],'sanity').record.id,'drafts.existing');
});
test('missing linked event or incomplete search never turns into create', () => {
  assert.equal(planConcert({...event,platformIds:{sanity:'lost'}},{sanity:snapshot([])}).platforms[0].action,'blocked');
  assert.equal(planConcert(event,{songkick:{observedAt:'2026-10-29T13:00:00Z',records:[]}}).platforms[2].action,'blocked');
});
test('missing flyer and source link are detected even when schedule agrees', () => {
  assert.deepEqual(changesFor(event,{...record,eventUrl:undefined,flyerSourceUrl:undefined}),['eventUrl','flyerSourceUrl']);
});
test('rejects impossible dates, unknown price and invalid time zones', () => {
  for (const patch of [{date:'2026-02-30'},{price:null},{time:'25:00'},{timezone:'Berlin'}]) assert.throws(()=>validateConcert({...event,...patch}));
});
test('dry run does not invoke any writes', async () => {
  let writes = 0;
  const adapter = {inspect:async()=>snapshot([]),create:async()=>{writes++; return {id:'new'};}};
  const result = await syncConcert(event,{sanity:adapter,bandsintown:adapter,songkick:adapter});
  assert.equal(writes,0);
  assert.ok(result.results.every(item=>item.status==='awaiting_approval'));
});
test('partial failure preserves successful IDs and repeated run creates nothing', async () => {
  let writes = 0; const rows=[];
  const adapter = {inspect:async()=>snapshot(rows),create:async value=>{writes++;rows.push({...value,id:'created'});return {id:'created'};}};
  const blocked = {inspect:async()=>({blocked:'Artist not linked'})};
  const first = await syncConcert(event,{sanity:adapter,bandsintown:adapter,songkick:blocked},{approved:true});
  assert.equal(first.results[0].status,'verified');
  assert.equal(first.results[2].status,'blocked');
  await syncConcert(event,{sanity:adapter,bandsintown:adapter,songkick:blocked},{approved:true});
  assert.equal(writes,1);
});
test('a successful click without a matching readback never reports published', async () => {
  const adapter={inspect:async()=>snapshot([]),create:async()=>({id:'provider-id'})};
  const result=await syncConcert(event,{sanity:adapter},{approved:true});
  assert.equal(result.results[0].status,'verification_failed');
});
test('unknown write outcome is reported and is not retried automatically', async () => {
  let writes=0;
  const adapter={inspect:async()=>snapshot([]),create:async()=>{writes++;throw new Error('timeout');}};
  const result=await syncConcert(event,{sanity:adapter},{approved:true});
  assert.equal(writes,1);
  assert.match(result.results[0].reason,/outcome unknown/);
});
