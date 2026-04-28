"use client"

import type { HomeEditorNodeOverride } from "@/lib/sanity/home-editor-state"

export function ExtraNodesRenderer({
  nodes: _nodes,
  sectionId: _sectionId,
  allowPointerEvents: _allowPointerEvents = false,
}: {
  nodes: HomeEditorNodeOverride[]
  sectionId?: string
  allowPointerEvents?: boolean
}) {
  return null
}
