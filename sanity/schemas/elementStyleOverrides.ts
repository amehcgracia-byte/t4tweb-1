import { defineField } from 'sanity'

/**
 * Generic elementStyles field config for storing visual editor layout + typography + image filters.
 * Stored as a JSON object where keys are node IDs (can contain hyphens) and values are style objects.
 * Uses Sanity's 'json' type to allow arbitrary key-value structure without field schema.
 *
 * Usage: defineField(elementStylesFieldConfig())
 */
export function elementStylesFieldConfig(title: string = 'Visual editor layout overrides') {
  return {
    name: 'elementStyles',
    title,
    type: 'json',
    description: 'Position, size, and style saved from /editor deploy. Keys match on-page node IDs (e.g., hero-section, hero-logo).',
    options: { collapsible: true, collapsed: true },
  }
}
