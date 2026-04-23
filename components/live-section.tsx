"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import { SectionHeader } from "@/components/section-header"
import { useVisualEditor } from "@/components/visual-editor"
import { getElementLayoutStyle } from "@/lib/hero-layout-styles"
import type { LiveConcert, LiveSectionData } from "@/lib/live-concerts-loader"

interface LiveSectionProps {
  data: LiveSectionData
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "Date TBA"
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim())
  if (!match) return dateStr
  const [, year, month, day] = match
  const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(month) - 1]
  if (!monthName) return dateStr
  return `${day} ${monthName} ${year}`
}

function formatPrice(price: string): string {
  const value = price.trim()
  if (!value) return "Price TBA"
  if (/^free$/i.test(value)) return "Free"
  if (/^[€$£]/.test(value)) return value
  return value
}

function safeConcertsDataset(concerts: LiveConcert[]): string {
  try {
    return JSON.stringify(concerts)
  } catch {
    return "[]"
  }
}

function deriveConcertStatus(concert: LiveConcert): LiveConcert["status"] {
  if (/cancelled/i.test(concert.status || "")) return "Cancelled"
  if (!concert.date) return "Upcoming"
  const iso = `${concert.date}T${concert.time && /^\d{2}:\d{2}/.test(concert.time) ? concert.time : "23:59"}:00Z`
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return concert.status || "Upcoming"
  return parsed.getTime() < Date.now() ? "Completed" : "Upcoming"
}

function sortByConcertDate(a: LiveConcert, b: LiveConcert): number {
  return new Date(a.date || "9999-12-31").getTime() - new Date(b.date || "9999-12-31").getTime()
}

