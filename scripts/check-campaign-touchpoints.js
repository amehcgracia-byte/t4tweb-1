#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const repoRoot = process.cwd()
const requiredFiles = [
  "components/latest-release-section.tsx",
  "components/floating-booking-bar.tsx",
  "components/contact-section.tsx",
  "app/page.tsx",
]

for (const file of requiredFiles) {
  const fullPath = path.join(repoRoot, file)
  if (!fs.existsSync(fullPath)) {
    console.error(`[campaign-check] Missing required file: ${file}`)
    process.exit(1)
  }
}

const latestRelease = fs.readFileSync(path.join(repoRoot, "components/latest-release-section.tsx"), "utf8")
const floatingBar = fs.readFileSync(path.join(repoRoot, "components/floating-booking-bar.tsx"), "utf8")
const contact = fs.readFileSync(path.join(repoRoot, "components/contact-section.tsx"), "utf8")
const page = fs.readFileSync(path.join(repoRoot, "app/page.tsx"), "utf8")

const touchpointCount = [latestRelease, floatingBar, contact]
  .map((content) => (content.includes("data-campaign-touchpoint") ? 1 : 0))
  .reduce((sum, value) => sum + value, 0)

if (touchpointCount < 3) {
  console.error(`[campaign-check] Expected >= 3 touchpoints, found ${touchpointCount}.`)
  process.exit(1)
}

if (!page.includes("<LatestReleaseSection />")) {
  console.error("[campaign-check] LatestReleaseSection is not mounted in app/page.tsx.")
  process.exit(1)
}

if (!page.includes("<FloatingBookingBar />")) {
  console.error("[campaign-check] FloatingBookingBar is not mounted in app/page.tsx.")
  process.exit(1)
}

console.log(`[campaign-check] OK - ${touchpointCount} campaign touchpoints and required mounts found.`)
