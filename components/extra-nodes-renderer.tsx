"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import type { HomeEditorNodeOverride } from "@/lib/sanity/home-editor-state"
import { TEXT_EMPHASIS_SHADOW, roundLayoutPx } from "@/lib/hero-layout-styles"

const ALLOWED_EXTRA_NODE_TYPES = new Set(["text", "button", "card", "overlay", "shade", "section-divider"])
const RESPONSIVE_BASE_WIDTH_FALLBACK = 1440
const RESPONSIVE_SCALE_MIN = 0.35
const RESPONSIVE_SCALE_MAX = 1.25

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function getAllowedExtraNodeType(node: HomeEditorNodeOverride): string | null {
  const explicitType = typeof node.content?.extraNodeType === "string" ? node.content.extraNodeType : ""
  const normalizedType =
    explicitType ||
    (node.nodeType === "overlay" ? "overlay" : node.nodeType === "background" ? "section-divider" : node.nodeType)
  return ALLOWED_EXTRA_NODE_TYPES.has(normalizedType) ? normalizedType : null
}

function scaleCssLength(value: string | undefined, factor: number): string | undefined {
  if (!value) return value
  const parts = value.trim().split(/\s+/)
  const scaled = parts.map((part) => {
    const match = part.match(/^(-?\d*\.?\d+)(px|rem|em)?$/)
    if (!match) return part
    const amount = Number(match[1])
    const unit = match[2] || "px"
    return `${roundLayoutPx(amount * factor)}${unit}`
  })
  return scaled.join(" ")
}

function scaleFontSize(value: string | undefined, factor: number): string | undefined {
  return scaleCssLength(value, factor)
}

function buildExtraNodeStyle(
  node: HomeEditorNodeOverride,
  kind: string,
  scaleFactor: number,
  pageOffsetX = 0,
  pageOffsetY = 0,
  allowPointerEvents = false
): CSSProperties {
  const nodeScale = typeof node.style.scale === "number" && Number.isFinite(node.style.scale) ? Math.max(0.1, node.style.scale) : 1
  const x = roundLayoutPx(pageOffsetX + node.geometry.x * scaleFactor)
  const y = roundLayoutPx(pageOffsetY + node.geometry.y * scaleFactor)
  const width = roundLayoutPx(Math.max(8, node.geometry.width * scaleFactor))
  const height = roundLayoutPx(Math.max(8, node.geometry.height * scaleFactor))
  const style: CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    width: `${width}px`,
    height: `${height}px`,
    transform: nodeScale !== 1 ? `translate(${x}px, ${y}px) scale(${nodeScale})` : `translate(${x}px, ${y}px)`,
    transformOrigin: "top left",
    zIndex: kind === "overlay" || kind === "shade" || kind === "section-divider" ? 8 : 20,
    color: node.style.color,
    backgroundColor: node.style.backgroundColor,
    fontSize: scaleFontSize(node.style.fontSize, scaleFactor),
    fontFamily: node.style.fontFamily,
    fontWeight: node.style.fontWeight,
    fontStyle: node.style.fontStyle,
    textDecoration: node.style.textDecoration,
    textAlign: node.style.textAlign,
    display: kind === "button" ? "inline-flex" : kind === "text" ? "block" : "flex",
    alignItems: kind === "text" ? undefined : "center",
    justifyContent:
      kind === "text"
        ? undefined
        : node.style.textAlign === "left"
          ? "flex-start"
          : node.style.textAlign === "right"
            ? "flex-end"
            : "center",
    padding: kind === "text" || kind === "section-divider" ? undefined : kind === "button" ? scaleCssLength("0 18px", scaleFactor) : scaleCssLength(node.style.padding || "16px", scaleFactor),
    borderRadius: kind === "text" || kind === "section-divider" ? undefined : scaleCssLength(node.style.borderRadius || "8px", scaleFactor),
    border: kind === "card" ? `1px solid ${node.style.borderColor || "rgba(255,255,255,0.18)"}` : undefined,
    backdropFilter: kind === "overlay" || kind === "shade" ? "blur(2px)" : undefined,
    pointerEvents: allowPointerEvents ? "auto" : kind === "overlay" || kind === "shade" || kind === "section-divider" ? "none" : "auto",
    whiteSpace: kind === "text" || kind === "card" || kind === "overlay" || kind === "shade" ? "pre-wrap" : undefined,
    overflow: "hidden",
  }

  if ((kind === "shade" || kind === "overlay" || kind === "section-divider") && (node.style.gradientEnabled || kind !== "overlay")) {
    style.backgroundImage = `linear-gradient(180deg, ${node.style.gradientStart || node.style.backgroundColor || "rgba(0,0,0,0.55)"}, ${node.style.gradientEnd || "rgba(0,0,0,0)"})`
  }

  if ((kind === "text" || kind === "button" || kind === "card" || kind === "overlay" || kind === "shade") && node.style.textShadowEnabled) {
    style.textShadow = TEXT_EMPHASIS_SHADOW
  }

  if ((kind === "text" || kind === "button" || kind === "card") && node.style.gradientEnabled) {
    style.backgroundImage = `linear-gradient(90deg, ${node.style.gradientStart || "#FFB15A"}, ${node.style.gradientEnd || "#FF6C00"})`
    style.backgroundClip = "text"
    style.WebkitBackgroundClip = "text"
    style.WebkitTextFillColor = "transparent"
    style.color = "transparent"
  }

  if (typeof node.style.opacity === "number") {
    style.opacity = node.style.opacity
  }

  return style
}

