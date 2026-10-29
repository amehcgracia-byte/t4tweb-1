import {createHash, randomUUID} from 'node:crypto';
import {fingerprint, planPlatform, validateConcert} from './engine.mjs';

const providers = ['bandsintown', 'songkick'];
const jobId = (id, platform, hash) => `t4t-sync-${createHash('sha256').update(`${id}:${platform}:${hash}`).digest('hex')}`;
const publicId = id => String(id).replace(/^drafts\./, '');
const leaseMs = 10 * 60 * 1000;

// The client is injected so the same code can use Sanity's existing credentials
// on Vercel and can be tested without credentials or production writes.
export function createPublicationStore(client, {now = () => new Date()} = {}) {
  async function loadConcert(id) {
    const doc = await client.getDocument(publicId(id));
    if (!doc || doc._type !== 'concert') throw new Error('concert_not_found');
    const concert = {
      artist: 'Tales for the Tillerman', venue: doc.venue, venueAliases: doc.venueAliases ?? [],
      city: doc.city, country: doc.country, date: doc.date, time: doc.time,
      timezone: doc.timezone || 'Europe/Berlin', price: doc.price, currency: doc.currency || 'EUR',
      eventUrl: doc.eventUrl, flyerSourceUrl: doc.flyerSourceUrl,
      flyerAssetId: doc.image?.asset?._ref, flyerAttached: Boolean(doc.image?.asset?._ref), address: doc.address,
      platformIds: doc.externalIds ?? {},
    };
    validateConcert(concert);
    return {doc, concert};
  }

  async function enqueue(id) {
    // Only published concert documents enter the queue. Webhook updates to job
    // metadata cannot enqueue themselves. A content fingerprint absorbs repeats.
    if (String(id).startsWith('drafts.')) throw new Error('published_concert_required');
    const {doc, concert} = await loadConcert(id);
    const hash = fingerprint(concert);
    const results = [];
    for (const platform of providers) {
      const previous = await client.fetch('*[_type == "concertSyncJob" && concertId == $id && platform == $platform && defined(externalId)] | order(_updatedAt desc)[0]{externalId}', {id: doc._id, platform});
      const payload = {...concert, platformIds: {...concert.platformIds, ...(previous?.externalId ? {[platform]: previous.externalId} : {})}};
      const job = await client.createIfNotExists({
        _id: jobId(doc._id, platform, hash), _type: 'concertSyncJob', concertId: doc._id,
        platform, fingerprint: hash, payload: JSON.stringify(payload),
        status: 'pending', attempts: 0, nextAttemptAt: now().toISOString(),
        ...(payload.platformIds[platform] ? {externalId: payload.platformIds[platform]} : {}),
      });
      results.push(job);
    }
    return results;
  }

  async function claim(id, worker) {
    const job = await client.getDocument(id);
    if (!job || job._type !== 'concertSyncJob') throw new Error('job_not_found');
    if (!['pending', 'failed'].includes(job.status)) throw new Error('job_not_claimable');
    if (job.attempts >= 5 || Date.parse(job.nextAttemptAt) > now().getTime()) throw new Error('retry_not_due');
    const {concert} = await loadConcert(job.concertId);
    if (fingerprint(concert) !== job.fingerprint) throw new Error('source_changed_enqueue_again');
    return client.patch(id).ifRevisionId(job._rev).set({
      status: 'running', worker, leaseId: randomUUID(),
      leaseExpiresAt: new Date(now().getTime() + leaseMs).toISOString(),
      attempts: job.attempts + 1,
    }).commit();
  }

  async function finish(id, leaseId, observation) {
    const job = await client.getDocument(id);
    if (!job || job._type !== 'concertSyncJob' || job.status !== 'running' || job.leaseId !== leaseId) throw new Error('invalid_lease');
    if (Date.parse(job.leaseExpiresAt) < now().getTime()) throw new Error('lease_expired_inspect_before_retry');
    const desired = JSON.parse(job.payload);
    // An external ID is accepted only from the fresh readback, not from a
    // button click, predicted URL, or an HTTP success response alone.
    const plan = planPlatform(desired, observation, job.platform);
    const checked = Date.parse(observation?.observedAt);
    if (!Number.isFinite(checked) || checked > now().getTime() + 30000 || checked < now().getTime() - leaseMs) throw new Error('fresh_readback_required');
    const {concert} = await loadConcert(job.concertId);
    if (fingerprint(concert) !== job.fingerprint) throw new Error('source_changed_enqueue_again');
    const verified = plan.action === 'unchanged';
    return client.patch(id).ifRevisionId(job._rev).set({
      status: verified ? 'verified' : 'blocked', checkedAt: observation.observedAt,
      reason: verified ? '' : 'readback_mismatch',
      ...(plan.id ? {externalId: plan.id} : {}),
    }).unset(['leaseId', 'worker', 'leaseExpiresAt']).commit();
  }

  async function fail(id, leaseId, reason) {
    if (!['login_required', 'artist_not_linked', 'temporary_failure', 'write_outcome_unknown', 'data_conflict'].includes(reason)) throw new Error('invalid_reason');
    const job = await client.getDocument(id);
    if (!job || job._type !== 'concertSyncJob' || job.status !== 'running' || job.leaseId !== leaseId) throw new Error('invalid_lease');
    // Only errors known to precede an external write are safe to retry.
    // Timeouts during writes remain blocked until a new inspection resolves them.
    return client.patch(id).ifRevisionId(job._rev).set({
      status: reason === 'temporary_failure' && job.attempts < 5 ? 'failed' : 'blocked', reason,
      nextAttemptAt: new Date(now().getTime() + Math.min(3600000, 60000 * 2 ** job.attempts)).toISOString(),
    }).unset(['leaseId', 'worker', 'leaseExpiresAt']).commit();
  }

  async function list(id) {
    return client.fetch('*[_type == "concertSyncJob" && (!defined($id) || concertId == $id)] | order(_updatedAt desc)[0...100]{_id,_rev,concertId,platform,status,attempts,nextAttemptAt,externalId,checkedAt,reason,leaseExpiresAt,fingerprint}', {id: id || null});
  }
  return {loadConcert, enqueue, claim, finish, fail, list};
}
