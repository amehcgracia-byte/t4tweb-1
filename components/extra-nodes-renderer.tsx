"use client"

import { useMemo, useSyncExternalStore, type CSSProperties } from "react"
import { createPortal } from "react-dom"
import { TEXT_EMPHASIS_SHADOW } from "@/lib/hero-layout-styles"
import type { HomeEditorNodeOverride } from "@/lib/sanity/home-editor-state"

type ExtraNodeKind = "text" | "button" | "card" | "overlay" | "section-divider" | "section" | "shade" | "background-image"

const EXTRA_NODE_PREFIX = "extra-"
const EXTRA_NODE_KINDS = new Set<ExtraNodeKind>(["text", "button", "card", "overlay", "section-divider", "section", "shade", "background-image"])

function roundNodeNumber(value: number): number {
  return Math.round(value * 1000) / 1000
}

function subscribeAfterHydration(onStoreChange: () => void): () => void {
  const timeout = window.setTimeout(onStoreChange, 0)
  return () => window.clearTimeout(timeout)
}

function getMountedSnapshot(): boolean {
  return true
}

function getServerSnapshot(): boolean {
  return false
}

function getExtraNodeKind(node: HomeEditorNodeOverride): ExtraNodeKind | null {
  if (!node.nodeId.startsWith(EXTRA_NODE_PREFIX)) return null
  const kind = node.content.extraNodeType || node.nodeType
  return typeof kind === "string" && EXTRA_NODE_KINDS.has(kind as ExtraNodeKind) ? kind as ExtraNodeKind : null
}

function getParentSectionId(node: HomeEditorNodeOverride): string | null {
  return typeof node.content.parentSection === "string" && node.content.parentSection.trim()
    ? node.content.parentSection.trim()
    : null
}

function buildExtraNodeStyle(node: HomeEditorNodeOverride, kind: ExtraNodeKind): CSSProperties {
  const scale = typeof node.style.scale === "number" && Number.isFinite(node.style.scale) ? roundNodeNumber(Math.max(0.1, node.style.scale)) : 1
  const x = roundNodeNumber(node.geometry.x)
  const y = roundNodeNumber(node.geometry.y)
  const width = roundNodeNumber(Math.max(8, node.geometry.width))
  const height = roundNodeNumber(Math.max(8, node.geometry.height))
  const style: CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    width: `${width}px`,
    height: `${height}px`,
    transform: scale !== 1 ? `translate(${x}px, ${y}px) scale(${scale})` : `translate(${x}px, ${y}px)`,
    transformOrigin: "top left",
    zIndex: kind === "overlay" || kind === "shade" || kind === "background-image" || kind === "section-divider" ? 8 : 20,
    color: node.style.color,
    backgroundColor: node.style.backgroundColor,
    fontSize: node.style.fontSize,
    fontFamily: node.style.fontFamily,
    fontWeight: node.style.fontWeight,
    fontStyle: node.style.fontStyle,
    textDecoration: node.style.textDecoration,
    textAlign: node.style.textAlign,
    display: kind === "button" ? "inline-flex" : kind === "text" || kind === "background-image" ? "block" : "flex",
    alignItems: kind === "text" ? undefined : "center",
    justifyContent: kind === "text" ? undefined : node.style.textAlign === "left" ? "flex-start" : node.style.textAlign === "right" ? "flex-end" : "center",
    padding: kind === "text" || kind === "background-image" || kind === "section-divider" || kind === "shade" ? undefined : kind === "button" ? "0 18px" : "16px",
    borderRadius: kind === "text" || kind === "section-divider" ? undefined : "8px",
    border: kind === "card" ? "1px solid rgba(255,255,255,0.18)" : undefined,
    backdropFilter: kind === "overlay" || kind === "shade" ? "blur(2px)" : undefined,
    pointerEvents: kind === "button" ? "auto" : "none",
    whiteSpace: kind === "text" ? "pre-wrap" : undefined,
    overflow: "hidden",
  }

  if (kind === "section") {
    style.minHeight = `${Math.max(120, node.geometry.height)}px`
    style.pointerEvents = "auto"
  }

  if (kind === "shade" || kind === "section-divider") {
    style.backgroundImage = `linear-gradient(180deg, ${node.style.gradientStart || node.style.backgroundColor || "rgba(0,0,0,0.55)"}, ${node.style.gradientEnd || "rgba(0,0,0,0)"})`
  }

  if (kind === "background-image" && typeof node.style.opacity === "number") {
    style.opacity = node.style.opacity
  }

  if (kind === "text" || kind === "button") {
    style.textShadow = node.style.textShadowEnabled ? TEXT_EMPHASIS_SHADOW : "none"
  }
  if ((kind === "text" || kind === "button") && node.style.gradientEnabled) {
    style.backgroundImage = `linear-gradient(90deg, ${node.style.gradientStart || "#FFB15A"}, ${node.style.gradientEnd || "#FF6C00"})`
    style.backgroundClip = "text"
    style.WebkitBackgroundClip = "text"
    style.WebkitTextFillColor = "transparent"
    style.color = "transparent"
  }

  return style
}

