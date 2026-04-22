"use client"

import { useEffect, useRef, type CSSProperties } from "react"
import { useVisualEditor } from "@/components/visual-editor"
import { getElementLayoutStyle } from "@/lib/hero-layout-styles"
import type { IntroBannerData } from "@/lib/sanity/intro-banner-loader"

function getIntroBoxPatternStyle(elementStyles: IntroBannerData["elementStyles"], targetId: string): CSSProperties {
  const style = { ...getElementLayoutStyle(elementStyles, targetId, { includeGeometry: true }) }
  delete style.opacity

  const persistedStyle = elementStyles[targetId]
  if (typeof persistedStyle?.backgroundColor === "string") {
    style.backgroundColor = persistedStyle.backgroundColor
    style.backgroundImage = "none"
  }

  return style
}

function getIntroGifStyle(elementStyles: IntroBannerData["elementStyles"]): CSSProperties {
  return {
    opacity: 0.3,
    ...getElementLayoutStyle(elementStyles, "intro-banner-gif", { includeGeometry: true }),
  }
}

function getIntroTextPatternStyle(elementStyles: IntroBannerData["elementStyles"], targetId: string): CSSProperties {
  const style = { ...getElementLayoutStyle(elementStyles, targetId, { includeGeometry: true }) }
  const persistedStyle = elementStyles[targetId]
  if (persistedStyle?.gradientEnabled === false) {
    style.backgroundImage = "none"
    style.backgroundClip = "initial"
    style.WebkitBackgroundClip = "initial"
    style.WebkitTextFillColor = typeof style.color === "string" ? style.color : "currentColor"
  }
  return style
}

function getIntroEditorAttrs(elementStyles: IntroBannerData["elementStyles"], targetId: string): Record<string, string> {
  const styles = elementStyles[targetId] || {}
  const attrs: Record<string, string> = {}
  const hasPosition = typeof styles.x === "number" || typeof styles.y === "number"
  const hasSize = typeof styles.width === "number" || typeof styles.height === "number"
  const hasStyle = Object.keys(styles).some((key) => !["x", "y", "width", "height"].includes(key))

  if (hasPosition) attrs["data-editor-explicit-position"] = "true"
  if (hasSize) attrs["data-editor-explicit-size"] = "true"
  if (hasStyle) attrs["data-editor-explicit-style"] = "true"
  if (typeof styles.x === "number") attrs["data-editor-geometry-x"] = String(styles.x)
  if (typeof styles.y === "number") attrs["data-editor-geometry-y"] = String(styles.y)
  if (typeof styles.width === "number") attrs["data-editor-geometry-width"] = String(styles.width)
  if (typeof styles.height === "number") attrs["data-editor-geometry-height"] = String(styles.height)
  if (typeof styles.scale === "number") attrs["data-editor-style-scale"] = String(styles.scale)
  if (typeof styles.color === "string") attrs["data-editor-style-color"] = styles.color
  if (typeof styles.backgroundColor === "string") attrs["data-editor-style-background-color"] = styles.backgroundColor
  if (typeof styles.gradientEnabled === "boolean") attrs["data-editor-style-gradient-enabled"] = String(styles.gradientEnabled)
  if (typeof styles.gradientStart === "string") attrs["data-editor-style-gradient-start"] = styles.gradientStart
  if (typeof styles.gradientEnd === "string") attrs["data-editor-style-gradient-end"] = styles.gradientEnd

  return attrs
}

