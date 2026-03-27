"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { opacity, y } = useScrollAnimation(sectionRef)

  // Variantes para los stats boxes (aparecen en secuencia)
  const statsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.6,
      },
    }),
  }

  const stats = [
    { number: "5", label: "Musicians" },
    { number: "Berlin", label: "Based" },
    { number: "World", label: "Music Fusion" },
    { number: "Live", label: "Experience" },
  ]

  return (
    <section id="about" ref={sectionRef} className="relative py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/about-section-bg.jpg"
          alt="About section background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mx-auto max-w-4xl">
          <motion.div
            style={{ opacity, y }}
            className="flex flex-col items-center mb-10"
          >
            <div className="text-center max-w-3xl">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-primary text-sm font-medium tracking-wider uppercase mb-4 block"
              >
                About the Band
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-serif text-5xl md:text-6xl lg:text-7xl text-foreground mb-8 text-balance"
              >
                A Journey Through Sound
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6 leading-relaxed text-xl md:text-2xl"
              >
                <p className="bg-black/70 text-white px-6 md:px-8 py-4 md:py-5 rounded-lg border border-black/30">
                  Tales for the Tillerman is a Berlin-based collective that weaves together 
                  world music, funk, soul, and reggae into a vibrant tapestry of sound. 
                  With roots spanning across continents, the band brings a unique fusion 
                  that transcends borders and speaks to the universal language of rhythm.
                </p>
                <p className="bg-black/70 text-white px-6 md:px-8 py-4 md:py-5 rounded-lg border border-black/30">
                  From intimate club shows to open-air festivals, the five-piece ensemble 
                  delivers electrifying performances that move both body and soul. Their 
                  music is a celebration of diversity, unity, and the timeless power of 
                  live music.
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                custom={index}
                initial="hidden"
                whileInView="visible"
                whileHover={{ y: -4, scale: 1.02 }}
                variants={statsVariants}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="p-4 md:p-5 bg-card/90 backdrop-blur-sm rounded-2xl border border-border text-center shadow-lg hover:shadow-xl hover:border-primary/50 transition-all"
              >
                <div className="font-serif text-3xl md:text-4xl text-primary mb-3">
                  {stat.number}
                </div>
                <div className="text-muted-foreground text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
