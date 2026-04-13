"use client"

import { useVisualEditor } from "@/components/visual-editor"
import { ReactNode, useEffect, useState } from "react"

/**
 * Wrapper that prevents rendering content in /editor until editor state is ready
 * This avoids the "fallback visual" where published content shows before being replaced
 *
 * CRITICAL: Always render children in HTML (for hydration). Use state to show/hide loader on client only.
 */
export function EditorAwareHomePageWrapper({ children, isEditorRoute }: { children: ReactNode; isEditorRoute: boolean }) {
  const { isEditing, editorBootComplete } = useVisualEditor()
  const [isClient, setIsClient] = useState(false)

  // Mark that we're on client (after hydration)
  useEffect(() => {
    setIsClient(true)
  }, [])

  const shouldShowLoader = isClient && isEditorRoute && (!isEditing || !editorBootComplete)

  if (shouldShowLoader) {
    console.log('[WRAPPER] Showing loader', { isEditing, editorBootComplete })
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white opacity-50 text-sm">Loading editor...</div>
        </div>
      </div>
    )
  }

  if (isClient) {
    console.log('[WRAPPER] Showing content', { isEditing, editorBootComplete })
  }
  return <>{children}</>
}
