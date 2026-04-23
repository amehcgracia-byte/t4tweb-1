"use client"

import { useEffect, useRef } from "react"
import type { CSSProperties } from "react"
import { motion } from "framer-motion"
import { useVisualEditor } from "@/components/visual-editor"
import type { HomeEditorNodeOverride } from "@/lib/sanity/home-editor-state"

interface SectionDividerProps {
  editorId: string
  state?: HomeEditorNodeOverride | null
}

function getSectionDividerStyle(state: HomeEditorNodeOverride | null | undefined): CSSProperties {
  const style: CSSProperties = {}
  const geometry = state?.geometry
  const nodeStyle = state?.style || {}

  if (state?.explicitPosition && geometry) {
    style.transform = `translate(${geometry.x}px, ${geometry.y}px)`
    style.transformOrigin = "top left"
  }
  if (state?.explicitSize && geometry) {
    style.width = `${Math.max(8, geometry.width)}px`
    style.height = `${Math.max(8, geometry.height)}px`
  }
  if (state?.explicitStyle && typeof nodeStyle.scale === "number") {
    const existingTransform = typeof style.transform === "string" ? style.transform : ""
    style.transform = `${existingTransform} scale(${nodeStyle.scale})`.trim()
    style.transformOrigin = "top left"
  }
  if (state?.explicitStyle && typeof nodeStyle.opacity === "number") style.opacity = nodeStyle.opacity
  if (state?.explicitStyle && typeof nodeStyle.backgroundColor === "string") style.backgroundColor = nodeStyle.backgroundColor
  if (state?.explicitStyle && (typeof nodeStyle.gradientStart === "string" || typeof nodeStyle.gradientEnd === "string")) {
    style.background = `linear-gradient(180deg, ${nodeStyle.gradientStart || nodeStyle.backgroundColor || "rgba(0,0,0,0.65)"}, ${nodeStyle.gradientEnd || "rgba(0,0,0,0.05)"})`
  }

  return style
}

function getSectionDividerEditorAttrs(state: HomeEditorNodeOverride | null | undefined): Record<string, string> {
  if (!state) return {}
  const attrs: Record<string, string> = {}
  const geometry = state.geometry
  const style = state.style || {}
  if (state.explicitPosition) attrs["data-editor-explicit-position"] = "true"
  if (state.explicitSize) attrs["data-editor-explicit-size"] = "true"
  if (state.explicitStyle) attrs["data-editor-explicit-style"] = "true"
  if (state.explicitPosition && geometry) {
    attrs["data-editor-geometry-x"] = String(geometry.x)
    attrs["data-editor-geometry-y"] = String(geometry.y)
  }
  if (state.explicitSize && geometry) {
    attrs["data-editor-geometry-width"] = String(geometry.width)
    attrs["data-editor-geometry-height"] = String(geometry.height)
  }
  if (state.explicitStyle && typeof style.scale === "number") attrs["data-editor-style-scale"] = String(style.scale)
  if (state.explicitStyle && typeof style.backgroundColor === "string") attrs["data-editor-style-background-color"] = style.backgroundColor
  if (state.explicitStyle && typeof style.gradientStart === "string") attrs["data-editor-style-gradient-start"] = style.gradientStart
  if (state.explicitStyle && typeof style.gradientEnd === "string") attrs["data-editor-style-gradient-end"] = style.gradientEnd
  return attrs
}

export function SectionDivider({ editorId, state = null }: SectionDividerProps) {
  const dividerRef = useRef<HTMLDivElement>(null)
  const { isEditing, registerEditable, unregisterEditable } = useVisualEditor()

  useEffect(() => {
    if (!isEditing || !dividerRef.current) return

    registerEditable({
      id: editorId,
      type: "background",
      label: "Section Divider",
      parentId: null,
      element: dividerRef.current,
      originalRect: dividerRef.current.getBoundingClientRect(),
      transform: { x: 0, y: 0 },
      dimensions: { width: dividerRef.current.offsetWidth, height: dividerRef.current.offsetHeight },
    })

    return () => {
      unregisterEditable(editorId)
    }
  }, [editorId, isEditing, registerEditable, unregisterEditable])

  return (
    <motion.div
      ref={dividerRef}
      data-editor-node-id={editorId}
      data-editor-node-type="background"
      data-editor-node-label="Section Divider"
      data-editor-section-divider="true"
      data-editor-media-kind="section-divider"
      {...getSectionDividerEditorAttrs(state)}
      className="relative z-40 h-6 w-full bg-gradient-to-b from-black via-black/10 to-black/5 md:h-8"
      style={getSectionDividerStyle(state)}
    />
  )
}
