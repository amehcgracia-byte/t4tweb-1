import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { createClient } from "next-sanity"

interface DeployNodePayload {
  id: string
  type: string
  label: string
  isGrouped: boolean
  geometry: { x: number; y: number; width: number; height: number }
  style: Record<string, unknown>
  content: Record<string, unknown>
  explicitContent: boolean
  explicitStyle: boolean
  explicitPosition: boolean
  explicitSize: boolean
}

interface DeployRequestPayload {
  level: "green" | "yellow" | "red"
  diagnosticMode?: boolean
  findings: Array<{ element: string; issue: string; severity: "green" | "yellow" | "red"; blocks: boolean }>
  nodes: DeployNodePayload[]
}

interface DeployStepResult {
  step: "checking" | "saving" | "publishing" | "revalidating"
  ok: boolean
  message: string
}

interface DeployEnvDiagnostics {
  SANITY_PROJECT_ID: "yes" | "no"
  NEXT_PUBLIC_SANITY_PROJECT_ID: "yes" | "no"
  SANITY_DATASET: "yes" | "no"
  SANITY_API_WRITE_TOKEN: "yes" | "no"
  SANITY_API_TOKEN: "yes" | "no"
}

interface HeroTitleSegment {
  text: string
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

type PersistedElementStyle = Record<string, number | string | boolean>

interface DeployVerification {
  ok: boolean
  checkedNodes: string[]
  failedNodes: string[]
  failedFields: string[]
  message: string
}

const ROUTE_VERSION = "sanity-editor-v6-save-verified"
const TARGET_SECTION = "hero"
const SANITY_DOC_TYPE = "heroSection"
const REVALIDATED_PATH = "/"

const HERO_LAYOUT_NODE_IDS = new Set([
  "hero-bg-image",
  "hero-title",
  "hero-title-main",
  "hero-title-accent",
  "hero-subtitle",
  "hero-logo",
  "hero-buttons",
  "hero-scroll-indicator",
])

const NAV_LAYOUT_NODE_IDS = new Set([
  "navigation",
  "navigation-inner",
  "nav-logo",
  "nav-brand-name",
  "nav-book-button",
  "nav-mobile-book-button",
  ...Array.from({ length: 5 }, (_, index) => `nav-link-${index}`),
  ...Array.from({ length: 5 }, (_, index) => `nav-mobile-link-${index}`),
])

const INTRO_LAYOUT_NODE_IDS = new Set([
  "intro-section",
  "intro-banner-gif",
  "intro-banner-text",
  "intro-book-button",
  "intro-press-button",
])

const DOCUMENT_LAYOUT_NODE_IDS = new Set([
  ...HERO_LAYOUT_NODE_IDS,
  ...NAV_LAYOUT_NODE_IDS,
  ...INTRO_LAYOUT_NODE_IDS,
])

function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : undefined
}

function asFiniteDecimal(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function asCssColor(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const color = value.trim()
  if (/^#[0-9a-f]{3,8}$/i.test(color)) return color
  if (/^(?:rgb|hsl)a?\([^)]*\)$/i.test(color)) return color
  return undefined
}

function asCssLength(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const length = value.trim()
  return /^(?:-?\d+(?:\.\d+)?)(?:px|rem|em|%|vw|vh|clamp\([^)]*\))$/i.test(length)
    ? length
    : undefined
}

function sanitizeTitleSegment(value: unknown, fallbackColor: string): HeroTitleSegment | null {
  if (!value || typeof value !== "object") return null
  const raw = value as Record<string, unknown>
  const text = typeof raw.text === "string" ? raw.text.trim() : ""
  if (!text) return null
  const segment: HeroTitleSegment = {
    text,
    color: asCssColor(raw.color) || fallbackColor,
    bold: raw.bold === true,
    italic: raw.italic === true,
    underline: raw.underline === true,
    opacity: typeof raw.opacity === "number" && Number.isFinite(raw.opacity)
      ? Math.max(0, Math.min(1, raw.opacity))
      : 1,
  }
  const fontSize = asCssLength(raw.fontSize)
  const fontFamily = typeof raw.fontFamily === "string" && raw.fontFamily.trim() ? raw.fontFamily.trim() : undefined
  const gradientStart = asCssColor(raw.gradientStart)
  const gradientEnd = asCssColor(raw.gradientEnd)
  if (fontSize) segment.fontSize = fontSize
  if (fontFamily) segment.fontFamily = fontFamily
  if (raw.gradientEnabled === true) segment.gradientEnabled = true
  if (gradientStart) segment.gradientStart = gradientStart
  if (gradientEnd) segment.gradientEnd = gradientEnd
  return segment
}

function readNumberFromCss(value: unknown): number | undefined {
  if (typeof value === "number") return asFiniteDecimal(value)
  if (typeof value !== "string") return undefined
  const match = value.trim().match(/^-?\d+(?:\.\d+)?/)
  return match ? asFiniteDecimal(Number(match[0])) : undefined
}