export function IntroBannerSection({ data }: { data: IntroBannerData }) {
  const { isEditing, registerEditable, unregisterEditable } = useVisualEditor()

  const sectionRef = useRef<HTMLDivElement>(null)
  const bannerGifRef = useRef<HTMLDivElement>(null)
  const bannerTextRef = useRef<HTMLParagraphElement>(null)
  const bookButtonRef = useRef<HTMLAnchorElement>(null)
  const pressButtonRef = useRef<HTMLAnchorElement>(null)

  // Component renders from Sanity data directly - no override hooks
  const resolvedIntroGifSrc = data.gifUrl

  useEffect(() => {
    if (!isEditing) return

    if (sectionRef.current) {
      registerEditable({
        id: "intro-section",
        type: "section",
        label: "Intro Section",
        parentId: null,
        element: sectionRef.current,
        originalRect: sectionRef.current.getBoundingClientRect(),
        transform: { x: 0, y: 0 },
        dimensions: { width: sectionRef.current.offsetWidth, height: sectionRef.current.offsetHeight },
      })
    }

    if (bannerGifRef.current) {
      registerEditable({
        id: "intro-banner-gif",
        type: "image",
        label: "Banner GIF",
        parentId: "intro-section",
        element: bannerGifRef.current,
        originalRect: bannerGifRef.current.getBoundingClientRect(),
        transform: { x: 0, y: 0 },
        dimensions: { width: bannerGifRef.current.offsetWidth, height: bannerGifRef.current.offsetHeight },
      })
    }

    if (bannerTextRef.current) {
      registerEditable({
        id: "intro-banner-text",
        type: "text",
        label: "Banner Text",
        parentId: "intro-section",
        element: bannerTextRef.current,
        originalRect: bannerTextRef.current.getBoundingClientRect(),
        transform: { x: 0, y: 0 },
        dimensions: { width: bannerTextRef.current.offsetWidth, height: bannerTextRef.current.offsetHeight },
      })
    }

    if (bookButtonRef.current) {
      registerEditable({
        id: "intro-book-button",
        type: "button",
        label: "Book Band Button",
        parentId: "intro-section",
        element: bookButtonRef.current,
        originalRect: bookButtonRef.current.getBoundingClientRect(),
        transform: { x: 0, y: 0 },
        dimensions: { width: bookButtonRef.current.offsetWidth, height: bookButtonRef.current.offsetHeight },
      })
    }

    if (pressButtonRef.current) {
      registerEditable({
        id: "intro-press-button",
        type: "button",
        label: "Press Kit Button",
        parentId: "intro-section",
        element: pressButtonRef.current,
        originalRect: pressButtonRef.current.getBoundingClientRect(),
        transform: { x: 0, y: 0 },
        dimensions: { width: pressButtonRef.current.offsetWidth, height: pressButtonRef.current.offsetHeight },
      })
    }

    return () => {
      unregisterEditable("intro-section")
      unregisterEditable("intro-banner-gif")
      unregisterEditable("intro-banner-text")
      unregisterEditable("intro-book-button")
      unregisterEditable("intro-press-button")
    }
  }, [isEditing, registerEditable, unregisterEditable])

  return (
    <div
      ref={sectionRef}
      data-editor-node-id="intro-section"
      data-editor-node-type="section"
      data-editor-node-label="Intro Section"
      {...getIntroEditorAttrs(data.elementStyles, "intro-section")}
      className="relative -mt-20 z-20 flex min-h-[52vh] min-h-[52dvh] flex-col items-center justify-center gap-4 px-3 pb-12 pt-8 sm:min-h-[58vh] sm:min-h-[58dvh] sm:px-4 sm:pb-16 sm:pt-28 md:-mt-24 lg:-mt-28"
      style={getIntroBoxPatternStyle(data.elementStyles, "intro-section")}
    >
      <div
        ref={bannerGifRef}
        data-editor-node-id="intro-banner-gif"
        data-editor-node-type="image"
        data-editor-node-label="Banner GIF"
        {...getIntroEditorAttrs(data.elementStyles, "intro-banner-gif")}
        className="absolute left-0 top-0 z-0 h-full w-full overflow-hidden"
        style={getIntroGifStyle(data.elementStyles)}
      >
        <img
          src={resolvedIntroGifSrc}
          alt="Animated banner"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="relative z-20 flex w-full max-w-4xl flex-col items-center justify-center gap-3.5">
        <p
          ref={bannerTextRef}
          data-editor-node-id="intro-banner-text"
          data-editor-node-type="text"
          data-editor-node-label="Banner Text"
          {...getIntroEditorAttrs(data.elementStyles, "intro-banner-text")}
          className="max-w-2xl px-3 text-center text-[0.95rem] leading-relaxed text-white/90 sm:px-4 sm:text-lg md:text-xl"
          style={getIntroTextPatternStyle(data.elementStyles, "intro-banner-text")}
        >
          {data.bannerText}
        </p>
        <div className="flex w-full flex-col items-center justify-center gap-3 px-3 sm:w-auto sm:flex-row sm:gap-6 sm:px-0">
          <a
            ref={bookButtonRef}
            href={data.bookHref}
            data-editor-node-id="intro-book-button"
            data-editor-node-type="button"
            data-editor-node-label="Book Band Button"
            {...getIntroEditorAttrs(data.elementStyles, "intro-book-button")}
            className="btn-primary w-full sm:w-auto"
            style={getIntroBoxPatternStyle(data.elementStyles, "intro-book-button")}
          >
            {data.bookLabel}
          </a>

          <a
            ref={pressButtonRef}
            href={data.pressHref}
            data-editor-node-id="intro-press-button"
            data-editor-node-type="button"
            data-editor-node-label="Press Kit Button"
            {...getIntroEditorAttrs(data.elementStyles, "intro-press-button")}
            className="btn-secondary w-full sm:w-auto"
            style={getIntroBoxPatternStyle(data.elementStyles, "intro-press-button")}
          >
            {data.pressLabel}
          </a>
        </div>
      </div>
    </div>
  )
}
