import type { CSSProperties } from "react"

/** Integer px avoids subpixel drift between editor measure, Sanity JSON, and SSR. */
export function roundLayoutPx(n: number): number {
  return Math.round(n)
}

/**
 * Default hero layout: same as visual-editor `applyNodeToDom` for non-scroll nodes —
 * `translate(x,y)` with `transform-origin: top left`.
 */
export function buildHeroStandardLayoutStyle(opts: {
  x: number
  y: number
  scale?: number
  width?: number
  height?: number
}): CSSProperties {
  const tx = roundLayoutPx(opts.x)
  const ty = roundLayoutPx(opts.y)
  const scaleVal = opts.scale ?? 1
  const needScale = typeof opts.scale === "number" && scaleVal !== 1
  const parts: string[] = [`translate(${tx}px, ${ty}px)`]
  if (needScale) parts.push(`scale(${scaleVal})`)
  const result: CSSProperties = {
    transform: parts.join(" "),
    transformOrigin: "top left",
  }
  if (typeof opts.width === "number") result.width = `${roundLayoutPx(opts.width)}px`
  if (typeof opts.height === "number") result.height = `${roundLayoutPx(opts.height)}px`
  return result
}

/**
 * Scroll block: centered with `left: 50%` + `translate(calc(-50% + x), y)` so x/y match
 * what you see after save (must match `applyScrollIndicatorLayoutToElement` in the editor).
 */
export function buildHeroScrollIndicatorLayoutStyle(opts: {
  x: number
  y: number
  scale?: number
  width?: number
  height?: number
}): CSSProperties {
  const tx = roundLayoutPx(opts.x)
  const ty = roundLayoutPx(opts.y)
  const scaleVal = opts.scale ?? 1
  const needScale = typeof opts.scale === "number" && scaleVal !== 1
  const parts: string[] = [`translate(calc(-50% + ${tx}px), ${ty}px)`]
  if (needScale) parts.push(`scale(${scaleVal})`)
  const result: CSSProperties = {
    left: "50%",
    bottom: "1rem",
    transform: parts.join(" "),
    transformOrigin: "center bottom",
  }
  if (typeof opts.width === "number") result.width = opts.width
  if (typeof opts.height === "number") result.height = opts.height
  return result
}

/** Apply scroll layout to a live DOM node (visual editor) — keeps parity with public CSS. */
export function applyScrollIndicatorLayoutToElement(
  el: HTMLElement,
  g: { x: number; y: number; width: number; height: number },
  nodeScale: number
): void {
  const tx = roundLayoutPx(g.x)
  const ty = roundLayoutPx(g.y)
  el.style.left = "50%"
  el.style.bottom = "1rem"
  el.style.transformOrigin = "center bottom"
  const parts: string[] = [`translate(calc(-50% + ${tx}px), ${ty}px)`]
  if (nodeScale !== 1) parts.push(`scale(${nodeScale})`)
  el.style.transform = parts.join(" ")
}

export function clearScrollIndicatorLayoutFromElement(el: HTMLElement): void {
  el.style.removeProperty("left")
  el.style.removeProperty("bottom")
  el.style.removeProperty("transform")
  el.style.removeProperty("transform-origin")
}
