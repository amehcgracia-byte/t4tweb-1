"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { opacity, y } = useScrollAnimation(sectionRef)
  const [copied, setCopied] = useState(false)

  const bioText = `Tales for the Tillerman is a Berlin-based collective blending world music, funk, soul, and reggae into a vibrant live experience. With roots spanning across continents, the band creates a sound that moves between groove, warmth, rhythm, and energy.

Their performances balance musical depth with danceable power, bringing together five musicians into one fluid, dynamic live act. Based in Berlin, the project brings together world music fusion, stage energy, and a strong collective identity.

5 musicians • Berlin-based • World music fusion • Live experience`

  const copyBio = async () => {
    try {
      await navigator.clipboard.writeText(bioText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch (error) {
      console.error("Copy failed", error)
    }
  }

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden"
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-full -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/about-bg-main.jpg')" }}
      />
      <div className="absolute inset-0 -z-10 bg-black/34" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/6 via-transparent to-black/18 pointer-events-none z-0" />

      <div className="relative z-10 min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-10 py-24 md:py-32">
        <motion.div
          style={{ opacity, y }}
          className="w-full max-w-6xl mx-auto"
        >
          <div className="text-center mb-14 md:mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-primary text-lg md:text-xl font-medium tracking-wider uppercase mb-6 block"
            >
              About the Band
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-5xl md:text-6xl lg:text-7xl text-white text-balance"
            >
              A Journey Through Sound
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="w-full rounded-2xl border border-white/12 bg-black/42 backdrop-blur-sm px-7 md:px-12 lg:px-14 py-10 md:py-14 shadow-2xl"
          >
            <div className="space-y-9 md:space-y-10 text-white">
              <p className="max-w-none text-xl md:text-2xl leading-relaxed text-white/92 mb-0">
                Tales for the Tillerman is a Berlin-based collective blending world music,
                funk, soul, and reggae into a vibrant live experience. With roots spanning
                across continents, the band creates a sound that moves between groove,
                warmth, rhythm, and energy.
              </p>

              <p className="max-w-none text-xl md:text-2xl leading-relaxed text-white/88 mb-0">
                Their performances balance musical depth with danceable power, bringing
                together five musicians into one fluid, dynamic live act. Based in Berlin,
                the project brings together world music fusion, stage energy, and a strong
                collective identity.
              </p>

              <p className="max-w-none text-lg md:text-xl leading-relaxed mb-0 pt-2">
                <span className="text-primary font-medium">5 musicians</span>
                <span className="text-white/55"> • </span>
                <span className="text-primary font-medium">Berlin-based</span>
                <span className="text-white/55"> • </span>
                <span className="text-primary font-medium">World music fusion</span>
                <span className="text-white/55"> • </span>
                <span className="text-primary font-medium">Live experience</span>
              </p>
            </div>
          </motion.div>

          <div className="mt-10 md:mt-12 flex justify-center">
            <motion.button
              onClick={copyBio}
              whileTap={{ scale: 0.96 }}
              animate={copied ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.35 }}
              className={`inline-flex items-center justify-center px-9 py-4 rounded-xl border text-lg md:text-xl font-semibold transition-all shadow-lg ${
                copied
                  ? "bg-orange-500 text-white border-orange-400 shadow-orange-500/40"
                  : "bg-orange-500/90 text-white border-orange-400/70 shadow-orange-500/30 hover:bg-orange-500"
              }`}
            >
              {copied ? "Copied" : "Copy"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}