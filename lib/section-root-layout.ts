import type { CSSProperties } from "react"
import { SAFE_FLOW_PROTECTED_SECTION_IDS, SAFE_SECTION_MIN_GAP } from "@/lib/editor-default-layout"
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

function isProtectedRootSection(nodeId: string): boolean {
  return SAFE_FLOW_PROTECTED_SECTION_IDS.includes(nodeId as (typeof SAFE_FLOW_PROTECTED_SECTION_IDS)[number])
}

export function getCanonicalRootSectionGap(nodeId: string, rawY: unknown, minGap = SAFE_SECTION_MIN_GAP): number {
  if (typeof rawY !== "number" || !Number.isFinite(rawY)) return 0
  const rounded = roundLayoutPx(rawY)
  if (!isProtectedRootSection(nodeId)) return rounded
  if (nodeId === "about-section") return Math.max(0, rounded)
  return Math.max(minGap, rounded)
}

export function getCanonicalRootSectionStyle(
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

  if (typeof y === "number" && Number.isFinite(y) && Math.abs(y) <= maxAbsY) {
    const normalizedY = isProtectedRootSection(nodeId)
      ? getCanonicalRootSectionGap(nodeId, y)
      : clampNegativeYToZero && y < 0
        ? 0
        : y
    if (normalizedY !== 0) style.marginTop = `${roundLayoutPx(normalizedY)}px`
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