function getRenderedText(node: HomeEditorNodeOverride, kind: string): string {
  if (kind === "section-divider") return ""
  if (node.content?.title && kind === "card") {
    return `${node.content.title}${node.content?.text ? `\n${node.content.text}` : ""}`
  }
  return node.content?.text || ""
}

function renderExtraNode(node: HomeEditorNodeOverride, kind: string, style: CSSProperties) {
  const commonProps = {
    "data-extra-node-id": node.nodeId,
    "data-editor-node-id": node.nodeId,
    "data-editor-node-type": node.nodeType,
    "data-editor-node-label": node.content?.label || node.nodeId,
    "data-editor-section-id": typeof node.content?.parentSection === "string" ? node.content.parentSection : "",
    "data-editor-extra-node": "true",
    "data-editor-extra-node-kind": kind,
    "data-editor-explicit-content": String(Boolean(node.explicitContent)),
    "data-editor-explicit-style": String(Boolean(node.explicitStyle)),
    "data-editor-explicit-position": String(Boolean(node.explicitPosition)),
    "data-editor-explicit-size": String(Boolean(node.explicitSize)),
    "data-editor-geometry-x": String(roundLayoutPx(node.geometry.x)),
    "data-editor-geometry-y": String(roundLayoutPx(node.geometry.y)),
    "data-editor-geometry-width": String(roundLayoutPx(node.geometry.width)),
    "data-editor-geometry-height": String(roundLayoutPx(node.geometry.height)),
    "data-editor-style-scale": String(typeof node.style.scale === "number" ? node.style.scale : 1),
    "data-editor-style-color": node.style.color,
    "data-editor-style-background-color": node.style.backgroundColor,
    "data-editor-style-text-align": node.style.textAlign,
    "data-editor-style-text-shadow-enabled": typeof node.style.textShadowEnabled === "boolean" ? String(node.style.textShadowEnabled) : undefined,
    "data-editor-style-gradient-enabled": typeof node.style.gradientEnabled === "boolean" ? String(node.style.gradientEnabled) : undefined,
    "data-editor-style-gradient-start": node.style.gradientStart,
    "data-editor-style-gradient-end": node.style.gradientEnd,
    "data-editor-content-text": node.content?.text,
    "data-editor-href": node.content?.href,
    style,
  }

  if (kind === "button") {
    return (
      <a key={node.nodeId} {...commonProps} href={node.content?.href || "#"}>
        {node.content?.text || "New button"}
      </a>
    )
  }

  return <div key={node.nodeId} {...commonProps}>{getRenderedText(node, kind)}</div>
}

