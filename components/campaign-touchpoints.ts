export const CAMPAIGN_TOUCHPOINTS = {
  latestRelease: "latest-release",
  floatingBooking: "floating-booking",
  contactBooking: "contact-booking",
} as const

export const REQUIRED_CAMPAIGN_TOUCHPOINT_IDS = Object.values(CAMPAIGN_TOUCHPOINTS)