function buildPersistedElementStyle(node: DeployNodePayload): PersistedElementStyle | null {
  if (!DOCUMENT_LAYOUT_NODE_IDS.has(node.id)) return null
  if (!node.explicitPosition && !node.explicitSize && !node.explicitStyle) return null

  const style: PersistedElementStyle = {}
  style.responsiveLayout = true
  if (node.explicitPosition || node.explicitSize) style.respectPosition = true
  if (node.explicitPosition) {
    const x = asFiniteNumber(node.geometry?.x)
    const y = asFiniteNumber(node.geometry?.y)
    if (x !== undefined) style.x = x
    if (y !== undefined) style.y = y
  }
  if (node.explicitSize) {
    const width = asFiniteNumber(node.geometry?.width)
    const height = asFiniteNumber(node.geometry?.height)
    if (width !== undefined) style.width = Math.max(8, width)
    if (height !== undefined) style.height = Math.max(8, height)
  }
  if (node.explicitStyle) {
    const numericFields: Array<[string, unknown]> = [
      ["opacity", node.style.opacity],
      ["scale", node.style.scale],
      ["fontSize", node.style.fontSize],
      ["fontWeight", node.style.fontWeight],
      ["letterSpacing", node.style.letterSpacing],
      ["lineHeight", node.style.lineHeight],
      ["maxWidth", node.style.maxWidth],
    ]
    numericFields.forEach(([key, value]) => {
      const parsed = readNumberFromCss(value)
      if (parsed !== undefined) style[key] = key === "scale" ? Math.max(0.1, parsed) : parsed
    })
    const color = asCssColor(node.style.color)
    if (color) style.color = color
    const backgroundColor = asCssColor(node.style.backgroundColor)
    if (backgroundColor) style.backgroundColor = backgroundColor
    const lengthFields: Array<[string, unknown]> = [
      ["minHeight", node.style.minHeight],
      ["paddingTop", node.style.paddingTop],
      ["paddingBottom", node.style.paddingBottom],
    ]
    lengthFields.forEach(([key, value]) => {
      const parsed = asCssLength(value)
      if (parsed) style[key] = parsed
    })
    const stringFields: Array<[string, unknown]> = [
      ["fontFamily", node.style.fontFamily],
      ["fontStyle", node.style.fontStyle],
      ["textDecoration", node.style.textDecoration],
      ["textAlign", node.style.textAlign],
    ]
    stringFields.forEach(([key, value]) => {
      if (typeof value === "string" && value.trim()) style[key] = value.trim()
    })
  }
  return Object.keys(style).length > 0 ? style : null
}

function hasExplicitEditorChange(node: DeployNodePayload): boolean {
  return node.explicitContent || node.explicitStyle || node.explicitPosition || node.explicitSize
}

function buildHomeEditorNode(node: DeployNodePayload): Record<string, unknown> | null {
  if (!hasExplicitEditorChange(node)) return null

  const geometry = {
    x: asFiniteNumber(node.geometry?.x) ?? 0,
    y: asFiniteNumber(node.geometry?.y) ?? 0,
    width: Math.max(8, asFiniteNumber(node.geometry?.width) ?? 8),
    height: Math.max(8, asFiniteNumber(node.geometry?.height) ?? 8),
  }
  const style: Record<string, unknown> = {}
  const numericStyleKeys = ["opacity", "contrast", "saturation", "brightness", "scale"]
  numericStyleKeys.forEach((key) => {
    const value = node.style?.[key]
    if (typeof value === "number" && Number.isFinite(value)) {
      style[key] = key === "scale" ? Math.max(0.1, value) : value
    }
  })
  const colorKeys = ["color", "backgroundColor"]
  colorKeys.forEach((key) => {
    const value = asCssColor(node.style?.[key])
    if (value) style[key] = value
  })
  const lengthKeys = ["fontSize", "minHeight", "paddingTop", "paddingBottom"]
  lengthKeys.forEach((key) => {
    const value = asCssLength(node.style?.[key])
    if (value) style[key] = value
  })
  const stringStyleKeys = ["fontFamily", "fontWeight", "fontStyle", "textDecoration", "textAlign"]
  stringStyleKeys.forEach((key) => {
    const value = node.style?.[key]
    if (typeof value === "string" && value.trim()) style[key] = value.trim()
  })
  if (node.style?.negative === true) style.negative = true

  const content: Record<string, unknown> = {}
  const stringContentKeys = [
    "text", "href", "src", "alt", "videoUrl", "mediaKind", "date", "venue", "city", "country",
    "genre", "price", "status", "time", "capacity", "locationUrl",
  ]
  stringContentKeys.forEach((key) => {
    const value = node.content?.[key]
    if (typeof value === "string") content[key] = value
  })
  if (node.content?.gradientEnabled === true) content.gradientEnabled = true
  ;["gradientStart", "gradientEnd"].forEach((key) => {
    const value = asCssColor(node.content?.[key])
    if (value) content[key] = value
  })

  return {
    nodeId: node.id,
    nodeType: node.type,
    geometry,
    style,
    content,
    explicitContent: node.explicitContent,
    explicitStyle: node.explicitStyle,
    explicitPosition: node.explicitPosition,
    explicitSize: node.explicitSize,
    updatedAt: new Date().toISOString(),
  }
}

function valuesMatch(expected: unknown, actual: unknown): boolean {
  if (typeof expected === "number" && typeof actual === "number") {
    return Math.abs(expected - actual) < 0.001
  }
  if (Array.isArray(expected)) {
    return Array.isArray(actual)
      && expected.length === actual.length
      && expected.every((value, index) => valuesMatch(value, actual[index]))
  }
  if (expected && typeof expected === "object") {
    if (!actual || typeof actual !== "object") return false
    return Object.entries(expected).every(([key, value]) => valuesMatch(value, actual[key as keyof typeof actual]))
  }
  return expected === actual
}

function verifyPersistedStyle(
  node: DeployNodePayload,
  styles: Record<string, PersistedElementStyle> | undefined,
  prefix: string,
  verification: DeployVerification,
): void {
  const expected = buildPersistedElementStyle(node)
  if (!expected) return
  verification.checkedNodes.push(node.id)
  const actual = styles?.[node.id]
  if (!actual) {
    verification.failedNodes.push(node.id)
    verification.failedFields.push(`${prefix}.${node.id}`)
    return
  }
  Object.entries(expected).forEach(([key, value]) => {
    if (!valuesMatch(value, actual[key])) {
      verification.failedNodes.push(node.id)
      verification.failedFields.push(`${prefix}.${node.id}.${key}`)
    }
  })
}

