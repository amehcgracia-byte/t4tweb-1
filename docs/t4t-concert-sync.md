# T4T WEB EDITOR — implementation and activation

## What is implemented

- `lib/t4t-sync/engine.mjs`: validation, identity matching, change detection, isolated platform outcomes and post-write verification. No external publishing APIs are assumed.
- `lib/t4t-sync/sanity-adapter.mjs`: reads/writes canonical Sanity concerts with revision guards, preserving other fields. Concurrent creates reserve one random document ID through a singleton identity record. Existing drafts block unattended publication.
- `lib/t4t-sync/store.mjs`: durable per-platform jobs in Sanity, content fingerprints, CAS worker leases, external IDs, bounded exponential retry for failures known to precede writes, and blocked states for unknown write outcomes. Job metadata cannot trigger concert webhooks.
- `/api/t4t-sync`: authenticated queue interface, fail-closed without a strong `T4T_SYNC_SECRET`; server-side Sanity token reused from Vercel. No secrets are bundled in the plugin or client-side code.
- Additive Sanity schemas for event source, flyer source, external IDs, identity records and jobs. `editorId` is preserved.
- The existing concert details dialog can display the Sanity flyer and official event link. Existing cards, IDs, geometry and editor behavior are retained.
- `plugins/t4t-web-editor`: a supported skills-only Agent Plugins package and repo marketplace entry. The host agent uses connected Sanity/Drive tools and authorized browser sessions to execute the external operations. This is browser automation, not a headless API publisher.

## Current production status

The owner approved production schema/web deployment and the private queue credential on 29 October 2026. The additive concert schema is deployed in `t4t-concerts`; the existing visual editor schema remains intact. No webhook or recurrent worker is active. Actual connected tools/browser verified:

- Sanity concert `46c354d1-300c-41ad-8138-72b19dd6b897` and the public web have 13 November 2026, 19:30, EUR 15.
- Bandsintown event `109096773` is publicly published with the same information and flyer.
- Songkick artist `10418553` is now linked to `Tales4theTillerman`. Event `43491265` is publicly published with the schedule, price, source link and flyer source in Additional details. The original poster is now publicly rendered and visually verified (poster `39589109`).
- A permanent Sanity image asset was uploaded: `image-aacca9b457d3ebee145c8bc6d16fede78115d441-1080x1440-jpg`.
- After deploying the additive schema, the existing concert was patched, explicitly validated, published with a revision guard and read back. Its flyer, official event/source URLs and external IDs are persisted; `editorId:16` is preserved.
- The staged production queue accepted authenticated reads, reused identical jobs on repeated enqueue, and completed claim/finish with fresh actual browser observations for both existing platform IDs. It rejected unauthenticated access (401).
- The queue secret is a production-only Vercel Secret. The local host copy is in macOS Keychain, service `T4T WEB EDITOR production queue`; it is absent from the repo and deliverables. The plugin client `scripts/queue-client.py` reads it securely and contacts only the official site without following redirects.

## Deployment and recovery

Deploy the additive schema from `sanity/concert-sync` with `../../node_modules/.bin/sanity schema deploy --workspace t4t-concerts`. This local Studio imports the canonical concert definitions. The legacy `t4t-studio` schema cannot currently compile because pre-existing visual style fields contain hyphens; its deployment and stored keys are preserved. The separate `t4t-concerts` schema targets the same production dataset. Select that workspace explicitly for concert tools; do not replace either schema with an MCP-managed schema. Deploy the reviewed branch to the existing Vercel project, not a new website. Reuse existing project/dataset configuration. Configure a new server-only random `T4T_SYNC_SECRET` (at least 32 characters) through Vercel secrets and give the authorized worker access through a secure mechanism. Existing Sanity token stays server-only. This adds a queue endpoint, not public access to a CMS token.

The following metadata was applied to the existing ART Stalker document (never recreate it):

