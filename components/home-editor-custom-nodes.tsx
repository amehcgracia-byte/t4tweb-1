"use client"

import { useMemo, type CSSProperties } from "react"
import { useVisualEditor } from "@/components/visual-editor"
import type { HomeEditorNodeOverride } from "@/lib/sanity/home-editor-state"

function styleForNode(node: HomeEditorNodeOverride): CSSProperties {
  const style: CSSProperties = {
    position: "absolute",
    left: Math.round(node.geometry.x),
    top: Math.round(node.geometry.y),
    width: Math.max(8, Math.round(node.geometry.width)),
    minHeight: Math.max(8, Math.round(node.geometry.height)),
    boxSizing: "border-box",
  }
  const saved = node.style
  if (saved.opacity !== undefined) style.opacity = saved.opacity
  if (saved.color) style.color = saved.color
  if (saved.backgroundColor) style.backgroundColor = saved.backgroundColor
  if (saved.fontSize) style.fontSize = saved.fontSize
  if (saved.fontFamily) style.fontFamily = saved.fontFamily
  if (saved.fontWeight) style.fontWeight = saved.fontWeight
  if (saved.fontStyle) style.fontStyle = saved.fontStyle as CSSProperties["fontStyle"]
  if (saved.textDecoration) style.textDecoration = saved.textDecoration
  if (saved.textAlign) style.textAlign = saved.textAlign
  if (saved.textTransform) style.textTransform = saved.textTransform
  if (saved.textShadow) style.textShadow = saved.textShadow
  if (saved.borderColor) style.borderColor = saved.borderColor
  if (saved.borderWidth) style.borderWidth = saved.borderWidth
  if (saved.borderRadius) style.borderRadius = saved.borderRadius
  if (saved.boxShadow) style.boxShadow = saved.boxShadow
  if (saved.paddingLeft) style.paddingLeft = saved.paddingLeft
  if (saved.paddingRight) style.paddingRight = saved.paddingRight
  if (saved.paddingTop) style.paddingTop = saved.paddingTop
  if (saved.paddingBottom) style.paddingBottom = saved.paddingBottom
  if (node.content.gradientEnabled) {
    style.backgroundImage = `linear-gradient(135deg, ${node.content.gradientStart || "#FFB15A"}, ${node.content.gradientEnd || "#FF6C00"})`
  }
  if (typeof saved.scale === "number" && saved.scale !== 1) {
    style.transform = `scale(${Math.max(0.1, saved.scale)})`
    style.transformOrigin = "top left"
  }
  return style
}

function normalizeCustomNode(node: HomeEditorNodeOverride): HomeEditorNodeOverride {
  return {
    ...node,
    content: {
      ...node.content,
      customKind: node.content.customKind || (node.nodeType === "section" || node.nodeType === "button" || node.nodeType === "text" ? node.nodeType : "text"),
    },
  }
}

export function HomeEditorCustomNodes({ persistedNodes }: { persistedNodes: HomeEditorNodeOverride[] }) {
  const { isEditing, nodes } = useVisualEditor()
  const customNodes = useMemo(() => {
    const persisted = persistedNodes.filter((node) => node.nodeId.startsWith("custom-")).map(normalizeCustomNode)
    const current = isEditing
      ? Array.from(nodes.values()).filter((node) => node.id.startsWith("custom-")).map((node) => normalizeCustomNode({
          nodeId: node.id,
          nodeType: node.type,
          geometry: node.geometry,
          style: node.style,
          content: node.content,
          explicitContent: node.explicitContent,
          explicitStyle: node.explicitStyle,
          explicitPosition: node.explicitPosition,
          explicitSize: node.explicitSize,
          updatedAt: new Date().toISOString(),
        }))
      : []
    const byId = new Map(persisted.map((node) => [node.nodeId, node]))
    current.forEach((node) => byId.set(node.nodeId, node))
    return Array.from(byId.values())
  }, [isEditing, nodes, persistedNodes])

  if (customNodes.length === 0) return null

  return (
    <section
      data-editor-custom-canvas
      aria-label="Custom editor content"
      className="relative mx-auto mt-12 min-h-[280px] w-full max-w-6xl overflow-hidden border-t border-white/10 px-4 py-4"
    >
      {customNodes.map((node) => {
        const kind = node.content.customKind || node.nodeType
        const common = {
          "data-editor-node-id": node.nodeId,
          "data-editor-node-type": kind,
          "data-editor-node-label": node.nodeId,
          style: styleForNode(node),
        }
        if (kind === "button") {
          return <a key={node.nodeId} {...common} href={node.content.href || "#"} className="inline-flex items-center justify-center">{node.content.text || "New button"}</a>
        }
        if (kind === "section") {
          return <div key={node.nodeId} {...common} className="rounded border border-white/20">{node.content.text || "New section"}</div>
        }
        return <div key={node.nodeId} {...common}>{node.content.text || "New text"}</div>
      })}
    </section>
  )
}
