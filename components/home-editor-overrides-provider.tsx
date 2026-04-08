"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import type { HomeEditorNodeOverride } from "@/lib/sanity/home-editor-state"

interface HomeEditorOverridesContextValue {
  resolveImageSrc: (nodeId: string, fallback: string) => string
}

const HomeEditorOverridesContext = createContext<HomeEditorOverridesContextValue>({
  resolveImageSrc: (_nodeId: string, fallback: string) => fallback,
})

function isValidPersistedSrc(value: unknown): value is string {
  if (typeof value !== "string") return false
  const src = value.trim()
  if (!src) return false
  if (src.startsWith("blob:") || src.startsWith("data:") || src.startsWith("javascript:")) return false
  return true
}

export function HomeEditorOverridesProvider({ nodes, children }: { nodes: HomeEditorNodeOverride[]; children: ReactNode }) {
  const srcByNodeId = useMemo(() => {
    const map = new Map<string, string>()
    nodes.forEach((node) => {
      if ((node.nodeType === "image" || node.nodeType === "background") && node.explicitContent && isValidPersistedSrc(node.content.src)) {
        map.set(node.nodeId, node.content.src)
      }
    })
    return map
  }, [nodes])

  const value = useMemo<HomeEditorOverridesContextValue>(() => ({
    resolveImageSrc: (nodeId: string, fallback: string) => srcByNodeId.get(nodeId) || fallback,
  }), [srcByNodeId])

  return <HomeEditorOverridesContext.Provider value={value}>{children}</HomeEditorOverridesContext.Provider>
}

export function useHomeEditorImageSrc(nodeId: string, fallback: string): string {
  const { resolveImageSrc } = useContext(HomeEditorOverridesContext)
  return resolveImageSrc(nodeId, fallback)
}
