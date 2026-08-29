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
 * Replays the editor's Hero background framing without translating the
 * viewport-sized wrapper itself. Moving that wrapper can expose its black
 * parent on the public page; object-position keeps the image clipped to the
 * full Hero while preserving the saved vertical crop.
 */
export function buildHeroBackgroundImageLayoutStyle(opts: {
  x: number
  y: number
  scale?: number
}): CSSProperties {
  const tx = roundLayoutPx(opts.x)
  const ty = roundLayoutPx(opts.y)
  const scaleVal = typeof opts.scale === "number" ? Math.max(1, opts.scale) : 1

  const result: CSSProperties = {
    // Keep the full-bleed image from creating a horizontal black strip when
    // the editor was measured on a different desktop width. Vertical crop is
    // safe because the square Hero asset has extra cover height on desktop.
    objectPosition: `center ${ty}px`,
  }

  if (scaleVal !== 1) {
    result.transform = `scale(${scaleVal})`
    result.transformOrigin = "center center"
  }

  // Keep x in the helper's contract for callers that need to inspect the
  // saved geometry, while deliberately not translating the public full-bleed
  // image horizontally and risking an empty edge.
  void tx
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
    bottom: "0.5rem",
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
  el.style.bottom = "0.5rem"
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

/**
 * Maps CMS `elementStyles` map entries to inline CSS (hero, navigation, etc.).
 * Same rules as visual-editor `applyNodeToDom` for non-scroll nodes.
 */
export function getElementLayoutStyle(
  elementStyles: Record<string, unknown> | undefined,
  targetId: string,
  options?: {
    includeGeometry?: boolean
    /**
     * Saved editor typography is measured in desktop pixels. It must only be
     * restored while editing on a desktop viewport; public/mobile layouts use
     * the component's responsive classes instead.
     */
    includeResponsiveTypography?: boolean
  }
): CSSProperties {
  if (!elementStyles || !elementStyles[targetId]) return {}

  const styles = elementStyles[targetId] as Record<string, unknown>
  const includeGeometry = options?.includeGeometry ?? true
  const includeResponsiveTypography = options?.includeResponsiveTypography ?? includeGeometry
  const isViewportContainer = targetId === "hero-section" || targetId === "intro-section"
  const hasX = typeof styles.x === "number"
  const hasY = typeof styles.y === "number"
  const tx = hasX ? roundLayoutPx(styles.x as number) : 0
  const ty = hasY ? roundLayoutPx(styles.y as number) : 0
  const scaleVal = typeof styles.scale === "number" ? styles.scale : 1
  const needTranslate = hasX || hasY
  const needScale = typeof styles.scale === "number" && scaleVal !== 1
  const respectSavedGeometry = styles.responsiveLayout !== true || styles.respectPosition === true
  // The hero and intro are viewport-wide containers. Their saved editor
  // measurements describe the viewport on which they were edited and must not
  // turn into fixed-width sections on another monitor.
  const shouldApplyGeometry = includeGeometry && respectSavedGeometry && !isViewportContainer && (needTranslate || needScale)

  const layout =
    shouldApplyGeometry
      ? buildHeroStandardLayoutStyle({
          x: tx,
          y: ty,
          scale: needScale ? scaleVal : undefined,
          width:
            includeGeometry && typeof styles.width === "number"
              ? roundLayoutPx(styles.width as number)
              : undefined,
          height:
            includeGeometry && typeof styles.height === "number"
              ? roundLayoutPx(styles.height as number)
              : undefined,
        })
      : {}

  const result: CSSProperties = { ...layout }

  if (includeGeometry && respectSavedGeometry && !isViewportContainer && !shouldApplyGeometry) {
    if (typeof styles.width === "number") result.width = `${roundLayoutPx(styles.width as number)}px`
    if (typeof styles.height === "number") result.height = `${roundLayoutPx(styles.height as number)}px`
  }
  if (includeResponsiveTypography && typeof styles.fontSize === "number") {
    result.fontSize = `${styles.fontSize}px`
  }
  if (typeof styles.fontWeight === "number") result.fontWeight = styles.fontWeight
  if (includeResponsiveTypography && typeof styles.letterSpacing === "number") {
    result.letterSpacing = `${styles.letterSpacing}px`
  }
  if (includeResponsiveTypography && typeof styles.lineHeight === "number") {
    // Persisted editor line-height values are measured in px. Passing a
    // number to React/CSS makes it unitless (e.g. 27 => 27em-like scaling),
    // which can turn a normal navigation button into a several-hundred-pixel
    // block. Keep numeric values in the same px contract as fontSize.
    result.lineHeight = `${styles.lineHeight}px`
  }
  if (typeof styles.color === "string") result.color = styles.color
  if (includeResponsiveTypography && typeof styles.maxWidth === "number") {
    result.maxWidth = `${styles.maxWidth}px`
  }
  if (typeof styles.opacity === "number") result.opacity = styles.opacity
  if (typeof styles.backgroundColor === "string") result.backgroundColor = styles.backgroundColor
  if (typeof styles.fontFamily === "string") result.fontFamily = styles.fontFamily
  if (typeof styles.fontStyle === "string") result.fontStyle = styles.fontStyle as CSSProperties["fontStyle"]
  if (typeof styles.textDecoration === "string") result.textDecoration = styles.textDecoration
  if (typeof styles.textAlign === "string") result.textAlign = styles.textAlign as CSSProperties["textAlign"]
  if (typeof styles.textTransform === "string") result.textTransform = styles.textTransform as CSSProperties["textTransform"]
  if (typeof styles.textShadow === "string") result.textShadow = styles.textShadow
  if (typeof styles.borderColor === "string") result.borderColor = styles.borderColor
  if (typeof styles.borderWidth === "string") result.borderWidth = styles.borderWidth
  if (typeof styles.borderRadius === "string") result.borderRadius = styles.borderRadius
  if (typeof styles.boxShadow === "string") result.boxShadow = styles.boxShadow
  if (typeof styles.paddingLeft === "string") result.paddingLeft = styles.paddingLeft
  if (typeof styles.paddingRight === "string") result.paddingRight = styles.paddingRight
  if (typeof styles.objectFit === "string") result.objectFit = styles.objectFit as CSSProperties["objectFit"]
  if (typeof styles.objectPosition === "string") result.objectPosition = styles.objectPosition
  if (typeof styles.minHeight === "string") result.minHeight = styles.minHeight
  if (typeof styles.paddingTop === "string") result.paddingTop = styles.paddingTop
  if (typeof styles.paddingBottom === "string") result.paddingBottom = styles.paddingBottom

  return result
}
