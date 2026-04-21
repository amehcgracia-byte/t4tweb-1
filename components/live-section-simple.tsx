"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import { SectionHeader } from "@/components/section-header"
import { useVisualEditor } from "@/components/visual-editor"
import type { LiveSectionData } from "@/lib/live-concerts-loader"
import { getElementLayoutStyle } from "@/lib/hero-layout-styles"

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "upcoming":
      return "bg-green-500/20 text-green-300 border-green-500/30"
    case "completed":
      return "bg-zinc-800/50 text-zinc-400 border-zinc-700/50"
    case "cancelled":
      return "bg-red-500/20 text-red-300 border-red-500/30"
    default:
      return "bg-zinc-800/50 text-zinc-400 border-zinc-700/50"
  }
}

function getStatusIcon(status: string): string {
  switch (status.toLowerCase()) {
    case "upcoming":
      return "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    case "completed":
      return "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
    case "cancelled":
      return "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    default:
      return "M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
  }
}

export function LiveSectionSimple({ data }: { data: LiveSectionData }) {
  const sectionRef = useRef<HTMLElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const { opacity, y } = useScrollAnimation(sectionRef)
  const { isEditing, registerEditable, unregisterEditable } = useVisualEditor()

  const upcomingConcerts = data.concerts.filter(c => c.status.toLowerCase() === "upcoming")
  const pastConcerts = data.concerts.filter(c => c.status.toLowerCase() === "completed")

  useEffect(() => {
    if (!isEditing) return

    const sectionElement = sectionRef.current
    if (!sectionElement) return

    registerEditable({
      id: "live-section",
      type: "section",
      label: "Live Section",
      parentId: null,
      element: sectionElement,
      originalRect: sectionElement.getBoundingClientRect(),
      transform: { x: 0, y: 0 },
      dimensions: { width: sectionElement.offsetWidth, height: sectionElement.offsetHeight },
    })

    const bgElement = sectionElement.querySelector('[data-editor-node-id="live-section-bg-image"]')
    if (bgElement instanceof HTMLElement) {
      registerEditable({
        id: "live-section-bg-image",
        type: "background",
        label: "Live Background Image",
        parentId: "live-section",
        element: bgElement,
        originalRect: bgElement.getBoundingClientRect(),
        transform: { x: 0, y: 0 },
        dimensions: { width: bgElement.offsetWidth, height: bgElement.offsetHeight },
      })
    }

    const seeShowsButton = sectionElement.querySelector('[data-editor-node-id="live-section-see-shows-button"]')
    if (seeShowsButton instanceof HTMLElement) {
      registerEditable({
        id: "live-section-see-shows-button",
        type: "button",
        label: "See Shows Button",
        parentId: "live-section",
        element: seeShowsButton,
        originalRect: seeShowsButton.getBoundingClientRect(),
        transform: { x: 0, y: 0 },
        dimensions: { width: seeShowsButton.offsetWidth, height: seeShowsButton.offsetHeight },
      })
    }

    return () => {
      unregisterEditable("live-section")
      unregisterEditable("live-section-bg-image")
      unregisterEditable("live-section-see-shows-button")
    }
  }, [isEditing, registerEditable, unregisterEditable])

  return (
    <section
      ref={sectionRef}
      data-editor-node-id="live-section"
      data-editor-node-type="section"
      data-editor-node-label="Live Section"
      className="relative isolate min-h-screen w-full overflow-hidden bg-black"
      style={getElementLayoutStyle(data.elementStyles, "live-section")}
    >
      {/* Background image */}
      <div
        data-editor-node-id="live-section-bg-image"
        data-editor-node-type="background"
        data-editor-media-kind="image"
        data-editor-node-label="Live Background Image"
        className="absolute inset-0 z-0"
        style={getElementLayoutStyle(data.elementStyles, "live-section-bg-image")}
      >
        <Image
          src={data.backgroundImageUrl}
          alt="Live section background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Gradient overlays */}
      <div className="section-photo-fade-top z-10" />
      <div className="section-photo-fade-bottom z-10" />
      <div className="section-photo-scrim z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 py-12 sm:py-16 md:py-20 lg:py-24">
        <motion.div
          style={isEditing ? undefined : { opacity, y }}
          className="mb-8 md:mb-12 lg:mb-16 text-center"
        >
          <SectionHeader
            eyebrow="Live Performances"
            title="Upcoming Shows"
            description="Experience the energy of Tales for the Tillerman live — from intimate clubs to major festivals."
            dataEditId="live-section-header"
            dataEditLabel="Live Section Header"
          />
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Upcoming concerts */}
          <div className="space-y-6">
            <h3
              data-editor-node-id="live-upcoming-title"
              data-editor-node-type="text"
              data-editor-node-label="Upcoming Shows Title"
              className="text-2xl font-bold text-white mb-6"
              style={getElementLayoutStyle(data.elementStyles, "live-upcoming-title")}
            >
              Upcoming Shows
            </h3>

            {upcomingConcerts.length > 0 ? (
              <div
                data-editor-node-id="live-upcoming-list"
                data-editor-node-type="card"
                data-editor-node-label="Upcoming Shows List"
                className="space-y-4"
                style={getElementLayoutStyle(data.elementStyles, "live-upcoming-list")}
              >
                {upcomingConcerts.map((concert, index) => (
                  <div
                    key={concert._editorId}
                    data-editor-node-id={`live-concert-${index}`}
                    data-editor-node-type="card"
                    data-editor-node-label={`Concert: ${concert.venue}`}
                    className="group rounded-xl border bg-black/40 backdrop-blur-sm p-5 transition-all hover:bg-black/60"
                    style={getElementLayoutStyle(data.elementStyles, `live-concert-${index}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(concert.status)}`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getStatusIcon(concert.status)} />
                            </svg>
                            {concert.status}
                          </span>
                          {concert.genre && (
                            <span className="text-xs text-white/60 bg-white/10 px-2.5 py-1 rounded-full">
                              {concert.genre}
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-1">{concert.venue}</h4>
                        <div className="text-sm text-white/70 space-y-1">
                          {(concert.city || concert.country) && (
                            <p>{[concert.city, concert.country].filter(Boolean).join(", ")}</p>
                          )}
                          {concert.date && (
                            <p className="font-medium text-orange-400">{formatDate(concert.date)} {concert.time && `• ${concert.time}`}</p>
                          )}
                          {concert.capacity && (
                            <p className="text-white/50">Capacity: {concert.capacity}</p>
                          )}
                          {concert.price && (
                            <p className="text-white/50">Price: {concert.price}</p>
                          )}
                        </div>
                      </div>
                      {concert.locationUrl && (
                        <a
                          href={concert.locationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                          onClick={(e) => isEditing && e.preventDefault()}
                        >
                          Tickets
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                data-editor-node-id="live-upcoming-empty"
                data-editor-node-type="card"
                data-editor-node-label="No Upcoming Shows"
                className="rounded-xl border border-dashed border-white/20 bg-black/20 p-8 text-center"
                style={getElementLayoutStyle(data.elementStyles, "live-upcoming-empty")}
              >
                <p
                  data-editor-node-id="live-upcoming-empty-text"
                  data-editor-node-type="text"
                  data-editor-node-label="No Shows Text"
                  className="text-white/60"
                  style={getElementLayoutStyle(data.elementStyles, "live-upcoming-empty-text")}
                >
                  No upcoming shows scheduled. Check back soon!
                </p>
              </div>
            )}
          </div>

          {/* Past concerts */}
          <div className="space-y-6">
            <h3
              data-editor-node-id="live-history-title"
              data-editor-node-type="text"
              data-editor-node-label="Past Shows Title"
              className="text-2xl font-bold text-white mb-6"
              style={getElementLayoutStyle(data.elementStyles, "live-history-title")}
            >
              Past Shows
            </h3>

            {pastConcerts.length > 0 ? (
              <div
                data-editor-node-id="live-history-list"
                data-editor-node-type="card"
                data-editor-node-label="Past Shows List"
                className="space-y-3"
                style={getElementLayoutStyle(data.elementStyles, "live-history-list")}
              >
                {pastConcerts.slice(0, 6).map((concert, index) => (
                  <div
                    key={concert._editorId}
                    className="flex items-center justify-between rounded-lg bg-white/5 p-4 hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-white">{concert.venue}</h4>
                      <p className="text-sm text-white/50">
                        {concert.date && formatDate(concert.date)}
                        {(concert.city || concert.country) && ` • ${[concert.city, concert.country].filter(Boolean).join(", ")}`}
                      </p>
                    </div>
                    <span className="text-xs text-white/40 bg-white/10 px-2.5 py-1 rounded-full">
                      {concert.genre || "World Music"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                data-editor-node-id="live-history-empty"
                data-editor-node-type="card"
                data-editor-node-label="No Past Shows"
                className="rounded-xl border border-dashed border-white/20 bg-black/20 p-8 text-center"
                style={getElementLayoutStyle(data.elementStyles, "live-history-empty")}
              >
                <p className="text-white/60">No past shows recorded yet.</p>
              </div>
            )}

            {/* CTA Button */}
            <div className="pt-6">
              <a
                data-editor-node-id="live-section-see-shows-button"
                data-editor-node-type="button"
                data-editor-node-label="See Shows Button"
                href="#contact"
                className="btn-primary inline-block"
                style={getElementLayoutStyle(data.elementStyles, "live-section-see-shows-button")}
                onClick={(e) => isEditing && e.preventDefault()}
              >
                Book a Show
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}