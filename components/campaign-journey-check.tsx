"use client"

import { useEffect } from "react"
import { REQUIRED_CAMPAIGN_TOUCHPOINT_IDS } from "@/components/campaign-touchpoints"

export function CampaignJourneyCheck() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return

    const touchpoints = Array.from(document.querySelectorAll<HTMLElement>("[data-campaign-touchpoint]"))
    const touchpointIds = touchpoints
      .map((node) => node.dataset.campaignTouchpoint)
      .filter((value): value is string => Boolean(value))
    const count = touchpointIds.length

    if (count < 3) {
      console.warn(`[campaign-check] Expected at least 3 touchpoints, found ${count}.`, touchpointIds)
      return
    }

    const duplicates = touchpointIds.filter((id, index) => touchpointIds.indexOf(id) !== index)
    if (duplicates.length > 0) {
      console.warn(`[campaign-check] Duplicate touchpoint ids detected.`, duplicates)
    }

    const missingTouchpoints = REQUIRED_CAMPAIGN_TOUCHPOINT_IDS.filter((requiredId) => !touchpointIds.includes(requiredId))
    if (missingTouchpoints.length > 0) {
      console.warn(`[campaign-check] Missing required touchpoint ids.`, missingTouchpoints)
    }

    console.info(`[campaign-check] Campaign touchpoints detected: ${count}.`, touchpointIds)
  }, [])

  return null
}
