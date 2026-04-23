"use client"

import { useEffect, useRef, type CSSProperties } from "react"
import Image from "next/image"
import { useVisualEditor } from "@/components/visual-editor"
import { getElementLayoutStyle } from "@/lib/hero-layout-styles"
import type { LatestReleaseData, LatestReleaseVideoSource } from "@/lib/sanity/latest-release-loader"

const PRIMARY_CTA_CLASS = "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30"

function getYouTubePreviewSrc(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(youtubeId)}/hqdefault.jpg`
}

function getYouTubeEmbedSrc(source: LatestReleaseVideoSource): string {
  const youtubeId = encodeURIComponent(source.youtubeId)
  return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`
}

function getLatestReleaseBoxStyle(elementStyles: LatestReleaseData["elementStyles"], nodeId: string): CSSProperties {
  const style = { ...getElementLayoutStyle(elementStyles, nodeId, { includeGeometry: true }) }
  const persistedStyle = elementStyles[nodeId]

  delete style.opacity

  if (typeof persistedStyle?.backgroundColor === "string" && persistedStyle.backgroundColor.trim()) {
    style.backgroundColor = persistedStyle.backgroundColor
    style.backgroundImage = "none"
  }

  return style
}

function getLatestReleaseMediaStyle(elementStyles: LatestReleaseData["elementStyles"], nodeId: string): CSSProperties {
  return getElementLayoutStyle(elementStyles, nodeId, { includeGeometry: true })
}

function getLatestReleaseTextStyle(elementStyles: LatestReleaseData["elementStyles"], nodeId: string): CSSProperties {
  const style = { ...getElementLayoutStyle(elementStyles, nodeId, { includeGeometry: true }) }
  const persistedStyle = elementStyles[nodeId]

  if (persistedStyle?.gradientEnabled === false) {
    style.backgroundImage = "none"
    style.backgroundClip = "initial"
    style.WebkitBackgroundClip = "initial"
    style.WebkitTextFillColor = typeof style.color === "string" ? style.color : "currentColor"
  }

  return style
}

function getLatestReleaseEditorAttrs(
  elementStyles: LatestReleaseData["elementStyles"],
  targetId: string
): Record<string, string> {
  const styles = elementStyles[targetId] || {}
  const attrs: Record<string, string> = {}
  const hasPosition = typeof styles.x === "number" || typeof styles.y === "number"
  const hasSize = typeof styles.width === "number" || typeof styles.height === "number"
  const hasStyle = Object.keys(styles).some((key) => !["x", "y", "width", "height"].includes(key))

  if (hasPosition) attrs["data-editor-explicit-position"] = "true"
  if (hasSize) attrs["data-editor-explicit-size"] = "true"
  if (hasStyle) attrs["data-editor-explicit-style"] = "true"
  if (typeof styles.x === "number") attrs["data-editor-geometry-x"] = String(styles.x)
  if (typeof styles.y === "number") attrs["data-editor-geometry-y"] = String(styles.y)
  if (typeof styles.width === "number") attrs["data-editor-geometry-width"] = String(styles.width)
  if (typeof styles.height === "number") attrs["data-editor-geometry-height"] = String(styles.height)
  if (typeof styles.scale === "number") attrs["data-editor-style-scale"] = String(styles.scale)
  if (typeof styles.color === "string") attrs["data-editor-style-color"] = styles.color
  if (typeof styles.backgroundColor === "string") attrs["data-editor-style-background-color"] = styles.backgroundColor
  if (typeof styles.textShadowEnabled === "boolean") attrs["data-editor-style-text-shadow-enabled"] = String(styles.textShadowEnabled)
  if (styles.textAlign === "left" || styles.textAlign === "center" || styles.textAlign === "right") {
    attrs["data-editor-style-text-align"] = styles.textAlign
  }
  if (typeof styles.gradientEnabled === "boolean") attrs["data-editor-style-gradient-enabled"] = String(styles.gradientEnabled)
  if (typeof styles.gradientStart === "string") attrs["data-editor-style-gradient-start"] = styles.gradientStart
  if (typeof styles.gradientEnd === "string") attrs["data-editor-style-gradient-end"] = styles.gradientEnd

  return attrs
}

