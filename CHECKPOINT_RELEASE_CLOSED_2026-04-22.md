# Release checkpoint — 2026-04-22

Release is considered closed at this checkpoint.

## Confirmed working
- `latest-release-section` persistence working
- `latest-release-bg` persistence working
- `latest-release-card` persistence working
- `latest-release-title` persistence working
- `latest-release-subtitle` persistence working
- `latest-release-watch-button` persistence working
- `latest-release-shows-button` persistence working
- public `/` and `/editor` parity accepted
- routing/persistence/editor considered closed for the current Release scope
- Release uses the stronger documentary model instead of the weaker CAMPAIGN_CONTENT-driven active model

## Strong baseline used
- `2a24a08aaa0985212f12a876d3ea9e64ec9aae66`

## Why this baseline mattered
- `LatestReleaseData`
- `videoSources`
- `ctaButtons`
- `elementStyles`
- editable `latest-release-card`
- stronger text tooling for Release in the historical editor

## Intent
Leave a durable recovery trace before revisiting more advanced Release variants or moving to the next section.

## Note
A stronger historical Release variant with 3 editable links was not confirmed in the visible repo snapshot. The best confirmed strong baseline remains `2a24a08`.
