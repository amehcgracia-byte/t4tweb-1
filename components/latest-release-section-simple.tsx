"use client"

import { useRef, useEffect, useState, type CSSProperties } from "react"
import { motion } from "framer-motion"
import { CAMPAIGN_CONTENT, CAMPAIGN_PRIMARY_CTA_CLASS } from "@/components/campaign-content"
import { useVisualEditor } from "@/components/visual-editor"
import type { LatestReleaseData } from "@/lib/sanity/latest-release-loader"
import { getElementLayoutStyle } from "@/lib/hero-layout-styles"

function getVideoContainerStyle(elementStyles: Record<string, Record<string, unknown>>, index: number): CSSProperties {
  const style = getElementLayoutStyle(elementStyles, `latest-release-video-${index}`)
  delete style.opacity
  return style
}

export function LatestReleaseSectionSimple({ data }: { data: LatestReleaseData }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)
  const { isEditing } = useVisualEditor()

  const activeVideo = data.videoSources[activeVideoIndex]

  return (
    <div
      ref={sectionRef}
      data-editor-node-id="latest-release-section"
      data-editor-node-type="section"
      data-editor-node-label="Latest Release Section"
      className="relative isolate w-full bg-gradient-to-b from-black via-black to-zinc-950 py-12 sm:py-16 md:py-20 lg:py-24"
      style={getElementLayoutStyle(data.elementStyles, "latest-release-section")}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                data-editor-node-id="latest-release-cta"
                data-editor-node-type="button"
                data-editor-node-label="Latest Release CTA"
                href={data.releaseCtaHref}
                className={`${CAMPAIGN_PRIMARY_CTA_CLASS} w-full sm:w-auto`}
                style={getElementLayoutStyle(data.elementStyles, "latest-release-cta")}
              >
                {data.releaseCtaLabel}
              </a>
              <a
                data-editor-node-id="latest-release-shows-cta"
                data-editor-node-type="button"
                data-editor-node-label="Shows CTA"
                href={data.showsCtaHref}
                className="btn-secondary w-full sm:w-auto"
                style={getElementLayoutStyle(data.elementStyles, "latest-release-shows-cta")}
              >
                {data.showsCtaLabel}
              </a>
            </div>
          </div>

          {/* Right column: Video player and thumbnails */}
          <div className="space-y-6">
            {/* Main video player */}
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl">
              {activeVideo && (
                <div
                  data-editor-node-id={`latest-release-video-${activeVideoIndex}`}
                  data-editor-node-type="video"
                  data-editor-node-label={`Video ${activeVideoIndex + 1}`}
                  className="absolute inset-0"
                  style={getVideoContainerStyle(data.elementStyles, activeVideoIndex)}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                    title={`YouTube video ${activeVideoIndex + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              )}
            </div>

            {/* Video thumbnails */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {data.videoSources.map((video, index) => (
                <button
                  key={video.youtubeId}
                  type="button"
                  onClick={() => setActiveVideoIndex(index)}
                  data-editor-node-id={`latest-release-thumbnail-${index}`}
                  data-editor-node-type="thumbnail"
                  data-editor-node-label={`Thumbnail ${index + 1}`}
                  className={`relative aspect-video overflow-hidden rounded-xl transition-all duration-300 ${
                    activeVideoIndex === index
                      ? "ring-2 ring-orange-500 ring-offset-2 ring-offset-black"
                      : "ring-1 ring-white/10 hover:ring-white/30"
                  }`}
                  style={getElementLayoutStyle(data.elementStyles, `latest-release-thumbnail-${index}`)}
                >
                  <img
                    src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                    alt={`Thumbnail for video ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/20">
                    <div className="h-10 w-10 rounded-full bg-white/90 p-2.5 shadow-lg">
                      <svg className="h-full w-full text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}