```json
{
  "address": "Kaiser-Friedrich-Str. 67, 10627 Berlin",
  "timezone": "Europe/Berlin",
  "currency": "EUR",
  "eventUrl": "https://www.facebook.com/events/1144183394632015/",
  "flyerSourceUrl": "https://www.facebook.com/photo/?fbid=10215891639800110&set=gm.1144183474632007",
  "venueAliases": ["ART Stalker - Kunst + Bar + Events", "Art Stalker"],
  "externalIds": {"bandsintown":"109096773","songkick":"43491265"},
  "image": {"_type":"image","asset":{"_type":"reference","_ref":"image-aacca9b457d3ebee145c8bc6d16fede78115d441-1080x1440-jpg"}}
}
```

Read current published and draft revisions before patching/publishing. Verify the web dialog after deployment.

## Queue interface

All operations require `Authorization: Bearer <T4T_SYNC_SECRET>`. Never paste this header into chat, a fixture, a repo file or a public report.

- `GET /api/t4t-sync?concertId=<Sanity-ID>` lists up to 100 most recently updated jobs. This is a bounded status view, not an exhaustive backlog scanner.
- `POST {"operation":"enqueue","concertId":"..."}` reads and validates the **published** Sanity record, then creates/reuses one job for each external platform and content fingerprint. Missing flyer/source/price blocks the request.
- `POST {"operation":"claim","jobId":"...","worker":"t4t-agent"}` leases a pending/due job for ten minutes using its revision. Response includes payload and lease ID.
- The authorized browser agent inspects the platform, creates/updates only when necessary, then performs a fresh readback. It keeps the real external ID after success.
- `POST {"operation":"finish","jobId":"...","leaseId":"...","observation":{...}}` accepts a fresh normalized readback. It records verified only if all required values agree. A different price, missing image, source change or stale lease cannot be recorded as success. Observations are worker attestations from actual UI reads; the server does not itself browse the providers.
- `POST {"operation":"fail","jobId":"...","leaseId":"...","reason":"..."}}` accepts only defined non-secret reason codes. `temporary_failure` is only for a failure known to precede any external write. A timeout during save must be `write_outcome_unknown`, which blocks automatic retry until inspected.

Do not reclaim expired running jobs blindly: the external write may have completed. Inspect the platform and resolve the unknown outcome first. Successful jobs remain intact during another platform's failure.

## Execution and recurrence boundaries

The Sanity adapter and queue run on the existing server after deployment. The two external write adapters run in the **host agent's authenticated browser**, as exercised in the ART Stalker test. No portable server-side Bandsintown/Songkick write credentials have been provided. The plugin must therefore be installed in a host that offers the connected tools and browser; a normal ChatGPT conversation without those capabilities cannot execute the whole workflow.

A queue is not a worker. Installing this plugin does not start a daemon. A Sanity webhook and a periodic pending-job worker are intentionally **not activated**. Once an authorized persistent browser executor is configured and tested, the optional webhook can send the published concert ID to `enqueue` with a secret header. It must filter only published `concert` documents; fingerprints make repeated content events idempotent. Changes to `concertSyncJob` and `concertIdentity` must never trigger it. Do not enable any recurrent external publishing until the executor, sessions and full readback/lease cycle have been verified.

The current tools cannot install a plugin into every ChatGPT conversation or lend a chat's browser session to a deployed Vercel process. The prepared plugin can be installed from the local/repo marketplace in the desktop product. Web/account-wide distribution is a separate product installation/publication step.

## Validation

`pnpm test:concert-sync`, `pnpm typecheck`, `pnpm lint`, `pnpm build`. The automated tests use injected in-memory clients/adapters; no fictitious public concerts are created. The actual ART Stalker publications are separate end-to-end evidence, not proof that an unattended recurrent worker is running.

Official capability references: [Bandsintown API](https://help.artists.bandsintown.com/en/articles/9186477-api-documentation), [Songkick API](https://www.songkick.com/developer/), [plugin packaging](https://developers.openai.com/plugins/build/plugins), [plugin connection/testing](https://developers.openai.com/plugins/deploy/connect-chatgpt).
