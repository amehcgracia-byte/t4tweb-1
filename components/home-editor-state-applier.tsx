"use client"

import { useEffect } from "react"
import type { HomeEditorNodeOverride } from "@/lib/sanity/home-editor-state"
import { getTraceNodeId } from "@/lib/sanity/env"
import { formatDisplayDate } from "@/lib/format-date"

const DOC_DRIVEN_IMAGE_NODE_IDS = new Set<string>([
  "hero-bg-image",
  "hero-logo",
  "nav-logo",
  "intro-banner-gif",
])

const DOC_DRIVEN_TEXT_NODE_IDS = new Set<string>([
  "hero-title-main",
  "hero-title-accent",
])

const RESPONSIVE_CONTAINER_NODE_IDS = new Set<string>([
  "hero-section",
  "intro-section",
])

function isDocDrivenNode(nodeId: string): boolean {
  if (DOC_DRIVEN_IMAGE_NODE_IDS.has(nodeId)) return true
  if (DOC_DRIVEN_TEXT_NODE_IDS.has(nodeId)) return true
  if (nodeId === "hero-section" || nodeId === "hero-title" || nodeId === "hero-subtitle" || nodeId === "hero-scroll-indicator" || nodeId === "hero-buttons") return true
  if (nodeId === "navigation" || nodeId === "navigation-inner" || nodeId === "nav-brand-name" || nodeId === "nav-book-button" || nodeId === "nav-mobile-book-button") return true
  if (/^nav-(link|mobile-link)-\d+$/.test(nodeId)) return true
  if (nodeId === "intro-section" || nodeId === "intro-banner-text" || nodeId === "intro-book-button" || nodeId === "intro-press-button") return true
  return false
}

