"use client"

import { motion } from "framer-motion"
import type { HomeEditorNodeOverride } from "@/lib/sanity/home-editor-state"
import { getHomeEditorPersistedProps } from "@/lib/home-editor-persisted-props"

interface SectionDividerProps {
  editorId?: string
  persistedOverride?: HomeEditorNodeOverride
}

export function SectionDivider({ editorId, persistedOverride }: SectionDividerProps) {
  return (
    <motion.div
      {...getHomeEditorPersistedProps(
        persistedOverride,
        persistedOverride?.nodeId === "section-divider-contact-footer" ? "footer" : undefined,
      )}
      data-editor-node-id={editorId}
      data-editor-node-type="section"
      data-editor-node-label={editorId ? `Divider: ${editorId}` : "Section Divider"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative h-8 w-full bg-gradient-to-b from-transparent via-black/10 to-transparent md:h-12"
    />
  )
}
