import {createHash, randomUUID} from 'node:crypto';
import {findMatch, validateConcert} from './engine.mjs';

const keyPart = value => String(value).normalize('NFKD').replace(/\p{M}/gu,'').trim().toLowerCase();
const fields = concert => ({
  venue:concert.venue, city:concert.city, country:concert.country, date:concert.date,
  time:concert.time, timezone:concert.timezone, price:concert.price, currency:concert.currency,
  eventUrl:concert.eventUrl, flyerSourceUrl:concert.flyerSourceUrl,
  ...(concert.address ? {address:concert.address} : {}),
  ...(concert.flyerAssetId ? {image:{_type:'image',asset:{_type:'reference',_ref:concert.flyerAssetId}}} : {}),
});

export function createSanityAdapter(client, {now=()=>new Date()}={}) {
  async function inspect(concert) {
    const known = concert.platformIds?.sanity || null;
    const docs = await client.fetch('*[_type == "concert" && (_id == $id || _id == $draft || eventUrl == $url || date == $date)]{_id,_rev,venue,address,city,country,date,time,timezone,price,currency,eventUrl,flyerSourceUrl,image}',
      {id:known,draft:known ? `drafts.${known}` : null,url:concert.eventUrl,date:concert.date}, {perspective:'raw'});
    return {observedAt:now().toISOString(),listingComplete:true,records:docs.map(doc=>({
      ...doc,id:doc._id,flyerAttached:Boolean(doc.image?.asset?._ref),artist:'Tales for the Tillerman',timezone:doc.timezone||'Europe/Berlin',currency:doc.currency||'EUR',
    }))};
  }
  async function create(concert) {
    validateConcert(concert);
    if (!concert.flyerAssetId) throw new Error('sanity_flyer_asset_required');
    const before = await inspect(concert);
    const match = findMatch(concert,before.records,'sanity');
    if (match.conflict) throw new Error(match.conflict);
    if (match.record) return update(concert,match.record.id);
    const identity = [concert.artist,concert.date,concert.venue,concert.city].map(keyPart).join('|');
    const identityId=`t4t-identity-${createHash('sha256').update(identity).digest('hex')}`;
    // A stable identity reservation contains a randomly assigned document ID.
    // Concurrent requests and retries converge on that same reservation.
    const reservation=await client.createIfNotExists({_id:identityId,_type:'concertIdentity',concertId:randomUUID()});
    const doc=await client.createIfNotExists({_id:reservation.concertId,_type:'concert',status:'Upcoming',...fields(concert)});
    return {id:doc._id};
  }
  async function update(concert,id) {
    validateConcert(concert);
    if (!concert.flyerAssetId) throw new Error('sanity_flyer_asset_required');
    const canonical=String(id).replace(/^drafts\./,'');
    // Never publish someone else's unpublished changes as a side effect.
    if (await client.getDocument(`drafts.${canonical}`)) throw new Error('existing_draft_requires_review');
    const original=await client.getDocument(canonical);
    if (!original || original._type!=='concert') throw new Error('concert_not_found');
    const doc=await client.patch(canonical).ifRevisionId(original._rev).set(fields(concert)).commit();
    return {id:doc._id};
  }
  return {inspect,create,update};
}
