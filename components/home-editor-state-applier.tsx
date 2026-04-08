"use client"

import { useEffect } from "react"
import type { HomeEditorNodeOverride } from "@/lib/sanity/home-editor-state"

function escapeEditorId(id: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(id)
  }
  return id.replace(/(["\\#.:\[\]])/g, "\\$1")
}

export function HomeEditorStateApplier({ nodes }: { nodes: HomeEditorNodeOverride[] }) {
  useEffect(() => {
    if (!Array.isArray(nodes) || nodes.length === 0) return

    nodes.forEach((node) => {
      const selector = `[data-editor-node-id="${escapeEditorId(node.nodeId)}"]`
      const el = document.querySelector<HTMLElement>(selector)
      if (!el) return

      const scale = typeof node.style.scale === "number" ? Math.max(0.1, node.style.scale) : 1

      if (node.explicitPosition || (node.explicitStyle && scale !== 1)) {
        el.style.transform = scale !== 1
          ? `translate(${Math.round(node.geometry.x)}px, ${Math.round(node.geometry.y)}px) scale(${scale})`
          : `translate(${Math.round(node.geometry.x)}px, ${Math.round(node.geometry.y)}px)`
        el.style.transformOrigin = "top left"
      }

      if (node.explicitSize) {
        el.style.width = `${Math.max(8, Math.round(node.geometry.width))}px`
        el.style.height = `${Math.max(8, Math.round(node.geometry.height))}px`
      }

      if (node.explicitStyle) {
        if (node.style.opacity !== undefined) el.style.opacity = String(node.style.opacity)
        if (node.style.color) el.style.color = node.style.color
        if (node.style.backgroundColor) el.style.backgroundColor = node.style.backgroundColor
        if (node.style.fontSize) el.style.fontSize = node.style.fontSize
        if (node.style.fontFamily) el.style.fontFamily = node.style.fontFamily
        if (node.style.fontWeight) el.style.fontWeight = node.style.fontWeight
        if (node.style.fontStyle) el.style.fontStyle = node.style.fontStyle
        if (node.style.textDecoration) el.style.textDecoration = node.style.textDecoration
        if (node.style.minHeight) el.style.minHeight = node.style.minHeight
        if (node.style.paddingTop) el.style.paddingTop = node.style.paddingTop
        if (node.style.paddingBottom) el.style.paddingBottom = node.style.paddingBottom
      }

      if (node.explicitContent) {
        if ((node.nodeType === "text" || node.nodeType === "button") && node.content.text !== undefined) {
          el.textContent = node.content.text
        }
        if (node.nodeType === "button" && node.content.href && (el.tagName === "A" || el.tagName === "BUTTON")) {
          el.setAttribute("href", node.content.href)
        }

        if (node.nodeType === "background" && node.content.mediaKind === "video") {
          const iframe = el.querySelector("iframe")
          if (iframe && node.content.videoUrl) {
            iframe.setAttribute("src", node.content.videoUrl)
          }
        } else if (node.nodeType === "image" || node.nodeType === "background") {
          const img = el.tagName === "IMG" ? (el as HTMLImageElement) : el.querySelector("img")
          if (img && node.content.src) img.src = node.content.src
          if (img && node.content.alt !== undefined) img.alt = node.content.alt
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
    })
  }, [nodes])

  return null
}
