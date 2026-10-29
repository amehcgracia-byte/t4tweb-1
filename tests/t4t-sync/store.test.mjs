import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createPublicationStore} from '../../lib/t4t-sync/store.mjs';
import {createSanityAdapter} from '../../lib/t4t-sync/sanity-adapter.mjs';

const now=()=>new Date('2026-10-29T18:00:00Z');
const event={flyerAttached:true,flyerAssetId:'image-test',artist:'Tales for the Tillerman',venue:'ART Stalker',address:'Kaiser-Friedrich-Str. 67, 10627 Berlin',city:'Berlin',country:'Germany',date:'2026-11-13',time:'19:30',timezone:'Europe/Berlin',price:15,currency:'EUR',eventUrl:'https://www.facebook.com/events/1144183394632015/',flyerSourceUrl:'https://www.facebook.com/photo/?fbid=10215891639800110'};
function memoryClient(initial=[]) {
  const data=new Map();let revision=0;
  const save=doc=>{const value={...structuredClone(doc),_rev:String(++revision)};data.set(value._id,value);return structuredClone(value);};
  initial.forEach(save);
  return {
    data, getDocument:async id=>structuredClone(data.get(id)),
    createIfNotExists:async doc=>data.has(doc._id)?structuredClone(data.get(doc._id)):save(doc),
    fetch:async(query,params)=>{
      if(query.includes('concertSyncJob')) return [...data.values()].find(doc=>doc._type==='concertSyncJob'&&doc.concertId===params.id&&doc.platform===params.platform&&doc.externalId)??null;
      return structuredClone([...data.values()].filter(doc=>doc._type==='concert'&&(doc._id===params.id||doc._id===params.draft||doc.eventUrl===params.url||doc.date===params.date)));
    },
    patch(id){let guard,values={},removed=[];const builder={
      ifRevisionId(value){guard=value;return builder;},set(value){values=value;return builder;},unset(value){removed=value;return builder;},
      async commit(){const old=data.get(id);if(!old||old._rev!==guard)throw new Error('revision_conflict');const updated={...old,...values};removed.forEach(key=>delete updated[key]);return save(updated);},
    };return builder;},
  };
}
const published=()=>({...event,_id:'canonical',_type:'concert',editorId:16,genre:'Funk Soul',image:{asset:{_ref:'image-test'}},legacyField:'preserve me'});

test('repeated enqueue creates exactly one durable job per platform',async()=>{
  const client=memoryClient([published()]);const store=createPublicationStore(client,{now});
  await Promise.all([store.enqueue('canonical'),store.enqueue('canonical')]);
  assert.equal([...client.data.values()].filter(doc=>doc._type==='concertSyncJob').length,2);
});
test('concurrent workers cannot both claim the same job',async()=>{
  const client=memoryClient([published()]);const store=createPublicationStore(client,{now});
  const [job]=await store.enqueue('canonical');
  const results=await Promise.allSettled([store.claim(job._id,'one'),store.claim(job._id,'two')]);
  assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
});
test('changed canonical content cannot be verified by an old job',async()=>{
  const client=memoryClient([published()]);const store=createPublicationStore(client,{now});
  const [job]=await store.enqueue('canonical');const lease=await store.claim(job._id,'worker');
  client.data.get('canonical').price=20;
  await assert.rejects(store.finish(job._id,lease.leaseId,{observedAt:now().toISOString(),listingComplete:true,records:[{...event,id:'bit-id'}]}),/source_changed/);
});
test('a fresh exact external readback persists the actual external ID',async()=>{
  const client=memoryClient([published()]);const store=createPublicationStore(client,{now});
  const [job]=await store.enqueue('canonical');const lease=await store.claim(job._id,'worker');
  const done=await store.finish(job._id,lease.leaseId,{observedAt:now().toISOString(),listingComplete:true,records:[{...event,id:'109096773'}]});
  assert.equal(done.status,'verified');assert.equal(done.externalId,'109096773');assert.equal(done.leaseId,undefined);
});
test('wrong price cannot be recorded as a successful publication',async()=>{
  const client=memoryClient([published()]);const store=createPublicationStore(client,{now});
  const [job]=await store.enqueue('canonical');const lease=await store.claim(job._id,'worker');
  const done=await store.finish(job._id,lease.leaseId,{observedAt:now().toISOString(),listingComplete:true,records:[{...event,id:'bit-id',price:20}]});
  assert.equal(done.status,'blocked');
});
test('ambiguous write timeout is blocked, not automatically retried',async()=>{
  const client=memoryClient([published()]);const store=createPublicationStore(client,{now});
  const [job]=await store.enqueue('canonical');const lease=await store.claim(job._id,'worker');
  const done=await store.fail(job._id,lease.leaseId,'write_outcome_unknown');
  assert.equal(done.status,'blocked');await assert.rejects(store.claim(job._id,'worker'),/not_claimable/);
});
test('a failure known to precede writes backs off before retry',async()=>{
  const client=memoryClient([published()]);let clock=now();const store=createPublicationStore(client,{now:()=>clock});
  const [job]=await store.enqueue('canonical');const lease=await store.claim(job._id,'worker');
  const failed=await store.fail(job._id,lease.leaseId,'temporary_failure');
  assert.equal(failed.status,'failed');await assert.rejects(store.claim(job._id,'worker'),/retry_not_due/);
  clock=new Date(clock.getTime()+121000);assert.equal((await store.claim(job._id,'worker')).attempts,2);
});
test('concurrent creation and a repeated request reserve one canonical concert',async()=>{
  const client=memoryClient();const adapter=createSanityAdapter(client,{now});
  const ids=await Promise.all([adapter.create(event),adapter.create(event)]);
  assert.equal(ids[0].id,ids[1].id);
  assert.equal([...client.data.values()].filter(doc=>doc._type==='concert').length,1);
});
test('updates retain editorId, genre, and unrelated original data',async()=>{
  const client=memoryClient([published()]);const adapter=createSanityAdapter(client,{now});
  await adapter.update({...event,time:'20:00'},'canonical');
  const updated=await client.getDocument('canonical');
  assert.equal(updated.editorId,16);assert.equal(updated.genre,'Funk Soul');assert.equal(updated.legacyField,'preserve me');assert.equal(updated.time,'20:00');
});
test('existing unpublished changes block automatic publishing',async()=>{
  const client=memoryClient([published(),{...published(),_id:'drafts.canonical'}]);const adapter=createSanityAdapter(client,{now});
  await assert.rejects(adapter.update(event,'canonical'),/existing_draft/);
});
