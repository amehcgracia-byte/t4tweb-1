"use client"

import { motion } from "framer-motion"

export function SectionDivider() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-full h-12 md:h-16 bg-gradient-to-b from-transparent via-black/30 to-transparent"
    />
  )
}
