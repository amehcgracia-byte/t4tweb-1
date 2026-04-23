import { createClient } from "next-sanity"
import type { HomeEditorNodeOverride } from "@/lib/sanity/home-editor-state"
import { resolveSanityDataset, resolveSanityProjectId } from "@/lib/sanity/env"

interface HomeEditorStateRaw {
  nodesJson?: string
}

function createReadClient(perspective: "published" | "drafts" = "published") {
  const config: any = {
    projectId: resolveSanityProjectId(),
    dataset: resolveSanityDataset(),
    apiVersion: "2024-01-01",
    useCdn: false,
    perspective,
  }

  // Include token when loading drafts to access drafts perspective
  if (perspective === "drafts" && process.env.SANITY_API_TOKEN) {
    config.token = process.env.SANITY_API_TOKEN
  }

  return createClient(config)
}

export async function loadHomeEditorState(perspective: "published" | "drafts" = "published"): Promise<HomeEditorNodeOverride[]> {
  try {
    const client = createReadClient(perspective)
    const doc = await client.fetch<HomeEditorStateRaw | null>(
      `*[_id == "homeEditorState-singleton"][0]{ nodesJson }`
    )
    const raw = JSON.parse(doc?.nodesJson || "[]")
    if (!Array.isArray(raw)) return []

    // Legacy node IDs to filter out (removed from active editor)
    const LEGACY_NODE_IDS = new Set([
      "hero-title-main",
      "hero-title-accent",
      "about-photo-scrim",
      "press-kit-section",
      "press-kit-bg",
      "press-kit-main-card",
      "press-kit-folder-icon",
      "press-kit-title",
      "press-kit-description",
      "press-kit-download-button",
      "press-kit-resource-0",
      "press-kit-resource-1",
      "press-kit-manager",
    ])

    const HERO_DOC_DRIVEN_NODE_IDS = new Set([
      "hero-section",
      "hero-bg-image",
      "hero-title",
      "hero-subtitle",
      "hero-logo",
      "hero-scroll-indicator",
      "hero-scroll-label",
      "hero-buttons",
    ])

    const INTRO_DOC_DRIVEN_NODE_IDS = new Set([
      "intro-section",
      "intro-banner-gif",
      "intro-banner-text",
      "intro-book-button",
      "intro-press-button",
    ])

    const RELEASE_DOC_DRIVEN_NODE_IDS = new Set([
      "latest-release-section",
      "latest-release-bg",
      "latest-release-card",
      "latest-release-title",
      "latest-release-subtitle",
      "latest-release-watch-button",
      "latest-release-shows-button",
    ])

    const ABOUT_DOC_DRIVEN_NODE_IDS = new Set([
      "about-section",
      "about-bg-image",
      "about-header-eyebrow",
      "about-header-title",
      "about-text-card",
      "about-text-1",
      "about-text-2",
      "about-tags",
      "about-copy-button",
    ])

    const nodes = raw
      .map((raw): HomeEditorNodeOverride | null => {
        if (!raw || typeof raw !== "object") return null
        const n = raw as Record<string, unknown>
        const nodeId = typeof n.nodeId === "string" ? n.nodeId : typeof n.id === "string" ? n.id : null
        if (!nodeId) return null
        if (
          LEGACY_NODE_IDS.has(nodeId) ||
          HERO_DOC_DRIVEN_NODE_IDS.has(nodeId) ||
          INTRO_DOC_DRIVEN_NODE_IDS.has(nodeId) ||
          RELEASE_DOC_DRIVEN_NODE_IDS.has(nodeId) ||
          ABOUT_DOC_DRIVEN_NODE_IDS.has(nodeId)
        ) return null
        const nodeType = typeof n.nodeType === "string" ? n.nodeType : typeof n.type === "string" ? n.type : "text"
        const geometry = (n.geometry && typeof n.geometry === "object" ? n.geometry : {}) as Record<string, unknown>
        const style = (n.style && typeof n.style === "object" ? n.style : {}) as Record<string, unknown>
        const content = (n.content && typeof n.content === "object" ? n.content : {}) as Record<string, unknown>
        return {
          nodeId,
          nodeType: nodeType as HomeEditorNodeOverride["nodeType"],
          geometry: {
            x: typeof geometry.x === "number" ? geometry.x : 0,
            y: typeof geometry.y === "number" ? geometry.y : 0,
            width: typeof geometry.width === "number" ? geometry.width : 0,
            height: typeof geometry.height === "number" ? geometry.height : 0,
          },
          style: style as HomeEditorNodeOverride["style"],
          content: content as HomeEditorNodeOverride["content"],
          explicitContent: Boolean(n.explicitContent),
          explicitStyle: Boolean(n.explicitStyle),
          explicitPosition: Boolean(n.explicitPosition),
          explicitSize: Boolean(n.explicitSize),
          updatedAt: typeof n.updatedAt === "string" ? n.updatedAt : new Date().toISOString(),
        }
      })
      .filter((node): node is HomeEditorNodeOverride => Boolean(node))

    return nodes
  } catch (error) {
    console.error("[home-editor-state-loader] Failed to load home editor state", error)
    return []
  }
}
