import type { CSSProperties } from "react"
import type { HomeEditorNodeOverride } from "@/lib/sanity/home-editor-state"

type PersistedStyle = CSSProperties & Record<`--${string}`, string>

export interface HomeEditorPersistedProps {
  style?: PersistedStyle
  "data-editor-explicit-content"?: string
  "data-editor-explicit-style"?: string
  "data-editor-explicit-position"?: string
  "data-editor-explicit-size"?: string
  "data-editor-geometry-x"?: string
  "data-editor-geometry-y"?: string
  "data-editor-geometry-width"?: string
  "data-editor-geometry-height"?: string
  "data-editor-persisted-layout"?: "footer"
  "data-editor-persisted-transform"?: "true"
  "data-editor-persisted-size"?: "true"
}

function addStyleValue(style: PersistedStyle, key: keyof CSSProperties, value: unknown): void {
  if (typeof value === "string" && value.trim()) {
    style[key] = value as never
  }
}

/**
 * Serialize a saved editor node onto server-rendered markup.
 *
 * The client applier remains the source of truth for normal sections. Footer
 * and divider nodes also use this helper so their published first render is
 * identical to the editor state instead of waiting for hydration.
 */
export function getHomeEditorPersistedProps(
  override: HomeEditorNodeOverride | undefined,
  layout: "footer" | undefined = undefined,
): HomeEditorPersistedProps {
  if (!override) return {}

  const style: PersistedStyle = {}
  const scale = typeof override.style.scale === "number" ? Math.max(0.1, override.style.scale) : 1
  const hasTransform = override.explicitPosition || (override.explicitStyle && scale !== 1)
  if (hasTransform) {
    style["--editor-managed-transform"] = scale !== 1
      ? `translate(${Math.round(override.geometry.x)}px, ${Math.round(override.geometry.y)}px) scale(${scale})`
      : `translate(${Math.round(override.geometry.x)}px, ${Math.round(override.geometry.y)}px)`
    style["--editor-managed-transform-origin"] = "top left"
  }
  if (override.explicitSize) {
    style["--editor-managed-width"] = `${Math.max(8, Math.round(override.geometry.width))}px`
    style["--editor-managed-height"] = `${Math.max(8, Math.round(override.geometry.height))}px`
  }

  if (override.explicitStyle) {
    if (override.style.opacity !== undefined) style.opacity = override.style.opacity
    addStyleValue(style, "color", override.style.color)
    addStyleValue(style, "backgroundColor", override.style.backgroundColor)
    addStyleValue(style, "fontSize", override.style.fontSize)
    addStyleValue(style, "fontFamily", override.style.fontFamily)
    addStyleValue(style, "fontWeight", override.style.fontWeight)
    addStyleValue(style, "fontStyle", override.style.fontStyle)
    addStyleValue(style, "textDecoration", override.style.textDecoration)
    addStyleValue(style, "textAlign", override.style.textAlign)
    addStyleValue(style, "textTransform", override.style.textTransform)
    addStyleValue(style, "textShadow", override.style.textShadow)
    addStyleValue(style, "borderColor", override.style.borderColor)
    addStyleValue(style, "borderWidth", override.style.borderWidth)
    addStyleValue(style, "borderRadius", override.style.borderRadius)
    addStyleValue(style, "boxShadow", override.style.boxShadow)
    addStyleValue(style, "paddingLeft", override.style.paddingLeft)
    addStyleValue(style, "paddingRight", override.style.paddingRight)
    addStyleValue(style, "letterSpacing", override.style.letterSpacing)
    addStyleValue(style, "lineHeight", override.style.lineHeight)
    addStyleValue(style, "maxWidth", override.style.maxWidth)
    addStyleValue(style, "minHeight", override.style.minHeight)
    addStyleValue(style, "paddingTop", override.style.paddingTop)
    addStyleValue(style, "paddingBottom", override.style.paddingBottom)
  }

  return {
    style: Object.keys(style).length > 0 ? style : undefined,
    "data-editor-explicit-content": String(override.explicitContent),
    "data-editor-explicit-style": String(override.explicitStyle),
    "data-editor-explicit-position": String(override.explicitPosition),
    "data-editor-explicit-size": String(override.explicitSize),
    "data-editor-geometry-x": String(Math.round(override.geometry.x)),
    "data-editor-geometry-y": String(Math.round(override.geometry.y)),
    "data-editor-geometry-width": String(Math.round(override.geometry.width)),
    "data-editor-geometry-height": String(Math.round(override.geometry.height)),
    ...(layout ? { "data-editor-persisted-layout": layout } : {}),
    ...(layout && hasTransform ? {
      "data-editor-persisted-transform": "true" as const,
    } : {}),
    ...(layout && override.explicitSize ? {
      "data-editor-persisted-size": "true" as const,
    } : {}),
  }
}