function getEnvDiagnostics(): DeployEnvDiagnostics {
  const sanityProjectId = process.env.SANITY_PROJECT_ID
  const nextPublicSanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const sanityApiWriteToken = process.env.SANITY_API_WRITE_TOKEN
  const sanityApiToken = process.env.SANITY_API_TOKEN

  return {
    SANITY_PROJECT_ID: sanityProjectId ? "yes" : "no",
    NEXT_PUBLIC_SANITY_PROJECT_ID: nextPublicSanityProjectId ? "yes" : "no",
    SANITY_DATASET: process.env.SANITY_DATASET ? "yes" : "no",
    SANITY_API_WRITE_TOKEN: sanityApiWriteToken ? "yes" : "no",
    SANITY_API_TOKEN: sanityApiToken ? "yes" : "no",
  }
}

export async function GET() {
  const envDiagnostics = getEnvDiagnostics()
  return NextResponse.json({
    routeVersion: ROUTE_VERSION,
    publishedDocumentId: "resolved-at-deploy",
    publishedDocumentType: SANITY_DOC_TYPE,
    targetSection: TARGET_SECTION,
    heroTitleMode: "unknown",
    revalidatedPath: REVALIDATED_PATH,
    diagnostics: envDiagnostics,
    envDiagnostics,
  })
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as DeployRequestPayload
    const sanityProjectId = process.env.SANITY_PROJECT_ID
    const nextPublicSanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    const projectId = sanityProjectId || nextPublicSanityProjectId
    const dataset = process.env.SANITY_DATASET || "production"
    const sanityApiWriteToken = process.env.SANITY_API_WRITE_TOKEN
    const sanityApiToken = process.env.SANITY_API_TOKEN
    const sanityToken = sanityApiWriteToken || sanityApiToken
    const diagnostics = getEnvDiagnostics()
    const envDiagnostics = diagnostics

    const steps: DeployStepResult[] = [{
      step: "checking",
      ok: true,
      message: "Endpoint reached: /api/editor-deploy.",
    }]

    steps.push({
      step: "checking",
      ok: true,
      message: `Env diagnostics (server-side): SANITY_PROJECT_ID: ${diagnostics.SANITY_PROJECT_ID}; NEXT_PUBLIC_SANITY_PROJECT_ID: ${diagnostics.NEXT_PUBLIC_SANITY_PROJECT_ID}; SANITY_DATASET: ${diagnostics.SANITY_DATASET}; SANITY_API_WRITE_TOKEN: ${diagnostics.SANITY_API_WRITE_TOKEN}; SANITY_API_TOKEN: ${diagnostics.SANITY_API_TOKEN}; dataset value used: ${dataset}.`,
    })

    if (!payload || !Array.isArray(payload.nodes) || !Array.isArray(payload.findings) || !payload.level) {
      return NextResponse.json({ routeVersion: ROUTE_VERSION, message: "Invalid deploy payload.", publishedDocumentId: "resolved-at-deploy", publishedDocumentType: SANITY_DOC_TYPE, targetSection: TARGET_SECTION, heroTitleMode: "unknown", revalidatedPath: REVALIDATED_PATH, persistedNodes: [], skippedNodes: [], failedNodes: ["payload"], persistedFields: [], skippedFields: [], failedFields: ["payload"], diagnostics, envDiagnostics }, { status: 400 })
    }
    if (payload.nodes.length === 0) {
      return NextResponse.json({ routeVersion: ROUTE_VERSION, message: "Invalid deploy payload: nodes array is empty.", publishedDocumentId: "resolved-at-deploy", publishedDocumentType: SANITY_DOC_TYPE, targetSection: TARGET_SECTION, heroTitleMode: "unknown", revalidatedPath: REVALIDATED_PATH, persistedNodes: [], skippedNodes: [], failedNodes: ["payload.nodes"], persistedFields: [], skippedFields: [], failedFields: ["payload.nodes"], diagnostics, envDiagnostics }, { status: 400 })
    }

    if (!projectId) {
      return NextResponse.json(
        {
          status: "failed",
          mode: "incomplete",
          step: "checking",
          localSaved: false,
          remoteReady: false,
          message: "Deploy failed: missing project id. Set SANITY_PROJECT_ID (preferred) or NEXT_PUBLIC_SANITY_PROJECT_ID.",
          steps,
          routeVersion: ROUTE_VERSION,
          publishedDocumentId: "resolved-at-deploy",
          publishedDocumentType: SANITY_DOC_TYPE,
          targetSection: TARGET_SECTION,
          heroTitleMode: "unknown",
          revalidatedPath: REVALIDATED_PATH,
          persistedNodes: [],
          skippedNodes: [],
          failedNodes: ["sanity-project-id"],
          persistedFields: [],
          skippedFields: [],
          failedFields: ["sanity-project-id"],
          diagnostics,
          envDiagnostics,
        },
        { status: 500 }
      )
    }

    if (!sanityToken) {
      return NextResponse.json(
        {
          status: "failed",
          mode: "incomplete",
          step: "checking",
          localSaved: false,
          remoteReady: false,
          message: "Deploy failed: missing write token. Set SANITY_API_WRITE_TOKEN or fallback SANITY_API_TOKEN.",
          steps,
          routeVersion: ROUTE_VERSION,
          publishedDocumentId: "resolved-at-deploy",
          publishedDocumentType: SANITY_DOC_TYPE,
          targetSection: TARGET_SECTION,
          heroTitleMode: "unknown",
          revalidatedPath: REVALIDATED_PATH,
          persistedNodes: [],
          skippedNodes: [],
          failedNodes: ["sanity-token"],
          persistedFields: [],
          skippedFields: [],
          failedFields: ["sanity-token"],
          diagnostics,
          envDiagnostics,
        },
        { status: 500 }
      )
    }

    const writeClient = createClient({
      projectId,
      dataset,
      apiVersion: "2024-01-01",
      useCdn: false,
      token: sanityToken,
      perspective: "drafts",
    })

    const existingHero = await writeClient.fetch<{
      _id: string
      title?: string
      titleHighlight?: string
      titleSegments?: HeroTitleSegment[]
      elementStyles?: Record<string, PersistedElementStyle>
    } | null>(
      `*[_type == $type][0]{ _id, title, titleHighlight, titleSegments, elementStyles }`,
      { type: SANITY_DOC_TYPE }
    )
    const [existingNavigation, existingIntro, existingHomeEditorState] = await Promise.all([
      writeClient.fetch<{
        _id: string
        brandName?: string
        ctaLabel?: string
        ctaHref?: string
        links?: Array<{ label?: string; href?: string }>
        elementStyles?: Record<string, PersistedElementStyle>
      } | null>(
        `*[_type == "navigation"][0]{ _id, brandName, ctaLabel, ctaHref, links[]{ label, href }, elementStyles }`,
      ),
      writeClient.fetch<{
        _id: string
        bannerText?: string
        bookLabel?: string
        bookHref?: string
        pressLabel?: string
        pressHref?: string
        elementStyles?: Record<string, PersistedElementStyle>
      } | null>(
        `*[_type == "introBanner"][0]{ _id, bannerText, bookLabel, bookHref, pressLabel, pressHref, elementStyles }`,
      ),
      writeClient.fetch<{
        _id: string
        nodes?: Array<Record<string, unknown>>
      } | null>(
        `*[_type == "homeEditorState" && _id == "homeEditorState"][0]{ _id, nodes }`,
      ),
    ])
    const heroTitleMode: "split-fields" = "split-fields"

    if (!existingHero?._id) {
      steps.push({ step: "saving", ok: false, message: "Hero section document not found; refusing to create implicit duplicate." })
      return NextResponse.json(
        {
          status: "failed",
          mode: "incomplete",
          step: "saving",
          localSaved: false,
          remoteReady: false,
          message: "Deploy failed: heroSection document not found.",
          steps,
          routeVersion: ROUTE_VERSION,
          publishedDocumentId: "resolved-at-deploy",
          publishedDocumentType: SANITY_DOC_TYPE,
          targetSection: TARGET_SECTION,
          heroTitleMode,
          revalidatedPath: REVALIDATED_PATH,
          persistedNodes: [],
          skippedNodes: [],
          failedNodes: ["hero-section-document"],
          persistedFields: [],
          skippedFields: ["hero-logo", "hero-scroll-indicator", "hero-geometry"],
          failedFields: ["hero-section-document"],
          diagnostics,
          envDiagnostics,
        },
        { status: 500 }
      )
    }

    const persistedFields: string[] = []
    const skippedFields: string[] = []
    const persistedNodes: string[] = []
    const skippedNodes: string[] = []
    const failedNodes: string[] = []
    const heroPatch: Record<string, unknown> = {}
    const verification: DeployVerification = {
      ok: true,
      checkedNodes: [],
      failedNodes: [],
      failedFields: [],
      message: "",
    }

    const heroTitleNode = payload.nodes.find((node) => node.id === "hero-title" && node.type === "text")
    const heroTitleMainNode = payload.nodes.find((node) => node.id === "hero-title-main" && node.type === "text")
    const heroTitleAccentNode = payload.nodes.find((node) => node.id === "hero-title-accent" && node.type === "text")
    const heroSubtitleNode = payload.nodes.find((node) => node.id === "hero-subtitle" && node.type === "text")

    const failedFields: string[] = []

    const existingTitleSegments = Array.isArray(existingHero.titleSegments)
      ? existingHero.titleSegments
        .map((segment, index) => sanitizeTitleSegment(segment, index === 0 ? "#ffffff" : "#FF8C21"))
        .filter((segment): segment is HeroTitleSegment => Boolean(segment))
      : []

    let nextTitleSegments: HeroTitleSegment[] = existingTitleSegments
    const groupedTitleSegments = heroTitleNode?.content?.textSegments
    if (heroTitleNode?.explicitContent && Array.isArray(groupedTitleSegments)) {
      nextTitleSegments = groupedTitleSegments
        .map((segment, index) => sanitizeTitleSegment(segment, index === 0 ? "#ffffff" : "#FF8C21"))
        .filter((segment): segment is HeroTitleSegment => Boolean(segment))
    } else if (heroTitleMainNode?.explicitContent || heroTitleAccentNode?.explicitContent || heroTitleMainNode?.explicitStyle || heroTitleAccentNode?.explicitStyle) {
      const fallbackSegments = nextTitleSegments.length > 0
        ? nextTitleSegments
        : [
            sanitizeTitleSegment({ text: existingHero.title || "A vibrant blend of", color: "#ffffff", bold: true }, "#ffffff"),
            sanitizeTitleSegment({ text: existingHero.titleHighlight || "funk, soul and world music", color: "#FF8C21", bold: true, gradientEnabled: true }, "#FF8C21"),
          ].filter((segment): segment is HeroTitleSegment => Boolean(segment))
      nextTitleSegments = fallbackSegments.map((segment) => ({ ...segment }))
      const mainText = typeof heroTitleMainNode?.content?.text === "string" ? heroTitleMainNode.content.text.trim() : ""
      const accentText = typeof heroTitleAccentNode?.content?.text === "string" ? heroTitleAccentNode.content.text.trim() : ""
      if (mainText && heroTitleMainNode?.explicitContent) nextTitleSegments[0] = { ...nextTitleSegments[0], text: mainText }
      if (accentText && heroTitleAccentNode?.explicitContent) {
        nextTitleSegments[1] = { ...(nextTitleSegments[1] || { color: "#FF8C21", bold: true }), text: accentText }
      }
      if (heroTitleMainNode?.explicitStyle && nextTitleSegments[0]) {
        nextTitleSegments[0] = {
          ...nextTitleSegments[0],
          color: asCssColor(heroTitleMainNode.style.color) || nextTitleSegments[0].color,
          bold: Number(heroTitleMainNode.style.fontWeight || 0) >= 600 || nextTitleSegments[0].bold,
          fontSize: asCssLength(heroTitleMainNode.style.fontSize) || nextTitleSegments[0].fontSize,
        }
      }
      if (heroTitleAccentNode?.explicitStyle && nextTitleSegments[1]) {
        nextTitleSegments[1] = {
          ...nextTitleSegments[1],
          color: asCssColor(heroTitleAccentNode.style.color) || nextTitleSegments[1].color,
          bold: Number(heroTitleAccentNode.style.fontWeight || 0) >= 600 || nextTitleSegments[1].bold,
          fontSize: asCssLength(heroTitleAccentNode.style.fontSize) || nextTitleSegments[1].fontSize,
        }
      }
    }

    if (nextTitleSegments.length > 0 && (
      heroTitleNode?.explicitContent ||
      heroTitleMainNode?.explicitContent ||
      heroTitleAccentNode?.explicitContent ||
      heroTitleMainNode?.explicitStyle ||
      heroTitleAccentNode?.explicitStyle
    )) {
      heroPatch.titleSegments = nextTitleSegments
      heroPatch.title = nextTitleSegments[0]?.text || existingHero.title || ""
      heroPatch.titleHighlight = nextTitleSegments[1]?.text || existingHero.titleHighlight || ""
      persistedFields.push("titleSegments")
      persistedNodes.push("hero-title")
    }

    if (heroTitleMainNode?.explicitContent) {
      const heroTitleMainText = typeof heroTitleMainNode.content?.text === "string" ? heroTitleMainNode.content.text.trim() : ""
      if (heroTitleMainText) {
        heroPatch.title = heroTitleMainText
        persistedFields.push("title")
        persistedNodes.push("hero-title-main")
      } else {
        failedFields.push("title")
        failedNodes.push("hero-title-main-empty")
      }
    }

    if (heroTitleAccentNode?.explicitContent) {
      const heroTitleAccentText = typeof heroTitleAccentNode.content?.text === "string" ? heroTitleAccentNode.content.text.trim() : ""
      if (heroTitleAccentText) {
        heroPatch.titleHighlight = heroTitleAccentText
        persistedFields.push("titleHighlight")
        persistedNodes.push("hero-title-accent")
      } else {
        failedFields.push("titleHighlight")
        failedNodes.push("hero-title-accent-empty")
      }
    }

    if (heroSubtitleNode?.explicitContent) {
      const heroSubtitleText = typeof heroSubtitleNode.content?.text === "string" ? heroSubtitleNode.content.text.trim() : ""
      if (heroSubtitleText) {
        heroPatch.subtitle = heroSubtitleText
        persistedFields.push("subtitle")
        persistedNodes.push("hero-subtitle")
      } else {
        skippedFields.push("subtitle")
        failedFields.push("subtitle")
        failedNodes.push("hero-subtitle-empty")
      }
    }

    const nextElementStyles: Record<string, PersistedElementStyle> = {
      ...(existingHero.elementStyles || {}),
    }
    payload.nodes.forEach((node) => {
      if (!HERO_LAYOUT_NODE_IDS.has(node.id)) return
      const style = buildPersistedElementStyle(node)
      if (!style) return
      const previous = nextElementStyles[node.id]
      const previousWasResponsive = previous?.responsiveLayout === true
      const baseStyle = previousWasResponsive ? previous : (() => {
        if (!previous) return {}
        const legacyStyle = { ...previous }
        delete legacyStyle.x
        delete legacyStyle.y
        delete legacyStyle.width
        delete legacyStyle.height
        delete legacyStyle.scale
        return legacyStyle
      })()
      nextElementStyles[node.id] = {
        ...baseStyle,
        ...style,
      }
      persistedNodes.push(node.id)
      persistedFields.push(`elementStyles.${node.id}`)
    })
    if (Object.keys(nextElementStyles).length > 0 && payload.nodes.some((node) => HERO_LAYOUT_NODE_IDS.has(node.id) && buildPersistedElementStyle(node))) {
      heroPatch.elementStyles = nextElementStyles
    }

    if (Object.keys(heroPatch).length > 0) {
      await writeClient.patch(existingHero._id).set({ ...heroPatch, updatedAt: new Date().toISOString() }).commit()
      steps.push({ step: "saving", ok: true, message: `Hero section patched: ${existingHero._id}` })
    } else {
      steps.push({ step: "saving", ok: true, message: "No persistible Hero content changes detected; no patch applied." })
    }

    const navigationNodes = payload.nodes.filter((node) => NAV_LAYOUT_NODE_IDS.has(node.id) && hasExplicitEditorChange(node))
    if (navigationNodes.length > 0) {
      if (!existingNavigation?._id) {
        navigationNodes.forEach((node) => {
          skippedNodes.push(node.id)
          skippedFields.push(`navigation.${node.id}`)
        })
      } else {
        const navigationPatch: Record<string, unknown> = {}
        const nextNavigationStyles: Record<string, PersistedElementStyle> = { ...(existingNavigation.elementStyles || {}) }
        navigationNodes.forEach((node) => {
          const style = buildPersistedElementStyle(node)
          if (style) {
            nextNavigationStyles[node.id] = { ...(nextNavigationStyles[node.id] || {}), ...style }
            persistedNodes.push(node.id)
            persistedFields.push(`navigation.elementStyles.${node.id}`)
          }
        })
        if (Object.keys(nextNavigationStyles).length > 0) navigationPatch.elementStyles = nextNavigationStyles

        const nextLinks = Array.isArray(existingNavigation.links)
          ? existingNavigation.links.map((link) => ({ label: link.label || "", href: link.href || "" }))
          : []
        navigationNodes.forEach((node) => {
          if (!node.explicitContent) return
          if (node.id === "nav-brand-name" && typeof node.content?.text === "string" && node.content.text.trim()) {
            navigationPatch.brandName = node.content.text.trim()
            persistedNodes.push(node.id)
            persistedFields.push("navigation.brandName")
            return
          }
          if (node.id === "nav-book-button" || node.id === "nav-mobile-book-button") {
            if (typeof node.content?.text === "string" && node.content.text.trim()) navigationPatch.ctaLabel = node.content.text.trim()
            if (typeof node.content?.href === "string" && node.content.href.trim()) navigationPatch.ctaHref = node.content.href.trim()
            if (typeof node.content?.text === "string" || typeof node.content?.href === "string") {
              persistedNodes.push(node.id)
              persistedFields.push("navigation.cta")
            }
            return
          }
          const match = node.id.match(/^nav-(?:mobile-)?link-(\d+)$/)
          if (!match) return
          const index = Number(match[1])
          if (!Number.isFinite(index)) return
          while (nextLinks.length <= index) nextLinks.push({ label: "", href: "" })
          if (typeof node.content?.text === "string" && node.content.text.trim()) nextLinks[index].label = node.content.text.trim()
          if (typeof node.content?.href === "string" && node.content.href.trim()) nextLinks[index].href = node.content.href.trim()
          persistedNodes.push(node.id)
          persistedFields.push(`navigation.links[${index}]`)
        })
        if (nextLinks.length > 0) navigationPatch.links = nextLinks
        navigationPatch.updatedAt = new Date().toISOString()
        if (Object.keys(navigationPatch).length > 1) {
          await writeClient.patch(existingNavigation._id).set(navigationPatch).commit()
          steps.push({ step: "saving", ok: true, message: `Navigation section patched: ${existingNavigation._id}` })
        }
      }
    }

    const introNodes = payload.nodes.filter((node) => INTRO_LAYOUT_NODE_IDS.has(node.id) && hasExplicitEditorChange(node))
    if (introNodes.length > 0) {
      if (!existingIntro?._id) {
        introNodes.forEach((node) => {
          skippedNodes.push(node.id)
          skippedFields.push(`introBanner.${node.id}`)
        })
      } else {
        const introPatch: Record<string, unknown> = {}
        const nextIntroStyles: Record<string, PersistedElementStyle> = { ...(existingIntro.elementStyles || {}) }
        introNodes.forEach((node) => {
          const style = buildPersistedElementStyle(node)
          if (style) {
            nextIntroStyles[node.id] = { ...(nextIntroStyles[node.id] || {}), ...style }
            persistedNodes.push(node.id)
            persistedFields.push(`introBanner.elementStyles.${node.id}`)
          }
          if (!node.explicitContent) return
          if (node.id === "intro-banner-text" && typeof node.content?.text === "string" && node.content.text.trim()) {
            introPatch.bannerText = node.content.text.trim()
          } else if (node.id === "intro-book-button") {
            if (typeof node.content?.text === "string" && node.content.text.trim()) introPatch.bookLabel = node.content.text.trim()
            if (typeof node.content?.href === "string" && node.content.href.trim()) introPatch.bookHref = node.content.href.trim()
          } else if (node.id === "intro-press-button") {
            if (typeof node.content?.text === "string" && node.content.text.trim()) introPatch.pressLabel = node.content.text.trim()
            if (typeof node.content?.href === "string" && node.content.href.trim()) introPatch.pressHref = node.content.href.trim()
          }
          if (node.explicitContent) {
            persistedNodes.push(node.id)
            persistedFields.push(`introBanner.content.${node.id}`)
          }
        })
        if (Object.keys(nextIntroStyles).length > 0) introPatch.elementStyles = nextIntroStyles
        introPatch.updatedAt = new Date().toISOString()
        if (Object.keys(introPatch).length > 1) {
          await writeClient.patch(existingIntro._id).set(introPatch).commit()
          steps.push({ step: "saving", ok: true, message: `Intro section patched: ${existingIntro._id}` })
        }
      }
    }

    const homeEditorNodes = payload.nodes
      .filter((node) => !DOCUMENT_LAYOUT_NODE_IDS.has(node.id))
      .map(buildHomeEditorNode)
      .filter((node): node is Record<string, unknown> => Boolean(node))
    if (homeEditorNodes.length > 0) {
      const existingNodes = Array.isArray(existingHomeEditorState?.nodes) ? existingHomeEditorState.nodes : []
      const changedIds = new Set(homeEditorNodes.map((node) => String(node.nodeId)))
      const mergedNodes = [
        ...existingNodes.filter((node) => !changedIds.has(String(node.nodeId))),
        ...homeEditorNodes,
      ]
      await writeClient.createIfNotExists({ _id: "homeEditorState", _type: "homeEditorState", nodes: [] })
      await writeClient.patch("homeEditorState").set({ nodes: mergedNodes, updatedAt: new Date().toISOString() }).commit()
      homeEditorNodes.forEach((node) => {
        const nodeId = String(node.nodeId)
        persistedNodes.push(nodeId)
        persistedFields.push(`homeEditorState.nodes.${nodeId}`)
      })
      steps.push({ step: "saving", ok: true, message: `Home editor state patched: ${homeEditorNodes.length} node(s).` })
    }

    // The write response alone is not enough: the public loaders use the
    // published perspective. Read that perspective back before reporting
    // success so the editor cannot claim "done" for a draft-only or partial
    // mutation.
    const publishedReadClient = createClient({
      projectId,
      dataset,
      apiVersion: "2024-01-01",
      useCdn: false,
      perspective: "published",
    })
    const [publishedHero, publishedNavigation, publishedIntro, publishedHomeEditorState] = await Promise.all([
      publishedReadClient.fetch<{
        title?: string
        titleHighlight?: string
        titleSegments?: HeroTitleSegment[]
        subtitle?: string
        elementStyles?: Record<string, PersistedElementStyle>
      } | null>(
        `*[_type == "${SANITY_DOC_TYPE}"][0]{ title, titleHighlight, titleSegments, subtitle, elementStyles }`,
      ),
      publishedReadClient.fetch<{
        brandName?: string
        ctaLabel?: string
        ctaHref?: string
        links?: Array<{ label?: string; href?: string }>
        elementStyles?: Record<string, PersistedElementStyle>
      } | null>(`*[_type == "navigation"][0]{ brandName, ctaLabel, ctaHref, links[]{ label, href }, elementStyles }`),
      publishedReadClient.fetch<{
        bannerText?: string
        bookLabel?: string
        bookHref?: string
        pressLabel?: string
        pressHref?: string
        elementStyles?: Record<string, PersistedElementStyle>
      } | null>(`*[_type == "introBanner"][0]{ bannerText, bookLabel, bookHref, pressLabel, pressHref, elementStyles }`),
      publishedReadClient.fetch<{ nodes?: Array<Record<string, unknown>> } | null>(
        `*[_type == "homeEditorState" && _id == "homeEditorState"][0]{ nodes }`,
      ),
    ])

    payload.nodes.forEach((node) => {
      if (!hasExplicitEditorChange(node)) return
      if (HERO_LAYOUT_NODE_IDS.has(node.id)) {
        verifyPersistedStyle(node, publishedHero?.elementStyles, "hero.elementStyles", verification)
      } else if (NAV_LAYOUT_NODE_IDS.has(node.id)) {
        verifyPersistedStyle(node, publishedNavigation?.elementStyles, "navigation.elementStyles", verification)
      } else if (INTRO_LAYOUT_NODE_IDS.has(node.id)) {
        verifyPersistedStyle(node, publishedIntro?.elementStyles, "introBanner.elementStyles", verification)
      }
    })

    const actualHomeNodes = new Map(
      (Array.isArray(publishedHomeEditorState?.nodes) ? publishedHomeEditorState.nodes : [])
        .map((node) => [String(node.nodeId || ""), node] as const)
        .filter(([nodeId]) => Boolean(nodeId)),
    )
    homeEditorNodes.forEach((expectedNode) => {
      const nodeId = String(expectedNode.nodeId)
      const actualNode = actualHomeNodes.get(nodeId)
      verification.checkedNodes.push(nodeId)
      if (!actualNode) {
        verification.failedNodes.push(nodeId)
        verification.failedFields.push(`homeEditorState.nodes.${nodeId}`)
        return
      }
      ;["geometry", "style", "content", "explicitContent", "explicitStyle", "explicitPosition", "explicitSize"].forEach((key) => {
        if (!valuesMatch(expectedNode[key], actualNode[key])) {
          verification.failedNodes.push(nodeId)
          verification.failedFields.push(`homeEditorState.nodes.${nodeId}.${key}`)
        }
      })
    })

    const comparePublishedText = (node: DeployNodePayload, actual: string | undefined, field: string) => {
      if (!node.explicitContent || typeof node.content?.text !== "string" || !node.content.text.trim()) return
      verification.checkedNodes.push(node.id)
      if (actual !== node.content.text.trim()) {
        verification.failedNodes.push(node.id)
        verification.failedFields.push(field)
      }
    }
    comparePublishedText(heroSubtitleNode || ({} as DeployNodePayload), publishedHero?.subtitle, "hero.subtitle")
    const mainTextNode = payload.nodes.find((node) => node.id === "hero-title-main")
    const accentTextNode = payload.nodes.find((node) => node.id === "hero-title-accent")
    comparePublishedText(mainTextNode || ({} as DeployNodePayload), publishedHero?.title, "hero.title")
    comparePublishedText(accentTextNode || ({} as DeployNodePayload), publishedHero?.titleHighlight, "hero.titleHighlight")

    if (Array.isArray(heroPatch.titleSegments)) {
      verification.checkedNodes.push("hero-title")
      const expectedSegments = heroPatch.titleSegments as HeroTitleSegment[]
      const actualSegments = publishedHero?.titleSegments || []
      const segmentsMatch = expectedSegments.length === actualSegments.length && expectedSegments.every((expectedSegment, index) => {
        const actualSegment = actualSegments[index]
        return Object.entries(expectedSegment).every(([key, value]) => valuesMatch(value, actualSegment?.[key as keyof HeroTitleSegment]))
      })
      if (!segmentsMatch) {
        verification.failedNodes.push("hero-title")
        verification.failedFields.push("hero.titleSegments")
      }
    }

    const navigationNodesForVerification = payload.nodes.filter((node) => NAV_LAYOUT_NODE_IDS.has(node.id) && node.explicitContent)
    navigationNodesForVerification.forEach((node) => {
      if (node.id === "nav-brand-name" && typeof node.content?.text === "string" && node.content.text.trim()) {
        verification.checkedNodes.push(node.id)
        if (publishedNavigation?.brandName !== node.content.text.trim()) {
          verification.failedNodes.push(node.id)
          verification.failedFields.push("navigation.brandName")
        }
      }
      if (node.id === "nav-book-button" || node.id === "nav-mobile-book-button") {
        if (typeof node.content?.text === "string" && node.content.text.trim()) {
          verification.checkedNodes.push(node.id)
          if (publishedNavigation?.ctaLabel !== node.content.text.trim()) {
            verification.failedNodes.push(node.id)
            verification.failedFields.push("navigation.ctaLabel")
          }
        }
        if (typeof node.content?.href === "string" && node.content.href.trim()) {
          verification.checkedNodes.push(node.id)
          if (publishedNavigation?.ctaHref !== node.content.href.trim()) {
            verification.failedNodes.push(node.id)
            verification.failedFields.push("navigation.ctaHref")
          }
        }
      }
      const match = node.id.match(/^nav-(?:mobile-)?link-(\d+)$/)
      if (match) {
        const index = Number(match[1])
        const actualLink = publishedNavigation?.links?.[index]
        if (typeof node.content?.text === "string" && node.content.text.trim()) {
          verification.checkedNodes.push(node.id)
          if (actualLink?.label !== node.content.text.trim()) {
            verification.failedNodes.push(node.id)
            verification.failedFields.push(`navigation.links[${index}].label`)
          }
        }
        if (typeof node.content?.href === "string" && node.content.href.trim()) {
          verification.checkedNodes.push(node.id)
          if (actualLink?.href !== node.content.href.trim()) {
            verification.failedNodes.push(node.id)
            verification.failedFields.push(`navigation.links[${index}].href`)
          }
        }
      }
    })

    const introNodesForVerification = payload.nodes.filter((node) => INTRO_LAYOUT_NODE_IDS.has(node.id) && node.explicitContent)
    introNodesForVerification.forEach((node) => {
      const checks: Array<[string, unknown, unknown]> = []
      if (node.id === "intro-banner-text") checks.push(["introBanner.bannerText", node.content?.text, publishedIntro?.bannerText])
      if (node.id === "intro-book-button") {
        checks.push(["introBanner.bookLabel", node.content?.text, publishedIntro?.bookLabel])
        checks.push(["introBanner.bookHref", node.content?.href, publishedIntro?.bookHref])
      }
      if (node.id === "intro-press-button") {
        checks.push(["introBanner.pressLabel", node.content?.text, publishedIntro?.pressLabel])
        checks.push(["introBanner.pressHref", node.content?.href, publishedIntro?.pressHref])
      }
      checks.forEach(([field, expected, actual]) => {
        if (typeof expected !== "string" || !expected.trim()) return
        verification.checkedNodes.push(node.id)
        if (!valuesMatch(expected.trim(), actual)) {
          verification.failedNodes.push(node.id)
          verification.failedFields.push(field)
        }
      })
    })

    verification.failedNodes = [...new Set(verification.failedNodes)]
    verification.failedFields = [...new Set(verification.failedFields)]
    verification.ok = verification.failedNodes.length === 0 && verification.failedFields.length === 0 && failedNodes.length === 0 && failedFields.length === 0 && skippedNodes.length === 0
    verification.message = verification.ok
      ? `Published read-back verified ${verification.checkedNodes.length} editor node checks.`
      : `Published read-back failed for ${verification.failedFields.length || verification.failedNodes.length} field(s).`

    const publishedDocumentId = existingHero._id
    steps.push({ step: "publishing", ok: verification.ok, message: verification.ok ? `Published Hero document: ${publishedDocumentId}` : "Published read-back verification failed; deploy is incomplete." })

    revalidatePath(REVALIDATED_PATH)
    steps.push({ step: "revalidating", ok: verification.ok, message: verification.ok ? "Public site revalidated." : "Public path was revalidated, but saved values could not be verified." })

    const responseBody = {
      status: verification.ok ? "ok" : "failed",
      mode: verification.ok ? "complete" : "incomplete",
      step: verification.ok ? "done" : "failed",
      localSaved: false,
      remoteReady: verification.ok,
      message: verification.ok ? "Deploy complete: editor changes saved in Sanity and public path revalidated." : verification.message,
      steps,
      routeVersion: ROUTE_VERSION,
      sanityDocumentId: publishedDocumentId,
      publishedDocumentId,
      publishedDocumentType: SANITY_DOC_TYPE,
      targetSection: TARGET_SECTION,
      heroTitleMode,
      revalidatedPath: REVALIDATED_PATH,
      persistedNodes: [...new Set(persistedNodes)],
      skippedNodes: [...new Set(skippedNodes)],
      failedNodes: [...new Set(failedNodes)],
      persistedFields: [...new Set(persistedFields)],
      skippedFields: [...new Set(skippedFields)],
      failedFields: [...new Set(failedFields)],
      verification,
      diagnostics,
      envDiagnostics,
    }
    return NextResponse.json(responseBody, { status: verification.ok ? 200 : 409 })
  } catch (error) {
    const diagnostics = getEnvDiagnostics()
    const envDiagnostics = diagnostics
    return NextResponse.json(
      {
        status: "failed",
        mode: "incomplete",
        step: "saving",
        message: error instanceof Error ? error.message : "Editor deploy route failed.",
        routeVersion: ROUTE_VERSION,
        publishedDocumentId: "resolved-at-deploy",
        publishedDocumentType: SANITY_DOC_TYPE,
        targetSection: TARGET_SECTION,
        heroTitleMode: "unknown",
        revalidatedPath: REVALIDATED_PATH,
        persistedNodes: [],
        skippedNodes: [],
        failedNodes: ["exception"],
        persistedFields: [],
        skippedFields: [],
        failedFields: ["exception"],
        diagnostics,
        envDiagnostics,
      },
      { status: 500 }
    )
  }
}
