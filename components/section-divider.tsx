"use client"

import { motion } from "framer-motion"

export function SectionDivider() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-full h-16 md:h-20 bg-gradient-to-b from-transparent via-black/35 to-transparent"
    >
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </motion.div>
  )
}
