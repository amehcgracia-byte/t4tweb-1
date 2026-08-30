"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { useVisualEditor } from "@/components/visual-editor"
import type { HomeEditorNodeOverride } from "@/lib/sanity/home-editor-state"
import { getHomeEditorPersistedProps } from "@/lib/home-editor-persisted-props"

const view = { once: true, amount: 0.25 as const }

type SectionHeaderProps = {
  eyebrow: string
  title: string
  description?: string
  prepend?: ReactNode
  footer?: ReactNode
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  dataEditId?: string
  dataEditType?: string
  dataEditLabel?: string
  persistedOverrides?: Record<string, HomeEditorNodeOverride>
}

/**
 * Shared section title stack: eyebrow → heading → optional body → optional footer.
 * Uses global typography tokens for consistent rhythm with the rest of the site.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  prepend,
  footer,
  className = "",
  titleClassName = "",
  descriptionClassName = "",
  dataEditId,
  dataEditType,
  dataEditLabel,
  persistedOverrides = {},
}: SectionHeaderProps) {
  const { isEditing } = useVisualEditor()
  const resolveText = (nodeId: string, fallback: string) => {
    const override = persistedOverrides[nodeId]
    return override?.explicitContent && typeof override.content.text === "string" ? override.content.text : fallback
  }
  return (
    <div className={`mx-auto max-w-3xl text-center ${className}`}>
      {prepend ? <div className="mb-[var(--spacing-md)]">{prepend}</div> : null}

      <motion.span
        {...getHomeEditorPersistedProps(persistedOverrides[dataEditId ? `${dataEditId}-eyebrow` : ""], "desktop")}
        initial={isEditing ? false : { opacity: 0, y: 8 }}
        whileInView={isEditing ? undefined : { opacity: 1, y: 0 }}
        viewport={isEditing ? undefined : view}
        transition={isEditing ? undefined : { duration: 0.4 }}
        className="mb-[var(--spacing-sm)] block text-[length:var(--text-small)] font-semibold uppercase tracking-[0.2em] text-primary"
        data-editor-node-id={dataEditId ? `${dataEditId}-eyebrow` : undefined}
        data-editor-node-type="text"
        data-editor-node-label={dataEditLabel ? `${dataEditLabel} Eyebrow` : undefined}
      >
        {resolveText(dataEditId ? `${dataEditId}-eyebrow` : "", eyebrow)}
      </motion.span>

      <motion.h2
        {...getHomeEditorPersistedProps(persistedOverrides[dataEditId ? `${dataEditId}-title` : ""], "desktop")}
        initial={isEditing ? false : { opacity: 0, y: 10 }}
        whileInView={isEditing ? undefined : { opacity: 1, y: 0 }}
        viewport={isEditing ? undefined : view}
        transition={isEditing ? undefined : { duration: 0.45, delay: 0.04 }}
        className={`mb-[var(--spacing-md)] text-balance font-serif text-[length:var(--text-h2)] leading-[var(--line-height-tight)] text-foreground ${titleClassName}`}
        data-editor-node-id={dataEditId ? `${dataEditId}-title` : undefined}
        data-editor-node-type="text"
        data-editor-node-label={dataEditLabel ? `${dataEditLabel} Title` : undefined}
      >
        {resolveText(dataEditId ? `${dataEditId}-title` : "", title)}
      </motion.h2>

      {description ? (
        <motion.p
          {...getHomeEditorPersistedProps(persistedOverrides[dataEditId ? `${dataEditId}-description` : ""], "desktop")}
          initial={isEditing ? false : { opacity: 0, y: 10 }}
          whileInView={isEditing ? undefined : { opacity: 1, y: 0 }}
          viewport={isEditing ? undefined : view}
          transition={isEditing ? undefined : { duration: 0.45, delay: 0.08 }}
          className={`mx-auto max-w-2xl text-[length:var(--text-body)] leading-[var(--line-height-relaxed)] text-muted-foreground ${descriptionClassName}`}
          data-editor-node-id={dataEditId ? `${dataEditId}-description` : undefined}
          data-editor-node-type="text"
          data-editor-node-label={dataEditLabel ? `${dataEditLabel} Description` : undefined}
        >
          {resolveText(dataEditId ? `${dataEditId}-description` : "", description)}
        </motion.p>
      ) : null}

      {footer ? <div className="mt-[var(--spacing-md)]">{footer}</div> : null}
    </div>
  )
}
