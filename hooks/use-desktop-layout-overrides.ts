"use client"

import { useCallback, useSyncExternalStore } from "react"

/**
 * Pixel geometry is an editor aid, not a public layout contract. Keep the
 * responsive CSS layout on public pages and only enable saved geometry while
 * the visual editor is active on a desktop-sized viewport.
 */
export function useDesktopLayoutOverridesEnabled(isEditing = false): boolean {
  const subscribe = useCallback((onStoreChange: () => void) => {
    if (typeof window === "undefined") return () => {}
    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    mediaQuery.addEventListener("change", onStoreChange)
    return () => mediaQuery.removeEventListener("change", onStoreChange)
  }, [])

  const getSnapshot = useCallback(
    () => isEditing && typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches,
    [isEditing],
  )

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
