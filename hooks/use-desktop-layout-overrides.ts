"use client"

import { useEffect, useState } from "react"

/**
 * Pixel geometry is an editor aid, not a public layout contract. Keep the
 * responsive CSS layout on public pages and only enable saved geometry while
 * the visual editor is active on a desktop-sized viewport.
 */
export function useDesktopLayoutOverridesEnabled(isEditing = false): boolean {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return isEditing && window.matchMedia("(min-width: 1024px)").matches
  })

  useEffect(() => {
    if (!isEditing) {
      setEnabled(false)
      return
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const update = () => setEnabled(mediaQuery.matches)
    update()
    mediaQuery.addEventListener("change", update)
    return () => {
      mediaQuery.removeEventListener("change", update)
    }
  }, [isEditing])

  return enabled
}