export function ExtraNodesRenderer({
  nodes,
  sectionId,
  allowPointerEvents = false,
}: {
  nodes: HomeEditorNodeOverride[]
  sectionId?: string
  allowPointerEvents?: boolean
}) {
  const [mounted, setMounted] = useState(false)
  const [, setLayoutVersion] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (allowPointerEvents || !mounted || typeof window === "undefined") return
    const update = () => setLayoutVersion((value) => value + 1)
    const onResize = () => update()
    window.addEventListener("resize", onResize)
    window.addEventListener("orientationchange", onResize)
    window.addEventListener("load", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("orientationchange", onResize)
      window.removeEventListener("load", onResize)
    }
  }, [allowPointerEvents, mounted])

  const activeNodes = useMemo(() => {
    return nodes.filter((node) => {
      if (!node.nodeId.startsWith("extra-")) return false
      const parentSectionId = typeof node.content?.parentSection === "string" ? node.content.parentSection : ""
      if (sectionId && parentSectionId !== sectionId) return false
      if (!sectionId && parentSectionId === "hero-section") return false
      return Boolean(getAllowedExtraNodeType(node))
    })
  }, [nodes, sectionId])

  if (allowPointerEvents || !mounted || activeNodes.length === 0) return null

  if (sectionId) {
    const parent = typeof document !== "undefined" ? document.querySelector<HTMLElement>(`[data-editor-node-id="${sectionId}"]`) : null
    const sectionWidth = parent?.getBoundingClientRect().width || RESPONSIVE_BASE_WIDTH_FALLBACK
    return (
      <>
        {activeNodes.map((node) => {
          const kind = getAllowedExtraNodeType(node)
          if (!kind) return null
          const baseWidth = typeof node.content?.baseWidth === "number" && Number.isFinite(node.content.baseWidth) && node.content.baseWidth > 0
            ? node.content.baseWidth
            : RESPONSIVE_BASE_WIDTH_FALLBACK
          const scaleFactor = clamp(sectionWidth / baseWidth, RESPONSIVE_SCALE_MIN, RESPONSIVE_SCALE_MAX)
          return renderExtraNode(node, kind, buildExtraNodeStyle(node, kind, scaleFactor, 0, 0, false))
        })}
      </>
    )
  }

  const docHeight = typeof document !== "undefined" ? Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) : 0

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: `${docHeight}px`,
        zIndex: 25,
      }}
    >
      {activeNodes.map((node) => {
        const kind = getAllowedExtraNodeType(node)
        if (!kind) return null
        const parentSectionId = typeof node.content?.parentSection === "string" ? node.content.parentSection : ""
        const parent = typeof document !== "undefined" ? document.querySelector<HTMLElement>(`[data-editor-node-id="${parentSectionId}"]`) : null
        if (!parent) return null
        const parentRect = parent.getBoundingClientRect()
        const pageOffsetX = parentRect.left + window.scrollX
        const pageOffsetY = parentRect.top + window.scrollY
        const baseWidth = typeof node.content?.baseWidth === "number" && Number.isFinite(node.content.baseWidth) && node.content.baseWidth > 0
          ? node.content.baseWidth
          : RESPONSIVE_BASE_WIDTH_FALLBACK
        const scaleFactor = clamp(parentRect.width / baseWidth, RESPONSIVE_SCALE_MIN, RESPONSIVE_SCALE_MAX)
        return renderExtraNode(node, kind, buildExtraNodeStyle(node, kind, scaleFactor, pageOffsetX, pageOffsetY, false))
      })}
    </div>
  )
}