function SpotifyIcon() {
  return <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
}
function AppleMusicIcon() {
  return <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.098 10.638c0-1.1.08-2.267.244-3.57 0-.603.528-1.1 1.117-1.1.59 0 1.12.497 1.12 1.1-.206 1.303-.326 2.47-.326 3.57 0 8.998 5.291 16.594 12.061 20.15h-.003c.4.23.654.668.654 1.15 0 .744-.603 1.346-1.345 1.346-.527 0-.996-.31-1.212-.744-.259-.528-.528-1.057-.806-1.646h-1.923c-.28.59-.548 1.12-.806 1.646-.216.435-.685.744-1.212.744-.742 0-1.345-.603-1.345-1.346 0-.482.254-.92.654-1.15 6.77-3.556 12.061-11.152 12.061-20.15zm-6.055 1.104c0 .836.68 1.516 1.516 1.516.835 0 1.515-.68 1.515-1.516 0-.835-.68-1.515-1.515-1.515-.836 0-1.516.68-1.516 1.515zm8.993 6.057c-.683 0-1.237.554-1.237 1.237 0 .683.554 1.238 1.237 1.238.684 0 1.238-.555 1.238-1.238 0-.683-.554-1.237-1.238-1.237zm-14.22-8.76c1.1 1.1 1.897 2.678 1.897 4.45 0 3.553-2.898 6.451-6.452 6.451-3.553 0-6.451-2.898-6.451-6.451 0-1.772.797-3.35 1.897-4.45C-2.09 8.537-2.696 6.264-2.696 3.76c0-5.516 4.48-9.996 9.996-9.996 5.516 0 9.996 4.48 9.996 9.996 0 2.504-.607 4.777-1.59 6.825z" /></svg>
}
function YouTubeIcon() {
  return <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
}
function SoundCloudIcon() {
  return <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M1.175 12.225c-.051 0-.175.016-.175.175v1.2c0 .158.124.175.175.175.051 0 .175-.017.175-.175v-1.2c0-.159-.124-.175-.175-.175zm1.633 1.957c-.089 0-.109.124-.109.175v.65c0 .051.02.175.109.175.088 0 .108-.124.108-.175v-.65c0-.051-.02-.175-.108-.175zm1.308-1.957c-.052 0-.175.016-.175.175v1.2c0 .158.123.175.175.175.051 0 .175-.017.175-.175v-1.2c0-.159-.124-.175-.175-.175zm1.337 1.296c-.051 0-.175.017-.175.175v.725c0 .158.124.175.175.175.051 0 .175-.017.175-.175v-.725c0-.158-.124-.175-.175-.175zm7.326-5.553c-.759 0-1.451.205-2.057.561-.184-3.214-2.969-5.745-6.326-5.745-3.595 0-6.513 2.849-6.513 6.359 0 .339.029.671.087.998-.57.583-.925 1.391-.925 2.285 0 1.873 1.505 3.39 3.371 3.39h12.443c2.208 0 4-1.79 4-4s-1.792-4-4-4z" /></svg>
}
function BandcampIcon() {
  return <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M5.51 2H2.72A1.97 1.97 0 0 0 .75 3.97v16.06A1.97 1.97 0 0 0 2.72 22h16.06a1.97 1.97 0 0 0 1.97-1.97V3.97A1.97 1.97 0 0 0 18.78 2H5.51zm5.96 11.37l-4.15 5.54h4.15V13.37z" /></svg>
}
function AmazonMusicIcon() {
  return <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6.5 14c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3m3.5-9h2.15v12.87h-2.15zm5 0h2.15v12.87h-2.15zM.5 14c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>
}
function TidalIcon() {
  return <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 2L0 8v8l8 6 8-6V8L8 2zm4 10l-4 3-4-3V6l4-3 4 3v6z" /></svg>
}
function DeezerIcon() {
  return <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2 4h4v2H2V4zm6 0h4v2H8V4zm6 0h4v2h-4V4zm-12 4h4v2H2V8zm6 0h4v2H8V8zm6 0h4v2h-4V8zm-12 4h4v2H2v-2zm6 0h4v2H8v-2zm6 0h4v2h-4v-2zm-12 4h4v2H2v-2zm6 0h4v2H8v-2zm6 0h4v2h-4v-2z" /></svg>
}
function InstagramIcon() {
  return <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
}
function TikTokIcon() {
  return <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.51v13.69a2.82 2.82 0 0 1-2.94 2.85 2.88 2.88 0 0 1-2.94-2.85c0-1.56 1.3-2.91 2.94-2.91.37 0 .74.08 1.1.24V9.4a5.9 5.9 0 0 0-1.1-.1C5.5 9.3 2 12.78 2 17.01c0 4.2 3.5 7.69 7.79 7.69 4.29 0 7.79-3.49 7.79-7.69 0-.29 0-.58-.03-.87.16.03.3.07.47.09v-3.1a5.1 5.1 0 0 1-.94-.09" /></svg>
}
function FacebookIcon() {
  return <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
}
function BandsinTownIcon() {
  return <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm3-10c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm-2 0c0-1.105-.895-2-2-2s-2 .895-2 2 .895 2 2 2 2-.895 2-2z" /></svg>
}

type PlatformIconComponent = () => ReturnType<typeof BandsinTownIcon>

const PLATFORM_ICON_MAP: Record<string, PlatformIconComponent> = {
  Spotify: SpotifyIcon,
  "Apple Music": AppleMusicIcon,
  "YouTube Music": YouTubeIcon,
  SoundCloud: SoundCloudIcon,
  Bandcamp: BandcampIcon,
  "Amazon Music": AmazonMusicIcon,
  Tidal: TidalIcon,
  Deezer: DeezerIcon,
  YouTube: YouTubeIcon,
  Instagram: InstagramIcon,
  TikTok: TikTokIcon,
  Facebook: FacebookIcon,
}

const PLATFORM_COLOR_MAP: Record<string, string> = {
  Spotify: "hover:bg-[#1DB954]",
  "Apple Music": "hover:bg-[#FA243C]",
  "YouTube Music": "hover:bg-[#FF0000]",
  SoundCloud: "hover:bg-[#FF7700]",
  Bandcamp: "hover:bg-[#1DA0C3]",
  "Amazon Music": "hover:bg-[#00A8E1]",
  Tidal: "hover:bg-[#00D7FF]",
  Deezer: "hover:bg-[#FF0099]",
  YouTube: "hover:bg-[#FF0000]",
  Instagram: "hover:bg-[#E1306C]",
  TikTok: "hover:bg-[#000000]",
  Facebook: "hover:bg-[#1877F2]",
}

