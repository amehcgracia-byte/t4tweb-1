"use client"

import { useCallback, useSyncExternalStore } from "react"

/**
 * Keep saved pixel geometry limited to desktop-sized viewports. Components
 * can opt into applying the same saved desktop layout on the public page,
 * while mobile keeps its responsive CSS layout.
 */
export function useDesktopLayoutOverridesEnabled(isEditing = false, applyPublic = false): boolean {
  const subscribe = useCallback((onStoreChange: () => void) => {
    if (typeof window === "undefined") return () => {}
    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    mediaQuery.addEventListener("change", onStoreChange)
    return () => mediaQuery.removeEventListener("change", onStoreChange)
  }, [])

  const getSnapshot = useCallback(
    () => (isEditing || applyPublic) && typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches,
    [applyPublic, isEditing],
  )

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
