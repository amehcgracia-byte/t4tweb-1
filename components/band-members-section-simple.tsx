"use client"

import { useRef, useState, useEffect, type CSSProperties } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import { SectionHeader } from "@/components/section-header"
import { useVisualEditor } from "@/components/visual-editor"
import type { BandMemberData, BandMembersLoadResult } from "@/lib/sanity/band-members-loader"
import { getElementLayoutStyle, roundLayoutPx } from "@/lib/hero-layout-styles"

function getBandMemberCardStyle(
  elementStyles: Record<string, Record<string, unknown>>,
  nodeId: string
): CSSProperties {
  const style = { ...getElementLayoutStyle(elementStyles, nodeId) }
  const rawStyle = elementStyles[nodeId]
  delete style.opacity
  if (typeof rawStyle?.backgroundColor === "string") {
    style.backgroundColor = rawStyle.backgroundColor
    style.backgroundImage = "none"
  }
  return style
}

function getBandMembersSectionStyle(
  elementStyles: Record<string, Record<string, unknown>>
): CSSProperties {
  const rawStyle = elementStyles["band-members-section"]
  const style = { ...getElementLayoutStyle(elementStyles, "band-members-section", { includeGeometry: false }) }

  if (typeof rawStyle?.x === "number" && rawStyle.x !== 0) {
    style.marginLeft = `${roundLayoutPx(rawStyle.x)}px`
  }
  if (typeof rawStyle?.y === "number" && rawStyle.y !== 0) {
    style.marginTop = `${roundLayoutPx(rawStyle.y)}px`
  }
  if (typeof rawStyle?.width === "number") {
    style.width = `${Math.max(8, roundLayoutPx(rawStyle.width))}px`
  }
  if (typeof rawStyle?.height === "number") {
    style.height = `${Math.max(8, roundLayoutPx(rawStyle.height))}px`
  }

  delete style.opacity
  delete style.transform
  delete style.transformOrigin

  return style
}

