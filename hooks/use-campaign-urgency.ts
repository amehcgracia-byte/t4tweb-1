"use client"

import { useEffect, useState } from "react"

let cachedUrgency: string | null = null
let cachedUrgencyPromise: Promise<string | null> | null = null

function buildUrgencyFromCsv(csv: string): string | null {
  const lines = csv.trim().split("\n")
  if (lines.length < 2) return null

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
  const venueIndex = headers.indexOf("venue")
  const cityIndex = headers.indexOf("city")
  const dateIndex = headers.indexOf("date")
  const statusIndex = headers.indexOf("status")

  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

  const rows = lines.slice(1).map((line) => line.split(",").map((cell) => cell.trim()))
  const shows = rows
    .map((row) => ({
      venue: venueIndex >= 0 ? row[venueIndex] || "" : "",
      city: cityIndex >= 0 ? row[cityIndex] || "" : "",
      date: dateIndex >= 0 ? row[dateIndex] || "" : "",
      status: statusIndex >= 0 ? row[statusIndex] || "" : "",
    }))
    .filter((show) => show.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const upcomingByDate = shows.filter((show) => new Date(show.date).getTime() >= startOfToday)
  const upcomingByStatus = shows.filter((show) => show.status.toLowerCase() === "upcoming")
  const candidates = upcomingByDate.length ? upcomingByDate : upcomingByStatus
  if (!candidates.length) return null

  const nextShow = candidates[0]
  const formattedDate = new Date(nextShow.date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  return `Next show: ${formattedDate} · ${nextShow.city}. Booking requests are open now.`
}

export function useCampaignUrgency(fallback: string) {
  const [urgency, setUrgency] = useState(fallback)

  useEffect(() => {
    if (cachedUrgency) {
      setUrgency(cachedUrgency)
      return
    }

    async function loadUrgency() {
      try {
        if (!cachedUrgencyPromise) {
          cachedUrgencyPromise = fetch("/data/concerts.csv")
            .then((response) => {
              if (!response.ok) throw new Error("Failed to load concerts CSV")
              return response.text()
            })
            .then((csv) => buildUrgencyFromCsv(csv))
            .catch(() => null)
        }

        const dynamicUrgency = (await cachedUrgencyPromise) || fallback
        cachedUrgency = dynamicUrgency
        setUrgency(dynamicUrgency)
      } catch {
        setUrgency(fallback)
      }
    }

    loadUrgency()
  }, [fallback])

  return urgency
}
