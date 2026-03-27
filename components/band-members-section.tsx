"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"

const members = [
  {
    id: 1,
    name: "Janosch",
    fullName: "Janosch Puhe",
    role: "Main Vocals",
    image: "/images/members/Janosch Puhe2.JPG",
    color: "from-amber-500/30",
  },
  {
    id: 2,
    name: "J.Ma",
    fullName: "J.Ma Garcia Lopez",
    role: "Keys and Synth",
    image: "/images/members/J.Ma Garcia Lopez2.JPG",
    color: "from-teal-500/30",
  },
  {
    id: 3,
    name: "Otto",
    fullName: "Otto Lorenz Contreras",
    role: "Drums",
    image: "/images/members/Otto Lorenz Contreras.JPG",
    color: "from-indigo-500/30",
  },
  {
    id: 4,
    name: "Robii",
    fullName: "Robii Crowford",
    role: "E Guit",
    image: "/images/members/Robii Crowford.JPG",
    color: "from-rose-500/30",
  },
  {
    id: 5,
    name: "Tarik",
    fullName: "Tarik Benatmane",
    role: "E Bass",
    image: "/images/members/Tarik Benatmane.JPG",
    color: "from-orange-500/30",
  },
]

export function BandMembersSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const { opacity, y } = useScrollAnimation(sectionRef)

  const memberVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.05,
        duration: 0.5,
      },
    }),
  }

  return (
    <section
      id="band"
      ref={sectionRef}
      className="py-16 md:py-20 bg-background relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          style={{ opacity, y }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-primary text-sm font-medium tracking-wider uppercase mb-4 block"
          >
            The Musicians
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 text-balance"
          >
            Meet the Band
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
          >
            Five musicians from diverse backgrounds, united by a passion for rhythm and groove.
          </motion.p>
        </motion.div>

        {/* Interactive Member Display */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Member Photo Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary order-2 lg:order-1"
          >
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                animate={
                  activeIndex === index
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 1.05 }
                }
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className={`absolute inset-0 ${
                  activeIndex !== index && "pointer-events-none"
                }`}
              >
                <Image
                  src={member.image}
                  alt={member.fullName}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Si la imagen falla, mostrar un gradiente
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.style.display = "none"
                    }
                  }}
                />
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-card to-transparent" />
                {/* Member info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-1">
                    {member.fullName}
                  </h3>
                  <p className="text-muted-foreground">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Member Names List - Interactive */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3 order-1 lg:order-2"
          >
            {members.map((member, index) => (
              <motion.button
                key={member.id}
                custom={index}
                initial="hidden"
                whileInView="visible"
                variants={memberVariants}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full text-left p-5 md:p-6 rounded-2xl border transition-all duration-300 group ${
                  activeIndex === index
                    ? "bg-secondary border-primary/50 shadow-lg"
                    : "bg-secondary/30 border-border hover:border-muted hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className={`font-serif text-xl md:text-2xl transition-colors ${
                        activeIndex === index
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {member.name}
                    </h3>
                    <p
                      className={`text-sm transition-colors ${
                        activeIndex === index
                          ? "text-muted-foreground"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {member.role}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      activeIndex === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        activeIndex === index ? "translate-x-0.5" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
