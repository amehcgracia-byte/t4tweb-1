'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useContentAnimation } from '@/hooks/useScrollAnimation'

interface ContentSectionProps {
  id: string
  children: React.ReactNode
  className?: string
}

/**
 * ContentSection: Componente reutilizable para secciones de puro contenido
 * (sin imagen de fondo)
 * 
 * IMPORTANTE: Este componente está pensado para usarse DENTRO de SceneSection
 * Es decir, el contenido que aparece encima de la imagen.
 * 
 * Si necesitas una sección independiente, usa SceneSection.
 */
export function ContentSection({
  id,
  children,
  className = '',
}: ContentSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const animations = useContentAnimation(sectionRef)

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`relative min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 ${className}`}
    >
      <motion.div
        style={{
          opacity: animations.opacity,
          y: animations.y,
        }}
        className="w-full mx-auto max-w-6xl"
      >
        {children}
      </motion.div>
    </section>
  )
}
