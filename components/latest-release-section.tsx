"use client"

import { motion } from "framer-motion"

export function LatestReleaseSection() {
  return (
    <section className="relative border-y border-primary/20 bg-gradient-to-b from-black/90 via-black/75 to-black/90 py-10 md:py-14">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-white/15 bg-card/50 p-6 md:p-8 backdrop-blur-sm"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Latest Release
              </p>
              <h3 className="font-serif text-2xl text-foreground md:text-3xl">
                Tales for the Tillerman — New Single Out Now
              </h3>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                Listen on your favorite platform and follow upcoming live dates.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href="https://open.spotify.com/artist/0FHjK3O0k8HQMrJsF7KQwF"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-[#1DB954] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Spotify
              </a>
              <a
                href="https://music.apple.com/us/artist/tales-for-the-tillerman/1819840222"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white/20"
              >
                Apple Music
              </a>
              <a
                href="https://www.youtube.com/@Tales4Tillerman"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-[#FF0000] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                YouTube
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