function escapeEditorId(id: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(id)
  }
  return id.replace(/(["\\#.:\[\]])/g, "\\$1")
}

function applyTextGradient(el: HTMLElement, start: string, end: string): void {
  el.style.backgroundImage = `linear-gradient(90deg, ${start}, ${end})`
  el.style.backgroundClip = "text"
  el.style.webkitBackgroundClip = "text"
  el.style.webkitTextFillColor = "transparent"
  el.style.color = "transparent"
  el.dataset.editorManagedGradient = "true"
}

function clearTextGradient(el: HTMLElement): void {
  if (el.dataset.editorManagedGradient !== "true") return
  el.style.removeProperty("background-image")
  el.style.removeProperty("background-clip")
  el.style.removeProperty("-webkit-background-clip")
  el.style.removeProperty("-webkit-text-fill-color")
  delete el.dataset.editorManagedGradient
}

function isResetHistoryCard(nodeId: string): boolean {
  // The published 06 Jun 2025 Kulturelle Landpartie entry carries an
  // accidental legacy style override. Preserve its content, but do not
  // reapply the stale visual values to the shared History card.
  return nodeId === "live-history-event-4"
}

export function HomeEditorStateApplier({ nodes }: { nodes: HomeEditorNodeOverride[] }) {
  useEffect(() => {
    if (!Array.isArray(nodes) || nodes.length === 0) return
    const traceNodeId = getTraceNodeId()
    if (typeof window !== "undefined") {
      ;(window as Window & { __HOME_EDITOR_NODE_OVERRIDES__?: Record<string, HomeEditorNodeOverride> }).__HOME_EDITOR_NODE_OVERRIDES__ =
        Object.fromEntries(nodes.map((node) => [node.nodeId, node]))
    }
    if (process.env.NODE_ENV !== "production" && traceNodeId) {
      const traceNode = nodes.find((node) => node.nodeId === traceNodeId)
      console.info("[home-editor-state-applier][trace][begin]", {
        traceNodeId,
        foundInNodes: !!traceNode,
        node: traceNode || null,
      })
    }

    const applyOverrides = () => {
      const allowGeometryOverrides = window.matchMedia("(min-width: 1024px)").matches
      const allowResponsiveTypography = allowGeometryOverrides
      nodes.forEach((node) => {
      const selector = `[data-editor-node-id="${escapeEditorId(node.nodeId)}"]`
      const el = document.querySelector<HTMLElement>(selector)
      if (!el) return

      if (isDocDrivenNode(node.nodeId)) {
        return
      }

      const resetHistoryCard = isResetHistoryCard(node.nodeId)
      const scale = typeof node.style.scale === "number" ? Math.max(0.1, node.style.scale) : 1

      const applyNodeGeometry = allowGeometryOverrides && !RESPONSIVE_CONTAINER_NODE_IDS.has(node.nodeId) && !resetHistoryCard

      if (applyNodeGeometry && (node.explicitPosition || (node.explicitStyle && scale !== 1))) {
        el.style.transform = scale !== 1
          ? `translate(${Math.round(node.geometry.x)}px, ${Math.round(node.geometry.y)}px) scale(${scale})`
          : `translate(${Math.round(node.geometry.x)}px, ${Math.round(node.geometry.y)}px)`
        el.style.transformOrigin = "top left"
        el.dataset.editorManagedTransform = "true"
      } else {
        if (el.dataset.editorManagedTransform === "true") {
          el.style.removeProperty("transform")
          el.style.removeProperty("transform-origin")
        }
        delete el.dataset.editorManagedTransform
      }

      if (applyNodeGeometry && node.explicitSize) {
        el.style.width = `${Math.max(8, Math.round(node.geometry.width))}px`
        el.style.height = `${Math.max(8, Math.round(node.geometry.height))}px`
        el.dataset.editorManagedSize = "true"
      } else {
        if (el.dataset.editorManagedSize === "true") {
          el.style.removeProperty("width")
          el.style.removeProperty("height")
        }
        delete el.dataset.editorManagedSize
      }

      // Keep explicit flags/geometry discoverable when VisualEditor re-scans the DOM.
      el.dataset.editorExplicitContent = node.explicitContent ? "true" : "false"
      el.dataset.editorExplicitStyle = node.explicitStyle ? "true" : "false"
      el.dataset.editorExplicitPosition = node.explicitPosition ? "true" : "false"
      el.dataset.editorExplicitSize = node.explicitSize ? "true" : "false"
      el.dataset.editorGeometryX = String(Math.round(node.geometry.x))
      el.dataset.editorGeometryY = String(Math.round(node.geometry.y))
      el.dataset.editorGeometryWidth = String(Math.round(node.geometry.width))
      el.dataset.editorGeometryHeight = String(Math.round(node.geometry.height))

      if (node.explicitStyle && !resetHistoryCard) {
        if (node.style.opacity !== undefined) el.style.opacity = String(node.style.opacity)
        if ((node.nodeType === "text" || node.nodeType === "button") && node.content.gradientEnabled) {
          applyTextGradient(
            el,
            node.content.gradientStart || "#FFB15A",
            node.content.gradientEnd || "#FF6C00"
          )
        } else {
          clearTextGradient(el)
          if (node.style.color) el.style.color = node.style.color
        }
        if (node.style.backgroundColor) el.style.backgroundColor = node.style.backgroundColor
        if (allowResponsiveTypography && node.style.fontSize) el.style.fontSize = node.style.fontSize
        if (node.style.fontFamily) el.style.fontFamily = node.style.fontFamily
        if (node.style.fontWeight) el.style.fontWeight = node.style.fontWeight
        if (node.style.fontStyle) el.style.fontStyle = node.style.fontStyle
        if (node.style.textDecoration) el.style.textDecoration = node.style.textDecoration
        if (node.style.textAlign) el.style.textAlign = node.style.textAlign
        if (allowResponsiveTypography && node.style.minHeight) el.style.minHeight = node.style.minHeight
        if (allowResponsiveTypography && node.style.paddingTop) el.style.paddingTop = node.style.paddingTop
        if (allowResponsiveTypography && node.style.paddingBottom) el.style.paddingBottom = node.style.paddingBottom
      }

      if (node.explicitContent) {
        if ((node.nodeType === "text" || node.nodeType === "button") && node.content.text !== undefined) {
          el.textContent = node.content.text
        }
        if ((node.nodeType === "button" || node.nodeType === "card") && node.content.href && (el.tagName === "A" || el.tagName === "BUTTON")) {
          el.setAttribute("href", node.content.href)
        }

        if (node.nodeType === "background" && node.content.mediaKind === "video") {
          const iframe = el.querySelector("iframe")
          if (node.content.videoUrl) {
            el.dataset.editorVideoUrl = node.content.videoUrl
            if (iframe) {
              iframe.setAttribute("src", node.content.videoUrl)
            } else {
              const poster = el.querySelector<HTMLImageElement>("[data-editor-video-poster]")
              const match = node.content.videoUrl.match(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i)
              if (poster && match) poster.src = `https://i.ytimg.com/vi/${match[1]}/maxresdefault.jpg`
            }
          }
        } else if (node.nodeType === "image" || node.nodeType === "background") {
          if (DOC_DRIVEN_IMAGE_NODE_IDS.has(node.nodeId)) {
            if (process.env.NODE_ENV !== "production" && traceNodeId && traceNodeId === node.nodeId) {
              console.info("[home-editor-state-applier][trace] skip doc-driven image src apply", {
                nodeId: node.nodeId,
                contentSrc: node.content.src || null,
              })
            }
            return
          }
          const img = el.tagName === "IMG" ? (el as HTMLImageElement) : el.querySelector("img")
          if (img && node.content.src) {
            const normalizedSrc = node.nodeId === "about-bg-image" && node.content.src.endsWith("/images/about-bg-main.jpg")
              ? "/images/about-band-color.png"
              : node.content.src
            img.src = normalizedSrc
          }
          if (img && node.content.alt !== undefined) img.alt = node.content.alt
        }

        if (node.nodeType === "card") {
          if (node.content.gradientEnabled) {
            el.style.backgroundImage = `linear-gradient(135deg, ${node.content.gradientStart || "#111111"}, ${node.content.gradientEnd || "#000000"})`
          }
          if (node.content.date !== undefined) el.dataset.concertDate = node.content.date
          if (node.content.venue !== undefined) el.dataset.concertVenue = node.content.venue
          if (node.content.city !== undefined) el.dataset.concertCity = node.content.city
          if (node.content.country !== undefined) el.dataset.concertCountry = node.content.country
          if (node.content.genre !== undefined) el.dataset.concertGenre = node.content.genre
          if (node.content.price !== undefined) el.dataset.concertPrice = node.content.price
          if (node.content.status !== undefined) el.dataset.concertStatus = node.content.status
          if (node.content.time !== undefined) el.dataset.concertTime = node.content.time
          if (node.content.capacity !== undefined) el.dataset.concertCapacity = node.content.capacity
          if (node.content.locationUrl !== undefined) el.dataset.concertLocationUrl = node.content.locationUrl

          const dateEl = el.querySelector<HTMLElement>('[data-concert-field="date"]')
          const venueEl = el.querySelector<HTMLElement>('[data-concert-field="venue"]')
          const locationEl = el.querySelector<HTMLElement>('[data-concert-field="location"]')
          const genreEl = el.querySelector<HTMLElement>('[data-concert-field="genre"]')
          const priceEl = el.querySelector<HTMLElement>('[data-concert-field="price"]')
          const timeEl = el.querySelector<HTMLElement>('[data-concert-field="time"]')

          if (dateEl && node.content.date !== undefined) {
            dateEl.textContent = formatDisplayDate(node.content.date)
          }
          if (venueEl && node.content.venue !== undefined) venueEl.textContent = node.content.venue
          if (locationEl && (node.content.city !== undefined || node.content.country !== undefined)) {
            locationEl.textContent = `${node.content.city || ""}, ${node.content.country || ""}`.replace(/^,\s*/, "").replace(/,\s*$/, "")
          }
          if (genreEl && node.content.genre !== undefined) genreEl.textContent = node.content.genre
          if (priceEl && node.content.price !== undefined) {
            const raw = node.content.price
            priceEl.textContent = raw === "Free" ? "Free" : raw ? `€${raw}` : ""
          }
          if (timeEl && node.content.time !== undefined) timeEl.textContent = node.content.time
        }
      }

      if ((node.nodeType === "image" || node.nodeType === "background") && node.explicitStyle) {
        const contrast = node.style.contrast ?? 100
        const saturation = node.style.saturation ?? 100
        const brightness = node.style.brightness ?? 100
        const negative = node.style.negative ?? false
        const filterValue = `contrast(${contrast}%) saturate(${saturation}%) brightness(${brightness}%)${negative ? " invert(1)" : ""}`
        const img = el.tagName === "IMG" ? (el as HTMLImageElement) : el.querySelector("img")
        if (img) img.style.filter = filterValue
        else el.style.filter = filterValue
      }

      if (process.env.NODE_ENV !== "production" && traceNodeId && traceNodeId === node.nodeId) {
        console.info("[home-editor-state-applier][trace][after]", {
          nodeId: node.nodeId,
          domStyle: {
            transform: el.style.transform || null,
            opacity: el.style.opacity || null,
            width: el.style.width || null,
            height: el.style.height || null,
          },
        })
      }
      })
    }

    // First pass (current DOM), then re-apply on late mounts (async/fetch/motion sections).
    applyOverrides()

    const retryTimers: number[] = []
    ;[200, 800].forEach((ms) => {
      const timer = window.setTimeout(() => applyOverrides(), ms)
      retryTimers.push(timer)
    })

    const handleViewportChange = () => applyOverrides()
    const desktopQuery = window.matchMedia("(min-width: 1024px)")
    const editorModeObserver = new MutationObserver(() => applyOverrides())
    editorModeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-editor-active"] })
    window.addEventListener("resize", handleViewportChange)
    desktopQuery.addEventListener?.("change", handleViewportChange)

    return () => {
      retryTimers.forEach((id) => window.clearTimeout(id))
      editorModeObserver.disconnect()
      window.removeEventListener("resize", handleViewportChange)
      desktopQuery.removeEventListener?.("change", handleViewportChange)
    }
  }, [nodes])

  return null
}
