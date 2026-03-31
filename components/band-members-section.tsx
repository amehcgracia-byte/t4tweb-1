"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import { SectionHeader } from "@/components/section-header"

const members = [
  { id: 1, fullName: "Janosch Puhe", role: "Main Vocals", image: "/images/members/Janosch Puhe2.JPG" },
  { id: 2, fullName: "J.Ma Garcia Lopez", role: "Keys and Synth", image: "/images/members/J.Ma Garcia Lopez2.JPG" },
  { id: 3, fullName: "Otto Lorenz Contreras", role: "Drums", image: "/images/members/Otto Lorenz Contreras.JPG" },
  { id: 4, fullName: "Robii Crowford", role: "Electric Guitar", image: "/images/members/Robii Crowford.JPG" },
  { id: 5, fullName: "Tarik Benatmane", role: "Electric Bass", image: "/images/members/Tarik Benatmane.JPG" },
]

export function BandMembersSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const { opacity, y } = useScrollAnimation(sectionRef)

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden bg-black pt-[20vh]"
    >
      {/* Fondo full width */}
      <div className="absolute inset-0 -z-10">
        <img 
          src="/images/t4t-2.jpg"
          alt="Band background"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Gradiente superior */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-48 bg-gradient-to-b from-black via-black/90 to-transparent" />

      {/* Gradiente inferior */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-black via-black/90 to-transparent" />

      <div className="section-photo-scrim" />

      {/* Un solo barco: parallax izquierda→derecha + balanceo, centrado entre secciones */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          style={{ opacity, y }}
          className="mb-12 md:mb-16 text-center"
        >
          <SectionHeader
            eyebrow="The Musicians"
            title="Meet the Band"
            description="Five musicians from diverse backgrounds, united by a passion for rhythm and groove."
          />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="relative aspect-[4/5] lg:aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-950 order-2 lg:order-1 shadow-2xl">
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={false}
                animate={{
                  opacity: activeIndex === index ? 1 : 0,
                  scale: activeIndex === index ? 1 : 1.08,
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={member.image}
                  alt={member.fullName}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif text-white mb-2 tracking-tight">
                    {member.fullName}
                  </h3>
                  <p className="text-xl text-orange-400 font-medium">
                    {member.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4 order-1 lg:order-2">
            {members.map((member, index) => (
              <motion.button
                key={member.id}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                whileHover={{ scale: 1.02, x: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`group w-full text-left p-6 rounded-2xl border transition-all duration-300 flex justify-between items-center
                  ${
                    activeIndex === index
                      ? "border-orange-500 bg-zinc-900/80"
                      : "border-white/10 hover:border-white/20 bg-black/40 hover:bg-zinc-950"
                  }`}
              >
                <div>
                  <h4
                    className={`text-xl font-medium transition-colors ${
                      activeIndex === index ? "text-white" : "text-white/80 group-hover:text-white"
                    }`}
                  >
                    {member.fullName}
                  </h4>
                  <p
                    className={`text-sm mt-1 transition-colors ${
                      activeIndex === index ? "text-orange-400" : "text-white/50"
                    }`}
                  >
                    {member.role}
                  </p>
                </div>

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono border transition-all ${
                    activeIndex === index
                      ? "border-orange-500 text-orange-400 bg-orange-950"
                      : "border-white/20 text-white/40 group-hover:border-white/40"
                  }`}
                >
                  {String(member.id).padStart(2, "0")}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}