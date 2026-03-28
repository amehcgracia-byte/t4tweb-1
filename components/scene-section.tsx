"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useContentAnimation } from "@/hooks/useScrollAnimation"

interface SceneSectionProps {
  id: string
  imageSrc: string
  imageAlt: string
  children: React.ReactNode
  className?: string
}

/**
 * SceneSection: Núcleo de la experiencia tipo Apple
 * 
 * Estructura:
 * - Sticky wrapper con imagen dominante
 * - Contenido que aparece encima
 * - Animaciones controladas por scroll
 * - UNA sola imagen por sección (sin duplicaciones)
 * 
 * Comportamiento:
 * - Imagen: fade in/out, micro zoom, parallax leve
 * - Contenido: fade in/out, trasladoY suave
 * - Total height: 200vh (imagen ocupa 100vh, contenido 100vh)
 */
export function SceneSection({
  id,
  imageSrc,
  imageAlt,
  children,
  className = "",
}: SceneSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const contentAnimations = useContentAnimation(sectionRef)

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`relative min-h-screen ${className}`}
    >
      {/* ===== SECTION BACKGROUND IMAGE ===== */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          priority={id === "hero"}
        />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* ===== CONTENT WRAPPER (optimizado para flujo visual) ===== */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <motion.div
          style={{
            opacity: contentAnimations.opacity,
            y: contentAnimations.y,
          }}
          className="w-full mx-auto max-w-6xl"
        >
          {children}
        </motion.div>
      </div>
    </section>
  )
}
