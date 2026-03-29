"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })

  const logoY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const logoScale = useTransform(scrollYProgress, [0, 1], [1, 0.5])
  const logoOpacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.88, 1],
    [0, 1, 1, 0]
  )

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/t4tPics/hero-bg.jpg"
          alt="Hero background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="relative z-10 min-h-screen w-full flex flex-col justify-between px-4 sm:px-6 lg:px-10 pt-24 md:pt-28 pb-10">
        <div className="flex justify-center pt-2 md:pt-4">
          <motion.div
            style={{
              y: logoY,
              scale: logoScale,
              opacity: logoOpacity,
            }}
            className="origin-top"
          >
            <Image
              src="/images/t4tPics/logo-white.png"
              alt="Tales for the Tillerman Logo"
              width={380}
              height={380}
              className="mx-auto"
              priority
            />
          </motion.div>
        </div>

        <div className="pb-12 md:pb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.35 }}
            className="text-xl sm:text-2xl md:text-3xl text-white mb-8 max-w-4xl mx-auto text-center"
          >
            World music, funk, and soul from Berlin
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <a
              href="#press-kit"
              className="px-12 py-6 bg-primary/78 text-primary-foreground rounded-xl text-xl md:text-2xl font-semibold"
            >
              View Press Kit
            </a>

            <a
              href="#contact"
              className="px-12 py-6 bg-white/15 text-white rounded-xl text-xl md:text-2xl font-semibold border border-white/20"
            >
              Book the Band
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}