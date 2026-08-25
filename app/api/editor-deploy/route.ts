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

const ROUTE_VERSION = "sanity-editor-v4-responsive"
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

function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : undefined
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
  if (typeof value === "number") return asFiniteNumber(value)
  if (typeof value !== "string") return undefined
  const match = value.trim().match(/^-?\d+(?:\.\d+)?/)
  return match ? asFiniteNumber(Number(match[0])) : undefined
}

function buildPersistedElementStyle(node: DeployNodePayload): PersistedElementStyle | null {
  if (!HERO_LAYOUT_NODE_IDS.has(node.id)) return null
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
  }
  return Object.keys(style).length > 0 ? style : null
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
    if (Object.keys(nextElementStyles).length > 0 && payload.nodes.some((node) => buildPersistedElementStyle(node))) {
      heroPatch.elementStyles = nextElementStyles
    }

    if (Object.keys(heroPatch).length > 0) {
      await writeClient.patch(existingHero._id).set({ ...heroPatch, updatedAt: new Date().toISOString() }).commit()
      steps.push({ step: "saving", ok: true, message: `Hero section patched: ${existingHero._id}` })
    } else {
      steps.push({ step: "saving", ok: true, message: "No persistible Hero content changes detected; no patch applied." })
    }

    const publishedDocumentId = existingHero._id
    steps.push({ step: "publishing", ok: true, message: `Published Hero document: ${publishedDocumentId}` })

    revalidatePath(REVALIDATED_PATH)
    steps.push({ step: "revalidating", ok: true, message: "Public site revalidated." })

    return NextResponse.json({
      status: "ok",
      mode: "complete",
      step: "done",
      localSaved: false,
      remoteReady: true,
      message: "Deploy complete: Hero section updated in Sanity and public path revalidated.",
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
      diagnostics,
      envDiagnostics,
    })
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
