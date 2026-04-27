"use client"

import { useRef } from "react"
import { useVisualEditor } from "@/components/visual-editor"

interface SceneSectionProps {
  id: string
  children: React.ReactNode
  className?: string
}

export function SceneSection({ id, children, className = "" }: SceneSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const { isEditing } = useVisualEditor()

  return (
    <section
      ref={sectionRef}
      id={id}
      data-scene-section="true"
      className={`relative w-full overflow-x-clip ${className}`}
    >
      <div className="relative z-10 flex w-full items-center justify-center px-4 py-8 sm:px-6 sm:py-10 xl:min-h-[85vh] xl:min-h-[85dvh] xl:px-8 xl:py-14">
        {isEditing ? (
          <div className="w-full">{children}</div>
        ) : (
          <div className="w-full">{children}</div>
        )}
      </div>
    </section>
  )
}
