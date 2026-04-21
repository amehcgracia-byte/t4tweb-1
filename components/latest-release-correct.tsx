"use client"

import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CAMPAIGN_CONTENT, CAMPAIGN_PRIMARY_CTA_CLASS } from "@/components/campaign-content"
import { useVisualEditor } from "@/components/visual-editor"
import type { LatestReleaseData } from "@/lib/sanity/latest-release-loader"
import { getElementLayoutStyle } from "@/lib/hero-layout-styles"

export function LatestReleaseCorrect({ data }: { data: LatestReleaseData }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)
  const { isEditing, registerEditable, unregisterEditable } = useVisualEditor()

   const activeVideo = data.videoSources[0] // Solo el primer video es visible en público

  useEffect(() => {
    if (!isEditing) return

    const sectionElement = sectionRef.current
    if (!sectionElement) return

    registerEditable({
      id: "latest-release-section",
      type: "section",
      label: "Latest Release Section",
      parentId: null,
      element: sectionElement,
      originalRect: sectionElement.getBoundingClientRect(),
      transform: { x: 0, y: 0 },
      dimensions: { width: sectionElement.offsetWidth, height: sectionElement.offsetHeight },
    })

    const bgElement = sectionElement.querySelector('[data-editor-node-id="latest-release-bg"]')
    if (bgElement instanceof HTMLElement) {
      registerEditable({
        id: "latest-release-bg",
        type: "background",
        label: "Latest Release Background",
        parentId: "latest-release-section",
        element: bgElement,
        originalRect: bgElement.getBoundingClientRect(),
        transform: { x: 0, y: 0 },
        dimensions: { width: bgElement.offsetWidth, height: bgElement.offsetHeight },
      })
    }

    const cardElement = sectionElement.querySelector('[data-editor-node-id="latest-release-card"]')
    if (cardElement instanceof HTMLElement) {
      registerEditable({
        id: "latest-release-card",
        type: "card",
        label: "Latest Release Card",
        parentId: "latest-release-section",
        element: cardElement,
        originalRect: cardElement.getBoundingClientRect(),
        transform: { x: 0, y: 0 },
        dimensions: { width: cardElement.offsetWidth, height: cardElement.offsetHeight },
      })
    }

    const titleElement = sectionElement.querySelector('[data-editor-node-id="latest-release-title"]')
    if (titleElement instanceof HTMLElement) {
      registerEditable({
        id: "latest-release-title",
        type: "text",
        label: "Latest Release Title",
        parentId: "latest-release-section",
        element: titleElement,
        originalRect: titleElement.getBoundingClientRect(),
        transform: { x: 0, y: 0 },
        dimensions: { width: titleElement.offsetWidth, height: titleElement.offsetHeight },
      })
    }

    const subtitleElement = sectionElement.querySelector('[data-editor-node-id="latest-release-subtitle"]')
    if (subtitleElement instanceof HTMLElement) {
      registerEditable({
        id: "latest-release-subtitle",
        type: "text",
        label: "Latest Release Subtitle",
        parentId: "latest-release-section",
        element: subtitleElement,
        originalRect: subtitleElement.getBoundingClientRect(),
        transform: { x: 0, y: 0 },
        dimensions: { width: subtitleElement.offsetWidth, height: subtitleElement.offsetHeight },
      })
    }

    const watchButton = sectionElement.querySelector('[data-editor-node-id="latest-release-watch-button"]')
    if (watchButton instanceof HTMLElement) {
      registerEditable({
        id: "latest-release-watch-button",
        type: "button",
        label: "Watch Video Button",
        parentId: "latest-release-section",
        element: watchButton,
        originalRect: watchButton.getBoundingClientRect(),
        transform: { x: 0, y: 0 },
        dimensions: { width: watchButton.offsetWidth, height: watchButton.offsetHeight },
      })
    }

    const showsButton = sectionElement.querySelector('[data-editor-node-id="latest-release-shows-button"]')
    if (showsButton instanceof HTMLElement) {
      registerEditable({
        id: "latest-release-shows-button",
        type: "button",
        label: "See Shows Button",
        parentId: "latest-release-section",
        element: showsButton,
        originalRect: showsButton.getBoundingClientRect(),
        transform: { x: 0, y: 0 },
        dimensions: { width: showsButton.offsetWidth, height: showsButton.offsetHeight },
      })
    }

    return () => {
      unregisterEditable("latest-release-section")
      unregisterEditable("latest-release-bg")
      unregisterEditable("latest-release-card")
      unregisterEditable("latest-release-title")
      unregisterEditable("latest-release-subtitle")
      unregisterEditable("latest-release-watch-button")
      unregisterEditable("latest-release-shows-button")
    }
  }, [isEditing, registerEditable, unregisterEditable])

  return (
    <div
      ref={sectionRef}
      data-editor-node-id="latest-release-section"
      data-editor-node-type="section"
      data-editor-node-label="Latest Release Section"
      className="relative isolate w-full bg-gradient-to-b from-black via-black to-zinc-950 py-12 sm:py-16 md:py-20 lg:py-24"
      style={getElementLayoutStyle(data.elementStyles, "latest-release-section")}
    >
      {/* Background - solo UN video principal */}
      <div
        data-editor-node-id="latest-release-bg"
        data-editor-node-type="background"
        data-editor-media-kind="video"
        data-editor-node-label="Latest Release Background"
        className="absolute inset-0 z-0"
        style={getElementLayoutStyle(data.elementStyles, "latest-release-bg")}
      >
        {activeVideo && (
          <div className="absolute inset-0">
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=0&mute=1&loop=1&playlist=${activeVideo.youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
              title="Latest release video background"
              allow="autoplay; encrypted-media"
              allowFullScreen={false}
              className="absolute top-1/2 left-1/2 h-[125%] w-[125%] -translate-x-1/2 -translate-y-[40%] pointer-events-none"
            />
          </div>
        )}
        <div className="section-photo-fade-top" />
        <div className="section-photo-fade-bottom" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left column: Title, subtitle, CTAs */}
          <div className="flex flex-col justify-center space-y-6 sm:space-y-8">
            <div className="space-y-4 sm:space-y-6">
              <h2
                data-editor-node-id="latest-release-title"
                data-editor-node-type="text"
                data-editor-node-label="Latest Release Title"
                className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
                style={getElementLayoutStyle(data.elementStyles, "latest-release-title")}
              >
                {data.releaseTitle}
              </h2>
              <p
                data-editor-node-id="latest-release-subtitle"
                data-editor-node-type="text"
                data-editor-node-label="Latest Release Subtitle"
                className="text-lg text-white/80 sm:text-xl"
                style={getElementLayoutStyle(data.elementStyles, "latest-release-subtitle")}
              >
                {data.releaseSubtitle}
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              <a
                data-editor-node-id="latest-release-watch-button"
                data-editor-node-type="button"
                data-editor-node-label="Watch Video Button"
                href={data.releaseCtaHref}
                className={`${CAMPAIGN_PRIMARY_CTA_CLASS} w-full sm:w-auto`}
                style={getElementLayoutStyle(data.elementStyles, "latest-release-watch-button")}
                onClick={(e) => isEditing && e.preventDefault()}
              >
                {data.releaseCtaLabel}
              </a>
              <a
                data-editor-node-id="latest-release-shows-button"
                data-editor-node-type="button"
                data-editor-node-label="See Shows Button"
                href={data.showsCtaHref}
                className="btn-secondary w-full sm:w-auto"
                style={getElementLayoutStyle(data.elementStyles, "latest-release-shows-button")}
                onClick={(e) => isEditing && e.preventDefault()}
              >
                {data.showsCtaLabel}
              </a>
            </div>

               {/* Video selector - solo en editor o como controles discretos */}
               {isEditing && data.videoSources.length > 1 && (
                 <div className="mt-6 rounded-lg bg-black/40 p-4">
                   <h3 className="mb-3 text-sm font-medium text-white">Video Sources (Editor Only)</h3>
                   <div className="space-y-2">
                     {data.videoSources.map((video, index) => (
                       <div key={video.youtubeId} className="flex items-center gap-3">
                         <button
                           type="button"
                           onClick={() => setActiveVideoIndex(index)}
                           className={`px-3 py-2 text-sm rounded ${activeVideoIndex === index ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                         >
                           Video {index + 1}
                         </button>
                         <span className="text-xs text-white/50 truncate">
                           {video.youtubeId}
                         </span>
                       </div>
                     ))}
                   </div>
                   <p className="mt-2 text-xs text-white/40">
                     These controls are only visible in editor mode. In public view, only the active video is shown.
                   </p>
                 </div>
               )}
          </div>

          {/* Right column: Video player card */}
           <div
             data-editor-node-id="latest-release-card"
             data-editor-node-type="card"
             data-editor-node-label="Latest Release Card"
             className="relative aspect-video overflow-hidden rounded-2xl bg-black/40 shadow-2xl backdrop-blur-sm"
             style={getElementLayoutStyle(data.elementStyles, "latest-release-card")}
           >
             {activeVideo && (
               <div className="absolute inset-0">
                 <iframe
                   src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                   title={`Latest Release Video`}
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   allowFullScreen
                   className="absolute inset-0 h-full w-full"
                 />
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  )
}