export function LiveSection({ data }: LiveSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [concerts, setConcerts] = useState<LiveConcert[]>(data.concerts)
  const [activeConcert, setActiveConcert] = useState<LiveConcert | null>(null)
  const { opacity, y } = useScrollAnimation(sectionRef)
  const { isEditing } = useVisualEditor()

  useEffect(() => {
    setConcerts(data.concerts)
  }, [data.concerts])

  useEffect(() => {
    if (!isEditing) return
    const onConcertsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ concerts?: LiveConcert[] }>).detail
      if (Array.isArray(detail?.concerts)) setConcerts(detail.concerts)
    }
    window.addEventListener("live-concerts-updated", onConcertsUpdated)
    return () => window.removeEventListener("live-concerts-updated", onConcertsUpdated)
  }, [isEditing])

  const derivedConcerts = useMemo(
    () =>
      concerts
        .map((concert) => ({
          ...concert,
          status: deriveConcertStatus(concert),
        }))
        .sort(sortByConcertDate),
    [concerts]
  )

  const upcomingConcerts = derivedConcerts.filter((concert) => concert.status !== "Completed")
  const historyConcerts = [...derivedConcerts.filter((concert) => concert.status === "Completed")].reverse()
  const streamingPlatforms = data.streamingPlatforms || []
  const socialPlatforms = data.socialPlatforms || []

  return (
    <section
      ref={sectionRef}
      data-editor-node-id="live-section"
      data-editor-node-type="section"
      data-editor-node-label="Live Section"
      className="relative min-h-screen overflow-hidden bg-black"
      style={getElementLayoutStyle(data.elementStyles, "live-section")}
    >
      <div
        className="absolute inset-0 z-0"
        data-editor-node-id="live-section-bg-image"
        data-editor-node-type="background"
        data-editor-media-kind="image"
        data-editor-node-label="Live Section Background Image"
        style={getElementLayoutStyle(data.elementStyles, "live-section-bg-image")}
      >
        <Image
          src={data.backgroundImageUrl}
          alt="Live section background"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 bg-black/45" />
      <div className="section-photo-fade-top" />
      <div className="section-photo-fade-bottom" />

      <div className="relative z-20 w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <motion.div style={isEditing ? undefined : { opacity, y }} className="mb-16 text-center">
            <SectionHeader
              eyebrow="Live Performances"
              title="See All Shows"
              description="From intimate club dates to festivals and support slots, the live section now reads from one concert source and splits upcoming/history automatically."
              dataEditId="live-see-shows-header"
              dataEditLabel="Live See Shows Header"
            />
            <motion.a
              data-editor-node-id="live-section-see-shows-button"
              data-editor-node-type="button"
              data-editor-node-label="See All Shows Button"
              whileHover={isEditing ? undefined : { scale: 1.02, y: -2 }}
              transition={isEditing ? undefined : { type: "spring", stiffness: 320, damping: 22 }}
              href="https://www.bandsintown.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-xl bg-[#FF8C21] px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-[#ff7c05]"
              style={getElementLayoutStyle(data.elementStyles, "live-section-see-shows-button")}
            >
              <BandsinTownIcon />
              Bandsintown
            </motion.a>
          </motion.div>

          <motion.div
            initial={isEditing ? false : { opacity: 0, y: 20 }}
            whileInView={isEditing ? undefined : { opacity: 1, y: 0 }}
            transition={isEditing ? undefined : { duration: 0.5, delay: 0.05 }}
            className="mb-14"
          >
            <SectionHeader
              eyebrow="Listen"
              title="Stream Our Music"
              className="mb-8"
              dataEditId="live-stream-header"
              dataEditLabel="Live Stream Header"
            />

            <div
              className="mb-10"
              data-editor-node-id="live-stream-platforms-group"
              data-editor-node-type="card"
              data-editor-node-label="Live Streaming Platforms Group"
              data-editor-grouped="true"
              style={getElementLayoutStyle(data.elementStyles, "live-stream-platforms-group")}
            >
              <h4
                data-editor-node-id="live-stream-platforms-title"
                data-editor-node-type="text"
                data-editor-node-label="Live Streaming Platforms Title"
                className="mb-4 block text-sm font-medium uppercase tracking-wider text-[#FFB15A]"
                style={getElementLayoutStyle(data.elementStyles, "live-stream-platforms-title")}
              >
                Spotify, Apple Music & More
              </h4>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
                {streamingPlatforms.map((platform) => {
                  const Icon = PLATFORM_ICON_MAP[platform.name] || BandsinTownIcon
                  return (
                    <motion.a
                      key={platform.id}
                      data-editor-node-id={platform.id}
                      data-editor-node-type="button"
                      data-editor-node-label={`Streaming: ${platform.name}`}
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={isEditing ? undefined : { y: -2, scale: 1.02 }}
                      transition={isEditing ? undefined : { duration: 0.25 }}
                      className={`flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-4 text-white shadow-lg transition-all duration-300 hover:border-transparent ${PLATFORM_COLOR_MAP[platform.name] || "hover:bg-[#FF8C21]"}`}
                      style={getElementLayoutStyle(data.elementStyles, platform.id)}
                    >
                      <Icon />
                      <span className="mt-2 text-center text-xs font-medium">{platform.name}</span>
                    </motion.a>
                  )
                })}
              </div>
            </div>

            <div
              data-editor-node-id="live-social-platforms-group"
              data-editor-node-type="card"
              data-editor-node-label="Live Social Platforms Group"
              data-editor-grouped="true"
              style={getElementLayoutStyle(data.elementStyles, "live-social-platforms-group")}
            >
              <h4
                data-editor-node-id="live-social-platforms-title"
                data-editor-node-type="text"
                data-editor-node-label="Live Social Platforms Title"
                className="mb-4 block text-sm font-medium uppercase tracking-wider text-[#FFB15A]"
                style={getElementLayoutStyle(data.elementStyles, "live-social-platforms-title")}
              >
                Follow Us
              </h4>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {socialPlatforms.map((platform) => {
                  const Icon = PLATFORM_ICON_MAP[platform.name] || BandsinTownIcon
                  return (
                    <motion.a
                      key={platform.id}
                      data-editor-node-id={platform.id}
                      data-editor-node-type="button"
                      data-editor-node-label={`Social: ${platform.name}`}
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={isEditing ? undefined : { y: -2, scale: 1.02 }}
                      transition={isEditing ? undefined : { duration: 0.25 }}
                      className={`flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-5 text-white shadow-lg transition-all duration-300 hover:border-transparent ${PLATFORM_COLOR_MAP[platform.name] || "hover:bg-[#FF8C21]"}`}
                      style={getElementLayoutStyle(data.elementStyles, platform.id)}
                    >
                      <Icon />
                      <span className="mt-2 text-center text-xs font-medium">{platform.name}</span>
                    </motion.a>
                  )
                })}
              </div>
            </div>
          </motion.div>

          <div
            data-editor-node-id="live-section-concerts-container"
            data-editor-node-type="card"
            data-editor-node-label="Live Concerts Container"
            data-editor-grouped="true"
            data-editor-explicit-content="true"
            data-live-concerts={safeConcertsDataset(derivedConcerts)}
            className="relative"
            style={getElementLayoutStyle(data.elementStyles, "live-section-concerts-container")}
          >
            <motion.div
              initial={isEditing ? false : { opacity: 0, y: 20 }}
              whileInView={isEditing ? undefined : { opacity: 1, y: 0 }}
              transition={isEditing ? undefined : { duration: 0.5 }}
              className="mb-12 min-h-[360px]"
            >
              <h3
                data-editor-node-id="live-upcoming-title"
                data-editor-node-type="text"
                data-editor-node-label="Live Upcoming Title"
                className="mb-6 text-center font-serif text-3xl text-white"
                style={getElementLayoutStyle(data.elementStyles, "live-upcoming-title")}
              >
                Upcoming
              </h3>

              {upcomingConcerts.length > 0 ? (
                <div className="space-y-3" style={getElementLayoutStyle(data.elementStyles, "live-upcoming-list")}>
                  {upcomingConcerts.map((concert, index) => {
                    const cardId = `live-upcoming-event-${concert._editorId}`
                    return (
                      <motion.div
                        key={`upcoming-${concert._editorId}`}
                        data-editor-node-id={cardId}
                        data-editor-node-type="card"
                        data-editor-node-label={`Upcoming Event ${index + 1}`}
                        data-editor-grouped="true"
                        data-concert-card="true"
                        data-concert-id={concert._editorId}
                        className="min-h-[96px] rounded-xl border border-white/10 bg-black/35 p-5 shadow-lg transition-all duration-300 hover:border-[#FF8C21]/40 hover:bg-black/50"
                        style={getElementLayoutStyle(data.elementStyles, cardId)}
                        role={isEditing ? undefined : "button"}
                        tabIndex={isEditing ? undefined : 0}
                        onClick={isEditing ? undefined : () => setActiveConcert(concert)}
                        onKeyDown={isEditing ? undefined : (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            setActiveConcert(concert)
                          }
                        }}
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                          <div
                            data-editor-node-id={`${cardId}-date`}
                            data-editor-node-type="text"
                            data-editor-node-label={`Upcoming Event ${index + 1} Date`}
                            data-concert-field="date"
                            style={getElementLayoutStyle(data.elementStyles, `${cardId}-date`)}
                            className="min-w-[110px] shrink-0 font-medium text-[#FFB15A]"
                          >
                            {formatDate(concert.date)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div
                              data-editor-node-id={`${cardId}-eventName`}
                              data-editor-node-type="text"
                              data-editor-node-label={`Upcoming Event ${index + 1} Event Name`}
                              data-concert-field="eventName"
                              className="font-serif text-xl text-white"
                              style={getElementLayoutStyle(data.elementStyles, `${cardId}-eventName`)}
                            >
                              {concert.eventName || "Event TBA"}
                            </div>
                            <div
                              data-editor-node-id={`${cardId}-locationName`}
                              data-editor-node-type="text"
                              data-editor-node-label={`Upcoming Event ${index + 1} Venue`}
                              data-concert-field="locationName"
                              className="text-sm text-white/80"
                              style={getElementLayoutStyle(data.elementStyles, `${cardId}-locationName`)}
                            >
                              {concert.locationName || concert.venue || "Venue TBA"}
                            </div>
                            <div className="text-sm text-white/55">
                              <span
                                data-editor-node-id={`${cardId}-city`}
                                data-editor-node-type="text"
                                data-editor-node-label={`Upcoming Event ${index + 1} City`}
                                data-concert-field="city"
                                style={getElementLayoutStyle(data.elementStyles, `${cardId}-city`)}
                              >
                                {concert.city}
                              </span>
                              {concert.city && concert.country ? " · " : ""}
                              <span
                                data-editor-node-id={`${cardId}-country`}
                                data-editor-node-type="text"
                                data-editor-node-label={`Upcoming Event ${index + 1} Country`}
                                data-concert-field="country"
                                style={getElementLayoutStyle(data.elementStyles, `${cardId}-country`)}
                              >
                                {concert.country}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 md:ml-auto md:justify-end">
                            <span
                              data-editor-node-id={`${cardId}-style`}
                              data-editor-node-type="text"
                              data-editor-node-label={`Upcoming Event ${index + 1} Style`}
                              data-concert-field="style"
                              className="rounded-full bg-[#FF8C21]/12 px-3 py-1 text-xs text-[#FFB15A]"
                              style={getElementLayoutStyle(data.elementStyles, `${cardId}-style`)}
                            >
                              {concert.style || concert.genre || "World Music"}
                            </span>
                            <span
                              data-editor-node-id={`${cardId}-price`}
                              data-editor-node-type="text"
                              data-editor-node-label={`Upcoming Event ${index + 1} Price`}
                              data-concert-field="price"
                              className="text-sm text-white/70"
                              style={getElementLayoutStyle(data.elementStyles, `${cardId}-price`)}
                            >
                              {formatPrice(concert.price)}
                            </span>
                            <span
                              data-editor-node-id={`${cardId}-time`}
                              data-editor-node-type="text"
                              data-editor-node-label={`Upcoming Event ${index + 1} Time`}
                              data-concert-field="time"
                              className="text-sm text-white/70"
                              style={getElementLayoutStyle(data.elementStyles, `${cardId}-time`)}
                            >
                              {concert.time || "Time TBA"}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div
                  data-editor-node-id="live-upcoming-empty"
                  data-editor-node-type="card"
                  data-editor-node-label="Live Upcoming Empty State"
                  className="rounded-xl border border-dashed border-white/15 bg-black/20 px-6 py-8 text-center"
                  style={getElementLayoutStyle(data.elementStyles, "live-upcoming-empty")}
                >
                  <p
                    data-editor-node-id="live-upcoming-empty-text"
                    data-editor-node-type="text"
                    data-editor-node-label="Live Upcoming Empty Text"
                    className="text-white/55"
                    style={getElementLayoutStyle(data.elementStyles, "live-upcoming-empty-text")}
                  >
                    No upcoming shows scheduled.
                  </p>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={isEditing ? false : { opacity: 0, y: 20 }}
              whileInView={isEditing ? undefined : { opacity: 1, y: 0 }}
              transition={isEditing ? undefined : { duration: 0.5, delay: 0.05 }}
            >
              <h3
                data-editor-node-id="live-history-title"
                data-editor-node-type="text"
                data-editor-node-label="Live History Title"
                className="mb-6 text-center font-serif text-3xl text-white"
                style={getElementLayoutStyle(data.elementStyles, "live-history-title")}
              >
                History
              </h3>

              {historyConcerts.length > 0 ? (
                <div className="space-y-3" style={getElementLayoutStyle(data.elementStyles, "live-history-list")}>
                  {historyConcerts.map((concert, index) => {
                    const cardId = `live-history-event-${concert._editorId}`
                    return (
                      <motion.div
                        key={`history-${concert._editorId}`}
                        data-editor-node-id={cardId}
                        data-editor-node-type="card"
                        data-editor-node-label={`History Event ${index + 1}`}
                        data-editor-grouped="true"
                        data-concert-card="true"
                        data-concert-id={concert._editorId}
                        className="min-h-[88px] rounded-xl border border-white/8 bg-black/25 p-5 shadow-lg transition-all duration-300 hover:border-white/15"
                        style={getElementLayoutStyle(data.elementStyles, cardId)}
                        role={isEditing ? undefined : "button"}
                        tabIndex={isEditing ? undefined : 0}
                        onClick={isEditing ? undefined : () => setActiveConcert(concert)}
                        onKeyDown={isEditing ? undefined : (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            setActiveConcert(concert)
                          }
                        }}
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                          <div
                            data-editor-node-id={`${cardId}-date`}
                            data-editor-node-type="text"
                            data-editor-node-label={`History Event ${index + 1} Date`}
                            data-concert-field="date"
                            className="min-w-[110px] shrink-0 text-white/45"
                            style={getElementLayoutStyle(data.elementStyles, `${cardId}-date`)}
                          >
                            {formatDate(concert.date)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div
                              data-editor-node-id={`${cardId}-eventName`}
                              data-editor-node-type="text"
                              data-editor-node-label={`History Event ${index + 1} Event Name`}
                              data-concert-field="eventName"
                              className="font-serif text-lg text-white/85"
                              style={getElementLayoutStyle(data.elementStyles, `${cardId}-eventName`)}
                            >
                              {concert.eventName || "Event TBA"}
                            </div>
                            <div
                              data-editor-node-id={`${cardId}-locationName`}
                              data-editor-node-type="text"
                              data-editor-node-label={`History Event ${index + 1} Venue`}
                              data-concert-field="locationName"
                              className="text-sm text-white/65"
                              style={getElementLayoutStyle(data.elementStyles, `${cardId}-locationName`)}
                            >
                              {concert.locationName || concert.venue || "Venue TBA"}
                            </div>
                            <div className="text-sm text-white/45">
                              <span
                                data-editor-node-id={`${cardId}-city`}
                                data-editor-node-type="text"
                                data-editor-node-label={`History Event ${index + 1} City`}
                                data-concert-field="city"
                                style={getElementLayoutStyle(data.elementStyles, `${cardId}-city`)}
                              >
                                {concert.city}
                              </span>
                              {concert.city && concert.country ? " · " : ""}
                              <span
                                data-editor-node-id={`${cardId}-country`}
                                data-editor-node-type="text"
                                data-editor-node-label={`History Event ${index + 1} Country`}
                                data-concert-field="country"
                                style={getElementLayoutStyle(data.elementStyles, `${cardId}-country`)}
                              >
                                {concert.country}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 md:ml-auto md:justify-end">
                            <span
                              data-editor-node-id={`${cardId}-style`}
                              data-editor-node-type="text"
                              data-editor-node-label={`History Event ${index + 1} Style`}
                              data-concert-field="style"
                              className="rounded-full bg-white/6 px-3 py-1 text-xs text-white/60"
                              style={getElementLayoutStyle(data.elementStyles, `${cardId}-style`)}
                            >
                              {concert.style || concert.genre || "World Music"}
                            </span>
                            <span
                              data-editor-node-id={`${cardId}-price`}
                              data-editor-node-type="text"
                              data-editor-node-label={`History Event ${index + 1} Price`}
                              data-concert-field="price"
                              className="text-sm text-white/55"
                              style={getElementLayoutStyle(data.elementStyles, `${cardId}-price`)}
                            >
                              {formatPrice(concert.price)}
                            </span>
                            <span
                              data-editor-node-id={`${cardId}-time`}
                              data-editor-node-type="text"
                              data-editor-node-label={`History Event ${index + 1} Time`}
                              data-concert-field="time"
                              className="text-sm text-white/55"
                              style={getElementLayoutStyle(data.elementStyles, `${cardId}-time`)}
                            >
                              {concert.time || "Time TBA"}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div
                  data-editor-node-id="live-history-empty"
                  data-editor-node-type="card"
                  data-editor-node-label="Live History Empty State"
                  className="rounded-xl border border-dashed border-white/15 bg-black/20 px-6 py-8 text-center"
                  style={getElementLayoutStyle(data.elementStyles, "live-history-empty")}
                >
                  <p
                    data-editor-node-id="live-history-empty-text"
                    data-editor-node-type="text"
                    data-editor-node-label="Live History Empty Text"
                    className="text-white/55"
                    style={getElementLayoutStyle(data.elementStyles, "live-history-empty-text")}
                  >
                    No past shows available.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {activeConcert && !isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setActiveConcert(null)}>
          <div
            className="w-full max-w-xl rounded-2xl border border-white/10 bg-black/90 p-6 text-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${activeConcert.eventName || "Concert"} details`}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#FFB15A]">Live Date</p>
                <h3 className="mt-2 font-serif text-3xl">{activeConcert.eventName || activeConcert.locationName || "Concert details"}</h3>
                <p className="mt-2 text-sm text-white/70">{activeConcert.locationName || activeConcert.venue || "Venue TBA"}</p>
              </div>
              <button
                type="button"
                className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/60 hover:text-white"
                onClick={() => setActiveConcert(null)}
                aria-label="Close concert details"
              >
                Close
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-white/55">Date</dt>
                <dd className="text-right font-medium">{formatDate(activeConcert.date)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/55">Time</dt>
                <dd className="text-right font-medium">{activeConcert.time || "Time TBA"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/55">Location</dt>
                <dd className="text-right font-medium">{[activeConcert.city, activeConcert.country].filter(Boolean).join(", ") || "Location TBA"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/55">Style</dt>
                <dd className="text-right font-medium">{activeConcert.style || activeConcert.genre || "World Music"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/55">Price</dt>
                <dd className="text-right font-medium">{formatPrice(activeConcert.price)}</dd>
              </div>
            </dl>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {activeConcert.locationLink ? (
                <a
                  href={activeConcert.locationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border border-white/15 px-4 py-3 text-sm font-semibold text-white hover:border-[#FF8C21]/50"
                >
                  Open in Google Maps
                </a>
              ) : null}
              {activeConcert.ticketUrl ? (
                <a
                  href={activeConcert.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-[#FF8C21] px-4 py-3 text-sm font-semibold text-white hover:bg-[#ff7c05]"
                >
                  Open Ticket Link
                </a>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