export function BandMembersSectionSimple({ data }: { data: BandMembersLoadResult }) {
  const sectionRef = useRef<HTMLElement>(null)
  const [members, setMembers] = useState<BandMemberData[]>(data.members)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { opacity, y } = useScrollAnimation(sectionRef)
  const { isEditing } = useVisualEditor()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    setMembers(data.members)
  }, [data.members])

  useEffect(() => {
    if (activeIndex === null) return
    if (activeIndex < members.length) return
    setActiveIndex(null)
  }, [activeIndex, members.length])

  useEffect(() => {
    const onEditorBandMemberFocus = (event: Event) => {
      const custom = event as CustomEvent<{ index?: number }>
      const index = custom.detail?.index
      if (typeof index !== "number" || Number.isNaN(index)) return
      if (index < 0 || index >= members.length) return
      setActiveIndex(index)
    }
    window.addEventListener("editor-band-member-focus", onEditorBandMemberFocus as EventListener)
    return () => {
      window.removeEventListener("editor-band-member-focus", onEditorBandMemberFocus as EventListener)
    }
  }, [members.length])

  useEffect(() => {
    const onEditorBandMemberAdd = (event: Event) => {
      const custom = event as CustomEvent<{ group?: string }>
      const group = custom.detail?.group === "colab" ? "colab" : "band"
      setMembers((current) => {
        const nextId = current.length + 1
        const nextMember: BandMemberData = {
          id: nextId,
          fullName: "New Member",
          role: group === "colab" ? "Musician Colab" : "Musician",
          image: current[0]?.image || "/images/members/Janosch Puhe2.JPG",
          photoDescription: "",
          group,
        }
        const insertAt = group === "colab" ? current.length : current.findIndex((member) => member.group === "colab")
        const nextMembers = [...current]
        if (insertAt === -1) nextMembers.push(nextMember)
        else nextMembers.splice(insertAt, 0, nextMember)
        window.requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent("editor-band-member-focus", { detail: { index: nextMembers.indexOf(nextMember) } }))
        })
        return nextMembers.map((member, index) => ({ ...member, id: index + 1 }))
      })
    }
    window.addEventListener("editor-band-member-add", onEditorBandMemberAdd as EventListener)
    return () => window.removeEventListener("editor-band-member-add", onEditorBandMemberAdd as EventListener)
  }, [])

  const handleMemberClick = (index: number) => {
    setActiveIndex(index)
    if (isMobile) {
      setModalOpen(true)
    }
  }

  const membersWithIndex = members.map((member, index) => ({
    ...member,
    editorIndex: index,
    number: String(index + 1).padStart(2, "0"),
    group: member.group === "colab" ? "colab" as const : "band" as const,
  }))
  const bandMembers = membersWithIndex.filter((member) => member.group !== "colab")
  const colabMembers = membersWithIndex.filter((member) => member.group === "colab")
  const activeMember = activeIndex === null ? null : (membersWithIndex[activeIndex] ?? null)
  const visibleMemberIndex = isMobile || modalOpen ? activeIndex : (isEditing ? activeIndex : hoveredIndex)

  const isMemberHighlighted = (memberIndex: number) =>
    visibleMemberIndex !== null && visibleMemberIndex === memberIndex

  const renderMemberPhoto = (
    blockMembers: typeof membersWithIndex,
    imagePriorityOffset: number,
    align: "left" | "right"
  ) => {
    const activeBlockMember =
      visibleMemberIndex === null
        ? null
        : blockMembers.find((member) => member.editorIndex === visibleMemberIndex) || null
    const showPreviewBlock = Boolean(activeBlockMember) || isMobile || modalOpen
    return (
      <div
        className={`pointer-events-none absolute top-0 hidden h-full w-[min(34vw,520px)] overflow-hidden rounded-[2rem] transition-[opacity,transform,background-color,box-shadow] duration-300 ease-out lg:block ${
          align === "left" ? "-left-28 xl:-left-40" : "-right-28 xl:-right-40"
        } ${
          showPreviewBlock
            ? "translate-x-0 bg-zinc-950/90 opacity-100 shadow-2xl"
            : `${align === "left" ? "-translate-x-10" : "translate-x-10"} bg-transparent opacity-0 shadow-none`
        }`}
        style={getElementLayoutStyle(data.elementStyles || {}, "band-members-photo-container")}
      >
        {blockMembers.map((member, blockIndex) => (
          <motion.div
            key={`${member.group}-${member.editorIndex}-photo`}
            initial={false}
            animate={{
              opacity: activeBlockMember?.editorIndex === member.editorIndex ? 1 : 0,
              scale: activeBlockMember?.editorIndex === member.editorIndex ? 1 : 1.08,
            }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 overflow-hidden rounded-[2rem]"
              data-editor-node-id={`member-item-${member.editorIndex}-image`}
              data-editor-node-type="image"
              data-editor-node-label={`${member.fullName} photo`}
              data-editor-media-kind="image"
              style={getElementLayoutStyle(data.elementStyles || {}, `member-item-${member.editorIndex}-image`)}
            >
              <Image
                src={member.image}
                alt={member.fullName}
                fill
                data-member-photo-index={member.editorIndex}
                className="object-cover"
                priority={imagePriorityOffset + blockIndex === 0}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-black/15 via-black/20 to-black/75" />
            <div className="absolute inset-0 rounded-[2rem] ring-1 ring-white/10" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
              <p
                data-member-photo-description-index={member.editorIndex}
                className={`max-w-[22rem] bg-gradient-to-r from-white via-white to-orange-400 bg-clip-text text-lg font-semibold leading-snug tracking-[0.01em] text-transparent drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] md:text-xl ${member.photoDescription ? "" : "hidden"}`}
              >
                {member.photoDescription || ""}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  const renderMemberCards = (blockMembers: typeof membersWithIndex) => (
    <div className="space-y-3.5 md:space-y-4.5">
      {blockMembers.map((member) => (
        <motion.div
          key={`${member.group}-${member.editorIndex}-card`}
          onClick={() => handleMemberClick(member.editorIndex)}
          onMouseEnter={() => {
            if (isEditing || isMobile) return
            setHoveredIndex(member.editorIndex)
            setActiveIndex(member.editorIndex)
          }}
          onMouseLeave={() => {
            if (isEditing || isMobile) return
            setHoveredIndex(null)
          }}
          whileHover={isEditing ? undefined : { scale: 1.015, y: -2 }}
          transition={isEditing ? undefined : { type: "spring", stiffness: 400, damping: 25 }}
          data-editor-node-id={`member-item-${member.editorIndex}`}
          data-editor-node-type="card"
          data-editor-node-label={member.fullName}
          data-editor-grouped="true"
          data-editor-member-name={member.fullName}
          data-editor-member-role={member.role}
          data-editor-member-group={member.group}
          data-editor-member-photo-description={member.photoDescription || ""}
          role="button"
          tabIndex={0}
          aria-label={`${member.fullName} card`}
          className={`group flex min-h-[84px] w-full touch-manipulation items-center justify-center rounded-2xl border px-5 py-4 text-center transition-all duration-300 md:min-h-[108px] md:rounded-[1.75rem] md:px-8 md:py-6
            ${
              isMemberHighlighted(member.editorIndex)
                ? "border-orange-500/80 bg-zinc-900/85 shadow-[0_18px_48px_rgba(0,0,0,0.28)]"
                : "border-white/10 bg-black/45 hover:border-white/25 hover:bg-zinc-950/90"
            }`}
          style={getBandMemberCardStyle(data.elementStyles || {}, `member-item-${member.editorIndex}`)}
        >
          <div className="min-w-0 flex-1 text-center">
            <h4
              data-editor-node-id={`member-item-${member.editorIndex}-name`}
              data-editor-node-type="text"
              data-editor-node-label={`${member.fullName} name`}
              data-member-name-index={member.editorIndex}
              style={getElementLayoutStyle(data.elementStyles || {}, `member-item-${member.editorIndex}-name`)}
              className={`truncate text-xl font-semibold tracking-[0.01em] transition-colors md:text-[1.9rem] ${
                isMemberHighlighted(member.editorIndex) ? "text-white" : "text-white/80 group-hover:text-white"
              }`}
            >
              {member.fullName}
            </h4>
            <p
              data-editor-node-id={`member-item-${member.editorIndex}-role`}
              data-editor-node-type="text"
              data-editor-node-label={`${member.fullName} role`}
              data-member-role-index={member.editorIndex}
              style={getElementLayoutStyle(data.elementStyles || {}, `member-item-${member.editorIndex}-role`)}
              className={`mt-1.5 text-[0.84rem] uppercase tracking-[0.28em] transition-colors md:mt-2.5 md:text-[0.92rem] ${
                isMemberHighlighted(member.editorIndex) ? "text-orange-300" : "text-white/45"
              }`}
            >
              {member.role}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )

  return (
    <section
      ref={sectionRef}
      data-editor-node-id="band-members-section"
      data-editor-node-type="section"
      data-editor-node-label="Sección Miembros de la Banda"
      className="relative isolate min-h-screen w-full overflow-hidden bg-black"
      style={getBandMembersSectionStyle(data.elementStyles || {})}
    >
      {/* Fondo full width */}
      <div 
        data-editor-node-id="band-members-bg"
        data-editor-node-type="background"
        data-editor-media-kind="image"
        data-editor-node-label="Imagen de fondo banda"
        className="absolute inset-0 z-0"
        style={getElementLayoutStyle(data.elementStyles || {}, "band-members-bg", { includeGeometry: true })}
      >
        <Image
          src={data.backgroundImageUrl}
          alt="Band background"
          fill
          className="object-cover"
        />
      </div>

      {/* Gradiente superior */}
      <div className="section-photo-fade-top z-10" />

      {/* Gradiente inferior */}
      <div className="section-photo-fade-bottom z-10" />

      <div className="section-photo-scrim z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            style={isEditing ? undefined : { opacity, y }}
            className="mb-8 md:mb-12 lg:mb-16 text-center"
          >
          <SectionHeader
            eyebrow={data.headerEyebrow}
            title={data.headerTitle}
            description={data.headerDescription}
            dataEditId="band-members-header"
            dataEditLabel="Encabezado Miembros"
          />
        </motion.div>

        <div className="space-y-14 pb-16 lg:space-y-20">
          <div className="relative min-h-[420px] lg:min-h-[640px]">
            {renderMemberPhoto(bandMembers, 0, "left")}
            <div className="relative z-10 ml-auto max-w-[41rem] lg:pr-8 lg:py-10 xl:pr-12">
              {renderMemberCards(bandMembers)}
            </div>
          </div>

          {colabMembers.length > 0 && (
            <div>
              <h3
                data-editor-node-id="band-members-colabs-title"
                data-editor-node-type="text"
                data-editor-node-label="Musician Colabs Title"
                className="mb-6 text-center font-serif text-3xl text-white md:text-4xl"
                style={getElementLayoutStyle(data.elementStyles || {}, "band-members-colabs-title")}
              >
                Musician Colabs
              </h3>
              <div className="relative min-h-[420px] lg:min-h-[640px]">
                {renderMemberPhoto(colabMembers, bandMembers.length, "right")}
                <div className="relative z-10 mr-auto max-w-[41rem] lg:pl-8 lg:py-10 xl:pl-12">
                  {renderMemberCards(colabMembers)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile modal */}
      <AnimatePresence>
        {modalOpen && activeMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3.5 lg:hidden"
            onClick={() => setModalOpen(false)}
          >
            <div className="absolute inset-0 bg-black/80" />
            
            <div
              className="relative w-full max-w-[22rem] overflow-hidden rounded-2xl shadow-2xl"
              style={{ maxHeight: "82dvh" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full" style={{ aspectRatio: '3/4' }}>
                <img
                  src={activeMember.image}
                  alt={activeMember.fullName}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ zIndex: 1 }}
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" style={{ zIndex: 2 }} />
                <div className="absolute bottom-0 left-0 right-0 p-6" style={{ zIndex: 3 }}>
                  {activeMember.photoDescription ? (
                    <p className="bg-gradient-to-r from-white via-white to-orange-400 bg-clip-text text-base font-semibold leading-snug text-transparent">
                      {activeMember.photoDescription}
                    </p>
                  ) : null}
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                style={{ zIndex: 4 }}
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
