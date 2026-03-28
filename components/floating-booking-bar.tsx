"use client"

import { motion } from "framer-motion"

export function FloatingBookingBar() {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.2 }}
      className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-2xl border border-white/15 bg-black/80 p-2 backdrop-blur-xl shadow-2xl shadow-black/50 md:hidden"
    >
      <div className="grid grid-cols-2 gap-2">
        <a
          href="#live"
          className="inline-flex items-center justify-center rounded-xl border border-primary/30 bg-primary/15 px-4 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/25"
        >
          See Shows
        </a>
        <a
          href="mailto:talesforthetillerman@gmail.com"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
        >
          Book Now
        </a>
      </div>
    </motion.div>
  )
}
