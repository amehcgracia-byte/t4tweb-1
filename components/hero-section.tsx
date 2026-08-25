"use client"

import { useRef, useEffect, useMemo, useState, type CSSProperties } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { useVisualEditor } from "@/components/visual-editor"
import { useHomeEditorImageSrc } from "@/components/home-editor-overrides-provider"
import type { HeroData } from "@/lib/sanity/hero-loader"
import {
  buildHeroScrollIndicatorLayoutStyle,
  getElementLayoutStyle,
  roundLayoutPx,
} from "@/lib/hero-layout-styles"

const getElementStyle = getElementLayoutStyle

const FALLBACK: HeroData = {
  title: "",
  titleHighlight: "",
  subtitle: "",
  description: "",
  bgUrl: "/images/hero-bg.jpg",
  logoUrl: "/logo.png",
  titleSegments: [],
  elementStyles: {},
}

function scrollIndicatorHasLayout(
  elementStyles: Record<string, unknown> | undefined
): boolean {
  const s = elementStyles?.["hero-scroll-indicator"]
  if (!s || typeof s !== "object") return false

  const o = s as Record<string, unknown>
  if (o.responsiveLayout !== true) return false
  if (o.respectPosition !== true) return false

  return (
    typeof o.x === "number" ||
    typeof o.y === "number" ||
    typeof o.width === "number" ||
    typeof o.height === "number" ||
    (typeof o.scale === "number" && o.scale !== 1)
  )
}

function getScrollIndicatorStyle(
  elementStyles: Record<string, unknown> | undefined
): React.CSSProperties {
  if (!elementStyles?.["hero-scroll-indicator"]) return {}

  const styles = elementStyles["hero-scroll-indicator"] as Record<string, unknown>
  if (styles.responsiveLayout !== true) return {}
  if (styles.respectPosition !== true) return {}
  const tx = typeof styles.x === "number" ? roundLayoutPx(styles.x as number) : 0
  const ty = typeof styles.y === "number" ? roundLayoutPx(styles.y as number) : 0
  const scaleVal = typeof styles.scale === "number" ? styles.scale : 1
  const needScale = typeof styles.scale === "number" && scaleVal !== 1

  return buildHeroScrollIndicatorLayoutStyle({
    x: tx,
    y: ty,
    scale: needScale ? scaleVal : undefined,
    width:
      typeof styles.width === "number"
        ? roundLayoutPx(styles.width as number)
        : undefined,
    height:
      typeof styles.height === "number"
        ? roundLayoutPx(styles.height as number)
        : undefined,
  })
}

function hasResponsiveHeroLayout(
  elementStyles: Record<string, unknown> | undefined,
  targetId: string
): boolean {
  const styles = elementStyles?.[targetId]
  return Boolean(styles && typeof styles === "object" && (styles as Record<string, unknown>).responsiveLayout === true)
}

interface HeroDebug {
  sourceUsed: "server"
  hasTitleSegments: boolean
  titleSegmentsCount: number
  titleValue: string
  titleHighlightValue: string
  segmentTexts: string[]
  hasGradientFields: boolean
}

type HeroTitleSegmentStyle = {
  color?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  opacity?: number
  fontSize?: string
  fontFamily?: string
  gradientEnabled?: boolean
  gradientStart?: string
  gradientEnd?: string
}

function getHeroTitleSegmentStyle(
  segment: HeroTitleSegmentStyle | undefined,
  fallbackColor: string,
  fallbackGradient = false,
  includeResponsiveTypography = false
): CSSProperties {
  const gradientEnabled = segment?.gradientEnabled ?? fallbackGradient
  const style: CSSProperties = {
    color: segment?.color || fallbackColor,
    fontWeight: segment?.bold ? 700 : 400,
    fontStyle: segment?.italic ? "italic" : undefined,
    textDecoration: segment?.underline ? "underline" : undefined,
    opacity: segment?.opacity,
    fontFamily: segment?.fontFamily,
  }

  if (includeResponsiveTypography && segment?.fontSize) {
    style.fontSize = segment.fontSize
  }

  if (gradientEnabled) {
    const start = normalizeGradientColor(segment?.gradientStart, "#FFB15A")
    const end = normalizeGradientColor(segment?.gradientEnd, "#FF6C00")
    style.backgroundImage = `linear-gradient(90deg, ${start}, ${end})`
    style.backgroundClip = "text"
    style.WebkitBackgroundClip = "text"
    style.color = "transparent"
    style.WebkitTextFillColor = "transparent"
  }

  return style
}

function normalizeGradientColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback
  const color = value.trim()
  if (/^#[0-9a-f]{3,8}$/i.test(color)) {
    const hex = color.slice(1)
    const normalized = hex.length === 3 || hex.length === 4
      ? hex.slice(0, 3).split("").map((part) => part + part).join("")
      : hex.slice(0, 6)
    const alpha = hex.length === 4 || hex.length === 8 ? Number.parseInt(hex.slice(-2), 16) : 255
    return alpha === 0 ? fallback : `#${normalized}`
  }
  if (/^(?:rgb|hsl)a?\([^)]*\)$/i.test(color)) {
    if (/rgba?\(\s*0\s*,\s*0\s*,\s*0(?:\s*,\s*0)?\s*\)/i.test(color)) return fallback
    return color
  }
  return fallback
}

const RESPONSIVE_HERO_TITLE_SIZE = "clamp(2.25rem, 4.7vw, 5.5rem)"

function isOversizedHeroTitleFontSize(value: unknown): boolean {
  if (typeof value !== "number" && typeof value !== "string") return false
  const parsed = typeof value === "number" ? value : Number.parseFloat(value)
  return Number.isFinite(parsed) && parsed >= 96
}



export function HeroSection({ data }: { data: HeroData }) {
  const sectionRef = useRef<HTMLElement>(null)
  const [isDebugMode, setIsDebugMode] = useState(false)

  const content = data || FALLBACK

  const debug = useMemo<HeroDebug>(
    () => ({
      sourceUsed: "server",
      hasTitleSegments:
        Array.isArray(content.titleSegments) && content.titleSegments.length > 0,
      titleSegmentsCount: Array.isArray(content.titleSegments)
        ? content.titleSegments.length
        : 0,
      titleValue: content.title || "",
      titleHighlightValue: content.titleHighlight || "",
      segmentTexts: Array.isArray(content.titleSegments)
        ? content.titleSegments.map((s) => s.text || "")
        : [],
      hasGradientFields:
        Array.isArray(content.titleSegments) &&
        content.titleSegments.some((s) => s.gradientEnabled === true),
    }),
    [content]
  )

  const heroSectionRef = useRef<HTMLElement>(null)
  const heroBgRef = useRef<HTMLDivElement>(null)
  const heroLogoRef = useRef<HTMLDivElement>(null)
  const heroTitleMainRef = useRef<HTMLSpanElement>(null)
  const heroTitleAccentRef = useRef<HTMLSpanElement>(null)
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null)
  const heroButtonsRef = useRef<HTMLDivElement>(null)
  const heroScrollRef = useRef<HTMLDivElement>(null)

  const { isEditing, registerEditable, unregisterEditable, getElementById } =
    useVisualEditor()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsDebugMode(params.get("heroDebug") === "1")
  }, [isEditing])

  useEffect(() => {
    if (!isEditing) return

    const registerAll = () => {
      if (heroSectionRef.current) {
        const existing = getElementById("hero-section")
        registerEditable({
          id: "hero-section",
          type: "section",
          label: "Hero Section",
          parentId: null,
          element: heroSectionRef.current,
          originalRect: heroSectionRef.current.getBoundingClientRect(),
          transform: existing?.transform || { x: 0, y: 0 },
          dimensions: existing?.dimensions || {
            width: heroSectionRef.current.offsetWidth,
            height: heroSectionRef.current.offsetHeight,
          },
        })
      }

      if (heroBgRef.current) {
        const existing = getElementById("hero-bg-image")
        registerEditable({
          id: "hero-bg-image",
          type: "image",
          label: "Hero Background",
          parentId: null,
          element: heroBgRef.current,
          originalRect: heroBgRef.current.getBoundingClientRect(),
          transform: existing?.transform || { x: 0, y: 0 },
          dimensions: existing?.dimensions || {
            width: heroBgRef.current.offsetWidth,
            height: heroBgRef.current.offsetHeight,
          },
        })
      }

      if (heroLogoRef.current) {
        const existing = getElementById("hero-logo")
        registerEditable({
          id: "hero-logo",
          type: "image",
          label: "Hero Logo",
          parentId: null,
          element: heroLogoRef.current,
          originalRect: heroLogoRef.current.getBoundingClientRect(),
          transform: existing?.transform || { x: 0, y: 0 },
          dimensions: existing?.dimensions || {
            width: heroLogoRef.current.offsetWidth,
            height: heroLogoRef.current.offsetHeight,
          },
        })
      }

      if (heroTitleMainRef.current) {
        const existing = getElementById("hero-title-main")
        registerEditable({
          id: "hero-title-main",
          type: "text",
          label: "Hero Title Main",
          parentId: null,
          element: heroTitleMainRef.current,
          originalRect: heroTitleMainRef.current.getBoundingClientRect(),
          transform: existing?.transform || { x: 0, y: 0 },
          dimensions: existing?.dimensions || {
            width: heroTitleMainRef.current.offsetWidth,
            height: heroTitleMainRef.current.offsetHeight,
          },
        })
      }

      if (heroTitleAccentRef.current) {
        const existing = getElementById("hero-title-accent")
        registerEditable({
          id: "hero-title-accent",
          type: "text",
          label: "Hero Title Accent",
          parentId: null,
          element: heroTitleAccentRef.current,
          originalRect: heroTitleAccentRef.current.getBoundingClientRect(),
          transform: existing?.transform || { x: 0, y: 0 },
          dimensions: existing?.dimensions || {
            width: heroTitleAccentRef.current.offsetWidth,
            height: heroTitleAccentRef.current.offsetHeight,
          },
        })
      }

      if (heroSubtitleRef.current) {
        const existing = getElementById("hero-subtitle")
        registerEditable({
          id: "hero-subtitle",
          type: "text",
          label: "Hero Subtitle",
          parentId: null,
          element: heroSubtitleRef.current,
          originalRect: heroSubtitleRef.current.getBoundingClientRect(),
          transform: existing?.transform || { x: 0, y: 0 },
          dimensions: existing?.dimensions || {
            width: heroSubtitleRef.current.offsetWidth,
            height: heroSubtitleRef.current.offsetHeight,
          },
        })
      }

      if (heroButtonsRef.current) {
        const existing = getElementById("hero-buttons")
        registerEditable({
          id: "hero-buttons",
          type: "box",
          label: "Hero Buttons",
          parentId: null,
          element: heroButtonsRef.current,
          originalRect: heroButtonsRef.current.getBoundingClientRect(),
          transform: existing?.transform || { x: 0, y: 0 },
          dimensions: existing?.dimensions || {
            width: heroButtonsRef.current.offsetWidth,
            height: heroButtonsRef.current.offsetHeight,
          },
        })
      }

      if (heroScrollRef.current) {
        const existing = getElementById("hero-scroll-indicator")
        registerEditable({
          id: "hero-scroll-indicator",
          type: "box",
          label: "Scroll Indicator",
          parentId: null,
          element: heroScrollRef.current,
          originalRect: heroScrollRef.current.getBoundingClientRect(),
          transform: existing?.transform || { x: 0, y: 0 },
          dimensions: existing?.dimensions || {
            width: heroScrollRef.current.offsetWidth,
            height: heroScrollRef.current.offsetHeight,
          },
        })
      }
    }

    registerAll()

    return () => {
      unregisterEditable("hero-section")
      unregisterEditable("hero-bg-image")
      unregisterEditable("hero-logo")
      unregisterEditable("hero-title-main")
      unregisterEditable("hero-title-accent")
      unregisterEditable("hero-subtitle")
      unregisterEditable("hero-buttons")
      unregisterEditable("hero-scroll-indicator")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })

  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.06])
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 35])

  const resolvedHeroBgSrc = useHomeEditorImageSrc("hero-bg-image", content.bgUrl)
  const resolvedHeroLogoSrc = useHomeEditorImageSrc("hero-logo", content.logoUrl)
  const scrollLayoutSaved =
    scrollIndicatorHasLayout(content.elementStyles)

  const heroTitleMode: "legacy" | "segmented" =
    Array.isArray(content.titleSegments) && content.titleSegments.length > 0
      ? "segmented"
      : "legacy"

  const normalizedTitleSegments = useMemo(() => {
    if (heroTitleMode !== "segmented") return []

    const source = (content.titleSegments || [])
      .map((segment) => ({
        ...segment,
        text: (segment.text || "").trim(),
      }))
      .filter((segment) => segment.text.length > 0)

    if (source.length === 0) return []

    const deduped: Array<{ text: string; color?: string; bold?: boolean; italic?: boolean; underline?: boolean; opacity?: number; fontSize?: string; fontFamily?: string; gradientEnabled?: boolean; gradientStart?: string; gradientEnd?: string }> = []

    source.forEach((segment) => {
      const previous = deduped[deduped.length - 1]
      if (previous && previous.text.toLowerCase() === segment.text.toLowerCase()) {
        return
      }
      deduped.push(segment)
    })

    if (deduped.length >= 2) {
      const first = deduped[0]
      const second = deduped[1]
      const firstLower = first.text.toLowerCase()
      const secondLower = second.text.toLowerCase()

      if (firstLower.endsWith(secondLower) && first.text.length > second.text.length) {
        const trimmedFirst = first.text
          .slice(0, first.text.length - second.text.length)
          .trim()

        if (trimmedFirst.length > 0) {
          deduped[0] = { ...first, text: trimmedFirst }
        }
      }
    }

    return deduped
  }, [heroTitleMode, content.titleSegments])

  const titleSegmentsForRender =
    heroTitleMode === "segmented"
      ? normalizedTitleSegments
      : [
          { text: content.title || FALLBACK.title, color: "#ffffff", bold: true },
          {
            text: content.titleHighlight || FALLBACK.titleHighlight,
            color: "#FF8C21",
            bold: true,
            gradientEnabled: true,
            gradientStart: "#FFB15A",
            gradientEnd: "#FF6C00",
          },
        ]

  return (
    <section
      ref={(el) => {
        sectionRef.current = el
        heroSectionRef.current = el
      }}
      id="top"
      data-editor-node-id="hero-section"
      data-editor-node-type="section"
      data-editor-node-label="Hero Section"
      className="relative flex min-h-screen min-h-[100dvh] w-full items-stretch overflow-hidden bg-black"
      style={getElementStyle(content.elementStyles, "hero-section", {
        includeGeometry: false,
        includeResponsiveTypography: true,
      })}
    >
      <div className="absolute inset-0 z-0">
        <motion.div
          style={{ scale: backgroundScale, y: backgroundY }}
          className="relative h-full w-full"
        >
          <div
            ref={heroBgRef}
            data-editor-node-id="hero-bg-image"
            data-editor-node-type="background"
            data-editor-media-kind="image"
            data-editor-node-label="Hero Background"
            className="absolute inset-0"
            style={getElementStyle(content.elementStyles, "hero-bg-image", {
              includeGeometry: hasResponsiveHeroLayout(content.elementStyles, "hero-bg-image"),
              includeResponsiveTypography: true,
            })}
          >
            <Image
              src={resolvedHeroBgSrc}
              alt="Tales for the Tillerman live atmosphere"
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: "center top" }}
            />
          </div>
        </motion.div>
      </div>

      <div className="absolute inset-0 z-[1] bg-black/33" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/10 via-transparent to-black/58" />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_62%,#00000088_12%,transparent_82%)]" />

      <motion.div
        animate={{ opacity: [0.1, 0.24, 0.1] }}
        transition={{ duration: 16, repeat: Infinity }}
        className="absolute inset-0 z-[1] bg-gradient-to-r from-transparent via-[#FF8C21]/21 to-transparent"
      />

      <div className="relative z-10 flex min-h-screen min-h-[100dvh] w-full flex-col justify-end px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center pb-24 pt-16 text-center sm:pb-28 sm:pt-20">
          <h1
            data-editor-node-id="hero-title"
            data-editor-node-type="text"
            data-editor-node-label="Hero Title"
            data-editor-grouped="true"
            className="mb-5 w-full max-w-[min(94vw,1120px)] text-balance break-words text-[clamp(2.25rem,4.7vw,5.5rem)] font-semibold leading-[0.94] tracking-[-0.035em] text-white sm:mb-7"
            style={getElementStyle(content.elementStyles, "hero-title", {
              includeGeometry: true,
              includeResponsiveTypography: true,
            })}
          >
            {titleSegmentsForRender.map((segment, index) => {
              const isAccent = index === 1
              const gradientEnabled = segment.gradientEnabled ?? isAccent
              const segmentStyle = getHeroTitleSegmentStyle(
                segment,
                isAccent ? "#FF8C21" : "#ffffff",
                isAccent,
                true
              )
              const segmentId = index === 0
                ? "hero-title-main"
                : index === 1
                  ? "hero-title-accent"
                  : `hero-title-segment-${index}`
              const savedSegmentStyle = hasResponsiveHeroLayout(content.elementStyles, segmentId)
                ? content.elementStyles?.[segmentId]
                : undefined
              const useResponsiveTitleSize =
                isOversizedHeroTitleFontSize(segment.fontSize) ||
                (savedSegmentStyle && typeof savedSegmentStyle === "object" &&
                  isOversizedHeroTitleFontSize((savedSegmentStyle as Record<string, unknown>).fontSize))
              return (
                <span
                  key={`${segmentId}-${segment.text}`}
                  ref={index === 0 ? heroTitleMainRef : index === 1 ? heroTitleAccentRef : undefined}
                  data-editor-node-id={segmentId}
                  data-editor-node-type="text"
                  data-editor-node-label={index === 0 ? "Hero Title Main" : index === 1 ? "Hero Title Accent" : `Hero Title Segment ${index + 1}`}
                  className={gradientEnabled
                    ? "mr-[0.25em] bg-gradient-to-r from-[#FFB15A] via-[#FF8C21] to-[#FF6C00] bg-clip-text text-transparent"
                    : "mr-[0.25em]"}
                  style={{
                    ...segmentStyle,
                    ...(hasResponsiveHeroLayout(content.elementStyles, segmentId)
                      ? getElementStyle(content.elementStyles, segmentId, {
                          includeGeometry: true,
                          includeResponsiveTypography: true,
                        })
                      : {}),
                    ...(useResponsiveTitleSize ? { fontSize: RESPONSIVE_HERO_TITLE_SIZE } : {}),
                  }}
                >
                  {segment.text}
                </span>
              )
            })}
          </h1>

          <div className="flex flex-col items-center">
            <div
              ref={heroLogoRef}
              data-editor-node-id="hero-logo"
              data-editor-node-type="image"
              data-editor-node-label="Hero Logo"
              className="relative"
              style={{
                width: "clamp(3.5rem, 6vw, 5.5rem)",
                height: "clamp(3.5rem, 6vw, 5.5rem)",
                ...(hasResponsiveHeroLayout(content.elementStyles, "hero-logo")
                  ? getElementStyle(content.elementStyles, "hero-logo", {
                      includeGeometry: true,
                      includeResponsiveTypography: true,
                    })
                  : {}),
              }}
            >
              <Image
                src={resolvedHeroLogoSrc}
                alt="Tales for the Tillerman logo"
                fill
                priority
                className="object-contain drop-shadow-2xl"
                sizes="(min-width: 768px) 88px, 64px"
              />
            </div>

            <p
              ref={heroSubtitleRef}
              data-editor-node-id="hero-subtitle"
              data-editor-node-type="text"
              data-editor-node-label="Subtítulo"
              className="mt-1.5 px-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#ffd3a3] sm:text-[10px] sm:tracking-[0.24em]"
              style={hasResponsiveHeroLayout(content.elementStyles, "hero-subtitle")
                ? getElementStyle(content.elementStyles, "hero-subtitle", {
                    includeGeometry: true,
                    includeResponsiveTypography: true,
                  })
                : undefined}
            >
              {content.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div
        ref={heroScrollRef}
        data-editor-node-id="hero-scroll-indicator"
        data-editor-node-type="card"
        data-editor-node-label="Scroll Indicator"
        data-editor-grouped="true"
        className={
          scrollLayoutSaved
            ? "absolute z-30 hidden flex-col items-center gap-1 text-white/80 sm:flex"
            : "absolute bottom-2 left-1/2 z-30 hidden -translate-x-1/2 flex-col items-center gap-1 text-white/80 sm:flex"
        }
        style={
          scrollLayoutSaved
            ? getScrollIndicatorStyle(content.elementStyles)
            : undefined
        }
      >
        <span className="text-lg uppercase tracking-[0.42em]">SCROLL</span>
        <svg
          className="h-9 w-9"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.7}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 14l-7 7m0 0l-7-7"
          />
        </svg>
      </div>

      {isDebugMode && (
        <div className="absolute right-4 top-4 z-[9999] rounded-lg border border-white/10 bg-black/80 px-3 py-2 text-left text-[10px] font-mono text-white/80 backdrop-blur-sm">
          <div className="mb-1 font-bold text-white/90">Hero Debug</div>
          <div>
            source: <span className="text-green-400">{debug.sourceUsed}</span>
          </div>
          <div>
            title:{" "}
            <span className="text-yellow-300">
              {debug.titleValue || "(empty)"}
            </span>
          </div>
          <div>
            titleHighlight:{" "}
            <span className="text-orange-400">
              {debug.titleHighlightValue || "(empty)"}
            </span>
          </div>
          <div>segments: {debug.titleSegmentsCount}</div>

          {debug.segmentTexts.map((t, i) => (
            <div key={i} className="ml-2 text-white/60">
              [{i}]: {t}
            </div>
          ))}

          <div>gradient fields: {debug.hasGradientFields ? "yes" : "no"}</div>

          <div className="mt-1 border-t border-white/10 pt-1">
            elementStyles keys:{" "}
            {content.elementStyles && Object.keys(content.elementStyles).length > 0
              ? Object.keys(content.elementStyles).join(", ")
              : "(none)"}
          </div>
        </div>
      )}
    </section>
  )
}