export function LatestReleaseCorrect({ data }: { data: LatestReleaseData }) {
  const { isEditing, registerEditable, unregisterEditable, getElementById } = useVisualEditor()

  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const watchButtonRef = useRef<HTMLAnchorElement>(null)
  const showsButtonRef = useRef<HTMLAnchorElement>(null)

  const orderedVideoSources = [...data.videoSources].sort((a, b) => a.order - b.order).slice(0, 3)
  const enabledVideoSources = orderedVideoSources.filter((source) => source.enabled)
  const effectiveVideoSources = enabledVideoSources.length > 0 ? enabledVideoSources : orderedVideoSources
  const activeVideoSource = effectiveVideoSources[0]
  const posterSource = activeVideoSource || orderedVideoSources[0]
  const youtubePosterSrc = posterSource ? getYouTubePreviewSrc(posterSource.youtubeId) : ""

  useEffect(() => {
    if (!isEditing) return

    const entries = [
      {
        ref: sectionRef.current,
        id: "latest-release-section",
        type: "section",
        label: "Release Section",
        parentId: null,
      },
      {
        ref: bgRef.current,
        id: "latest-release-bg",
        type: "background",
        label: "Release Background",
        parentId: "latest-release-section",
      },
      {
        ref: cardRef.current,
        id: "latest-release-card",
        type: "card",
        label: "Release Card",
        parentId: "latest-release-section",
      },
      {
        ref: titleRef.current,
        id: "latest-release-title",
        type: "text",
        label: "Release Title",
        parentId: "latest-release-section",
      },
      {
        ref: subtitleRef.current,
        id: "latest-release-subtitle",
        type: "text",
        label: "Release Subtitle",
        parentId: "latest-release-section",
      },
      {
        ref: watchButtonRef.current,
        id: "latest-release-watch-button",
        type: "button",
        label: "Watch Video Button",
        parentId: "latest-release-section",
      },
      {
        ref: showsButtonRef.current,
        id: "latest-release-shows-button",
        type: "button",
        label: "See Shows Button",
        parentId: "latest-release-section",
      },
    ] as const

    for (const entry of entries) {
      const element = entry.ref
      if (!element) continue
      const existing = getElementById(entry.id)
      registerEditable({
        id: entry.id,
        type: entry.type,
        label: entry.label,
        parentId: entry.parentId,
        element,
        originalRect: element.getBoundingClientRect(),
        transform: existing?.transform || { x: 0, y: 0 },
        dimensions: existing?.dimensions || { width: element.offsetWidth, height: element.offsetHeight },
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
  }, [getElementById, isEditing, registerEditable, unregisterEditable])

  return (
    <section
      ref={sectionRef}
      id="latest-release"
      data-editor-node-id="latest-release-section"
      data-editor-node-type="section"
      data-editor-node-label="Release Section"
      {...getLatestReleaseEditorAttrs(data.elementStyles, "latest-release-section")}
      className="relative overflow-hidden bg-black"
      style={getLatestReleaseBoxStyle(data.elementStyles, "latest-release-section")}
    >
      <div
        ref={bgRef}
        data-editor-node-id="latest-release-bg"
        data-editor-node-type="background"
        data-editor-media-kind="video"
        data-editor-video-url={activeVideoSource?.url || ""}
        data-editor-video-sources={JSON.stringify(data.videoSources)}
        data-editor-node-label="Release Background"
        {...getLatestReleaseEditorAttrs(data.elementStyles, "latest-release-bg")}
        className="absolute left-0 top-0 z-0 h-full w-full"
        style={getLatestReleaseMediaStyle(data.elementStyles, "latest-release-bg")}
      >
        {youtubePosterSrc ? (
          <Image
            src={youtubePosterSrc}
            alt=""
            aria-hidden="true"
            fill
            unoptimized
            sizes="100vw"
            className="z-0 object-cover"
          />
        ) : null}
        {!isEditing && activeVideoSource ? (
          <iframe
            key={activeVideoSource.youtubeId}
            src={getYouTubeEmbedSrc(activeVideoSource)}
            title=""
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-[125%] w-[125%] -translate-x-1/2 -translate-y-[40%]"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen={false}
          />
        ) : null}
        {isEditing ? (
          <div className="absolute bottom-4 left-1/2 z-10 w-[min(90vw,520px)] -translate-x-1/2 rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-center text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
            Enabled video sources play on the public page.
          </div>
        ) : null}
        <div className="section-photo-fade-top" />
        <div className="section-photo-fade-bottom" />
      </div>

      <div className="relative z-10 flex min-h-[78vh] min-h-[78dvh] items-center justify-center px-3 py-8 sm:min-h-screen sm:min-h-[100dvh] sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div
            ref={cardRef}
            data-editor-node-id="latest-release-card"
            data-editor-node-type="card"
            data-editor-node-label="Release Card"
            {...getLatestReleaseEditorAttrs(data.elementStyles, "latest-release-card")}
            className="mx-auto flex w-full max-w-4xl flex-col items-center rounded-2xl border border-primary/28 bg-black/24 p-6 text-center shadow-md backdrop-blur-sm md:p-8"
            style={getLatestReleaseBoxStyle(data.elementStyles, "latest-release-card")}
          >
            <h2
              ref={titleRef}
              data-editor-node-id="latest-release-title"
              data-editor-node-type="text"
              data-editor-node-label="Release Title"
              {...getLatestReleaseEditorAttrs(data.elementStyles, "latest-release-title")}
              className="mb-[var(--spacing-sm)] w-full text-balance text-center font-serif text-[clamp(1.65rem,7.2vw,2.4rem)] leading-[1.1] text-foreground sm:text-[length:var(--text-h2)] sm:leading-[var(--line-height-tight)]"
              style={getLatestReleaseTextStyle(data.elementStyles, "latest-release-title")}
            >
              {data.releaseTitle}
            </h2>

            <p
              ref={subtitleRef}
              data-editor-node-id="latest-release-subtitle"
              data-editor-node-type="text"
              data-editor-node-label="Release Subtitle"
              {...getLatestReleaseEditorAttrs(data.elementStyles, "latest-release-subtitle")}
              className="mb-5 w-full max-w-3xl text-balance text-center text-sm leading-relaxed text-muted-foreground sm:mb-6 sm:text-[length:var(--text-body)]"
              style={getLatestReleaseTextStyle(data.elementStyles, "latest-release-subtitle")}
            >
              {data.releaseSubtitle}
            </p>

            <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
              <a
                ref={watchButtonRef}
                href={data.releaseCtaHref}
                target="_blank"
                rel="noopener noreferrer"
                data-editor-node-id="latest-release-watch-button"
                data-editor-node-type="button"
                data-editor-node-label="Watch Video Button"
                {...getLatestReleaseEditorAttrs(data.elementStyles, "latest-release-watch-button")}
                className={`inline-flex min-h-[46px] w-full items-center justify-center overflow-hidden rounded-xl px-5 py-2.5 text-center text-sm font-semibold leading-tight shadow-md sm:min-h-[48px] sm:w-auto sm:px-6 sm:py-3 sm:text-base ${PRIMARY_CTA_CLASS}`}
                style={getLatestReleaseBoxStyle(data.elementStyles, "latest-release-watch-button")}
                onClick={(event) => isEditing && event.preventDefault()}
              >
                {data.releaseCtaLabel}
              </a>
              <a
                ref={showsButtonRef}
                href={data.showsCtaHref}
                target="_blank"
                rel="noopener noreferrer"
                data-editor-node-id="latest-release-shows-button"
                data-editor-node-type="button"
                data-editor-node-label="See Shows Button"
                {...getLatestReleaseEditorAttrs(data.elementStyles, "latest-release-shows-button")}
                className="inline-flex min-h-[46px] w-full items-center justify-center overflow-hidden rounded-xl border border-primary/35 px-5 py-2.5 text-center text-sm font-semibold leading-tight text-primary transition-colors hover:bg-primary/10 sm:min-h-[48px] sm:w-auto sm:px-6 sm:py-3 sm:text-base"
                style={getLatestReleaseBoxStyle(data.elementStyles, "latest-release-shows-button")}
                onClick={(event) => isEditing && event.preventDefault()}
              >
                {data.showsCtaLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
