"use client"

import { useEffect } from "react"

export function CampaignJourneyCheck() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return

    const touchpoints = document.querySelectorAll("[data-campaign-touchpoint]")
    const count = touchpoints.length

    if (count < 3) {
      console.warn(`[campaign-check] Expected at least 3 touchpoints, found ${count}.`)
    }
  }, [])

  return null
}