function buildExtraNodeAttrs(node: HomeEditorNodeOverride, kind: ExtraNodeKind, parentSectionId: string, ssrInline: boolean) {
  const attrs: Record<string, string | undefined> = {
    "data-extra-node-id": node.nodeId,
    "data-editor-node-id": node.nodeId,
    "data-editor-node-type": node.nodeType,
    "data-editor-section-id": parentSectionId,
    "data-editor-node-label": node.content.label || `Extra ${kind}`,
    "data-editor-extra-node": "true",
    "data-editor-extra-node-kind": kind,
    "data-editor-ssr-extra-node": ssrInline ? "true" : undefined,
    "data-editor-explicit-content": String(Boolean(node.explicitContent)),
    "data-editor-explicit-style": String(Boolean(node.explicitStyle)),
    "data-editor-explicit-position": String(Boolean(node.explicitPosition)),
    "data-editor-explicit-size": String(Boolean(node.explicitSize)),
    "data-editor-geometry-x": String(roundNodeNumber(node.geometry.x)),
    "data-editor-geometry-y": String(roundNodeNumber(node.geometry.y)),
    "data-editor-geometry-width": String(roundNodeNumber(node.geometry.width)),
    "data-editor-geometry-height": String(roundNodeNumber(node.geometry.height)),
  }

  if (typeof node.style.scale === "number") attrs["data-editor-style-scale"] = String(roundNodeNumber(node.style.scale))
  if (typeof node.style.color === "string") attrs["data-editor-style-color"] = node.style.color
  if (typeof node.style.backgroundColor === "string") attrs["data-editor-style-background-color"] = node.style.backgroundColor
  if (typeof node.style.textAlign === "string") attrs["data-editor-style-text-align"] = node.style.textAlign
  if (typeof node.style.textShadowEnabled === "boolean") attrs["data-editor-style-text-shadow-enabled"] = String(node.style.textShadowEnabled)
  if (typeof node.style.gradientEnabled === "boolean") attrs["data-editor-style-gradient-enabled"] = String(node.style.gradientEnabled)
  if (typeof node.style.gradientStart === "string") attrs["data-editor-style-gradient-start"] = node.style.gradientStart
  if (typeof node.style.gradientEnd === "string") attrs["data-editor-style-gradient-end"] = node.style.gradientEnd
  if (typeof node.content.text === "string") attrs["data-editor-content-text"] = node.content.text
  if (typeof node.content.href === "string") attrs["data-editor-href"] = node.content.href
  if (typeof node.content.src === "string") attrs["data-editor-src"] = node.content.src
  if (typeof node.content.alt === "string") attrs["data-editor-alt"] = node.content.alt
  if (kind === "background-image") attrs["data-editor-media-kind"] = "image"
  if (kind === "section-divider") attrs["data-editor-section-divider"] = "true"

  return attrs
}

function renderExtraNode(node: HomeEditorNodeOverride, kind: ExtraNodeKind, parentSectionId: string, ssrInline: boolean) {
  const commonProps = {
    ...buildExtraNodeAttrs(node, kind, parentSectionId, ssrInline),
    style: buildExtraNodeStyle(node, kind),
  }

  if (kind === "button") {
    return <a key={node.nodeId} {...commonProps} href={node.content.href || "#"}>{node.content.text || "New button"}</a>
  }

  if (kind === "background-image") {
    return (
      <div key={node.nodeId} {...commonProps} aria-hidden="true">
        {node.content.src ? (
          <img
            src={node.content.src}
            alt={node.content.alt || ""}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: `contrast(${node.style.contrast ?? 100}%) saturate(${node.style.saturation ?? 100}%) brightness(${node.style.brightness ?? 100}%)${node.style.negative ? " invert(1)" : ""}`,
            }}
          />
        ) : null}
      </div>
    )
  }

  return (
    <div key={node.nodeId} {...commonProps} aria-hidden={kind === "overlay" || kind === "shade" || kind === "section-divider" ? true : undefined}>
      {kind === "text" ? node.content.text || "New text" : null}
    </div>
  )
}

export function ExtraNodesRenderer({
  nodes,
  sectionId,
}: {
  nodes: HomeEditorNodeOverride[]
  sectionId?: string
}) {
  const mounted = useSyncExternalStore(subscribeAfterHydration, getMountedSnapshot, getServerSnapshot)
  const extraNodes = useMemo(
    () => nodes.filter((node) => getExtraNodeKind(node) !== null && (!sectionId || getParentSectionId(node) === sectionId)),
    [nodes, sectionId]
  )

  if (extraNodes.length === 0) return null

  if (sectionId) {
    return (
      <>
        {extraNodes.map((node) => {
          const kind = getExtraNodeKind(node)
          if (!kind) return null
          return renderExtraNode(node, kind, sectionId, true)
        })}
      </>
    )
  }

  if (!mounted) return null

  return (
    <>
      {extraNodes.map((node) => {
        const kind = getExtraNodeKind(node)
        const parentSectionId = getParentSectionId(node)
        if (!kind || !parentSectionId) return null
        const parent = document.querySelector<HTMLElement>(`[data-editor-node-id="${parentSectionId}"]`)
        if (!parent) return null
        
        // Verificar si este extra node ya existe en DOM y está marcado como eliminado
        const existing = parent.querySelector<HTMLElement>(`[data-extra-node-id="${node.nodeId}"]`)
        if (existing?.dataset.editorDeleted === "true") return null
        if (existing?.dataset.editorSsrExtraNode === "true") return null
        
        return createPortal(renderExtraNode(node, kind, parentSectionId, false), parent)
      })}
    </>
  )
}
