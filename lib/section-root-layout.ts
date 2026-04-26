import type { CSSProperties } from "react"
import { getElementLayoutStyle, roundLayoutPx } from "@/lib/hero-layout-styles"

interface SectionRootLayoutOptions {
  maxAbsX?: number
  maxAbsY?: number
  clampNegativeYToZero?: boolean
}

export function getSectionRootFlowStyle(
  elementStyles: Record<string, unknown> | undefined,
  nodeId: string,
  options: SectionRootLayoutOptions = {}
): CSSProperties {
  const rawStyle = elementStyles?.[nodeId]
  const style = { ...getElementLayoutStyle(elementStyles, nodeId, { includeGeometry: false }) }

  if (!rawStyle || typeof rawStyle !== "object") {
    delete style.opacity
    delete style.transform
    delete style.transformOrigin
    delete style.width
    delete style.height
    return style
  }

  const styles = rawStyle as Record<string, unknown>
  const x = styles.x
  const y = styles.y
  const maxAbsX = options.maxAbsX ?? 4000
  const maxAbsY = options.maxAbsY ?? 4000
  const clampNegativeYToZero = options.clampNegativeYToZero ?? true

  if (typeof x === "number" && Number.isFinite(x) && Math.abs(x) <= maxAbsX && x !== 0) {
    style.marginLeft = `${roundLayoutPx(x)}px`
  }

  if (typeof y === "number" && Number.isFinite(y) && Math.abs(y) <= maxAbsY && y !== 0) {
    const normalizedY = clampNegativeYToZero && y < 0 ? 0 : y
    if (normalizedY !== 0) {
      style.marginTop = `${roundLayoutPx(normalizedY)}px`
    }
  }

  delete style.opacity
  delete style.transform
  delete style.transformOrigin
  delete style.width
  delete style.height

  if (typeof styles.backgroundColor === "string") {
    style.backgroundColor = styles.backgroundColor
    style.backgroundImage = "none"
  }

  return style
}
