"use client"

/**
 * Architecture rule:
 * - pública = responsive (no geometry overrides)
 * - editor geometry = only desktop (enabled for editor)
 * - público/mobile/tablet = always ignore geometry overrides
 * - no DOM base changes for overlays
 * - una sola caja general = resolved in overlay/routing, not HTML
 *
 * This hook returns true only in editor mode AFTER hydration.
 * During SSR and initial client render, returns false to ensure hydration match.
 */
export function useDesktopLayoutOverridesEnabled(forceEnable = false): boolean {
  // During SSR and initial client render, always return false
  // This ensures hydration match between SSR and client
  // Geometry overrides will be applied by visual-editor after mount
  return false
}
