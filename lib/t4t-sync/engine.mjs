import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

export const platforms = ['sanity', 'bandsintown', 'songkick'];
const contentFields = ['artist', 'venue', 'address', 'city', 'country', 'date', 'time', 'timezone', 'price', 'currency', 'eventUrl', 'flyerSourceUrl', 'flyerAttached'];
const norm = value => String(value ?? '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const canonicalId = value => String(value).replace(/^drafts\./, '');

export function validateConcert(concert) {
  for (const field of contentFields) {
    if (concert[field] === undefined || concert[field] === null || concert[field] === '') throw new Error(`Missing ${field}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(concert.date) || new Date(`${concert.date}T12:00:00Z`).toISOString().slice(0, 10) !== concert.date) throw new Error('Invalid date');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(concert.time)) throw new Error('Invalid time');
  new Intl.DateTimeFormat('en', {timeZone: concert.timezone});
  if (typeof concert.price !== 'number' || !Number.isFinite(concert.price) || concert.price < 0) throw new Error('Invalid price');
  for (const field of ['eventUrl', 'flyerSourceUrl']) if (new URL(concert[field]).protocol !== 'https:') throw new Error(`Invalid ${field}`);
  if (concert.flyerAttached !== true) throw new Error('Verified flyer asset required');
  if (concert.currency !== 'EUR') throw new Error('Only EUR has been configured');
  return concert;
}

export function fingerprint(concert) {
  validateConcert(concert);
  return createHash('sha256').update(JSON.stringify({...Object.fromEntries(contentFields.map(field => [field, concert[field]])), flyerAssetId: concert.flyerAssetId ?? null})).digest('hex');
}

function venueMatches(concert, record) {
  const names = [concert.venue, ...(concert.venueAliases ?? [])].map(norm);
  return names.includes(norm(record.venue));
}

// IDs survive reschedules. Source URLs survive corrections to venue names.
// Natural keys are only a fallback, and never silently merge two shows.
export function findMatch(concert, records, platform) {
  const knownId = concert.platformIds?.[platform];
  const candidates = knownId
    ? records.filter(record => canonicalId(record.id) === canonicalId(knownId))
    : records.filter(record =>
        (record.eventUrl && record.eventUrl === concert.eventUrl && norm(record.artist) === norm(concert.artist)) ||
        (record.date === concert.date && norm(record.artist) === norm(concert.artist) && venueMatches(concert, record) && norm(record.city) === norm(concert.city)));
  const ids = new Set(candidates.map(record => canonicalId(record.id)));
  if (ids.size > 1) return {conflict: 'Multiple matching events; select the correct ID before writing'};
  // Treat a draft + its published document as one event, preferring the draft.
  const record = candidates.find(item => String(item.id).startsWith('drafts.')) ?? candidates[0];
  if (knownId && !record) return {conflict: 'Previously linked event is missing; investigate instead of recreating it'};
  return {record};
}

export function changesFor(concert, record) {
  const fields = contentFields.filter(field => {
    if (field === 'venue') return !venueMatches(concert, record);
    if (['artist', 'city', 'country'].includes(field)) return norm(concert[field]) !== norm(record[field]);
    return concert[field] !== record[field];
  });
  return fields;
}

export function planPlatform(concert, observation, platform) {
  if (!observation || observation.blocked) return {platform, action: 'blocked', reason: observation?.blocked ?? 'No authenticated observation'};
  if (!observation.observedAt || !Number.isFinite(Date.parse(observation.observedAt))) return {platform, action: 'blocked', reason: 'Missing observation timestamp'};
  const match = findMatch(concert, observation.records ?? [], platform);
  if (match.conflict) return {platform, action: 'blocked', reason: match.conflict};
  if (!match.record) {
    if (observation.listingComplete !== true) return {platform, action: 'blocked', reason: 'Incomplete event search; cannot safely create'};
    return {platform, action: 'create'};
  }
  const fields = changesFor(concert, match.record);
  return {platform, id: match.record.id, action: fields.length ? 'update' : 'unchanged', fields};
}

export function planConcert(concert, observations) {
  validateConcert(concert);
  return {fingerprint: fingerprint(concert), platforms: platforms.map(platform => planPlatform(concert, observations[platform], platform))};
}

// Real adapters must inspect a connected tool or authenticated browser, not
// manufacture write APIs. Writes are disabled unless the caller supplies approval.
// Every write is followed by a fresh read; a partial failure never rolls back
// successful publications or retries a potentially successful create blindly.
export async function syncConcert(concert, adapters, {approved = false, recordResult = async () => {}} = {}) {
  validateConcert(concert);
  const results = [];
  for (const platform of platforms) {
    let result;
    const adapter = adapters[platform];
    try {
      if (!adapter) throw new Error('No connected adapter');
      const before = await adapter.inspect(concert);
      const plan = planPlatform(concert, before, platform);
      if (plan.action === 'blocked') result = {...plan, status: 'blocked'};
      else if (plan.action === 'unchanged') result = {...plan, status: 'verified', observedAt: before.observedAt};
      else if (!approved) result = {...plan, status: 'awaiting_approval'};
      else {
        // The adapter returns a provider-observed ID, never a predicted ID.
        let written;
        try { written = await adapter[plan.action](concert, plan.id); }
        catch { throw new Error('Write outcome unknown; inspect this platform before retrying'); }
        if (!written?.id) throw new Error('Write outcome unknown: provider did not return an event ID');
        const linked = {...concert, platformIds: {...concert.platformIds, [platform]: written.id}};
        const after = await adapter.inspect(linked);
        const verification = planPlatform(linked, after, platform);
        if (verification.action !== 'unchanged') result = {...plan, id: written.id, status: 'verification_failed', reason: verification.reason ?? `Still differs: ${(verification.fields ?? []).join(', ')}`};
        else result = {...plan, id: written.id, status: 'verified', observedAt: after.observedAt};
      }
    } catch (error) { result = {platform, status: 'blocked', reason: error.message}; }
    const entry = {...result, fingerprint: fingerprint(concert)};
    results.push(entry);
    // Persistence failure must also be visible; never hide an external success.
    try { await recordResult(entry); }
    catch { entry.recordingError = 'Could not persist this result; preserve the returned ID before retrying'; }
  }
  return {fingerprint: fingerprint(concert), results};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, concertFile, observationsFile] = process.argv.slice(2);
  if (command !== 'plan' || !concertFile || !observationsFile) throw new Error('Usage: node concert-sync.mjs plan concert.json observations.json');
  const concert = JSON.parse(await readFile(concertFile, 'utf8'));
  const observations = JSON.parse(await readFile(observationsFile, 'utf8'));
  console.log(JSON.stringify(planConcert(concert, observations), null, 2));
}
