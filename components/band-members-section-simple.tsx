"use client"

import { useRef, useState, useEffect, type CSSProperties } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import { SectionHeader } from "@/components/section-header"
import { useVisualEditor } from "@/components/visual-editor"
import type { BandMemberData, BandMembersLoadResult } from "@/lib/sanity/band-members-loader"
import { getElementLayoutStyle } from "@/lib/hero-layout-styles"

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

export function BandMembersSectionSimple({ data }: { data: BandMembersLoadResult }) {
  const sectionRef = useRef<HTMLElement>(null)
  const [members, setMembers] = useState<BandMemberData[]>(data.members)
  const [activeIndex, setActiveIndex] = useState<number>(0)
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
  const activeMember = membersWithIndex[activeIndex]

  const renderMemberPhoto = (blockMembers: typeof membersWithIndex, imagePriorityOffset: number) => {
    const activeBlockMember = blockMembers.find((member) => member.editorIndex === activeIndex) || blockMembers[0]
    return (
      <div
        className="relative hidden max-h-[78vh] min-h-[420px] overflow-hidden rounded-3xl bg-zinc-950 shadow-2xl lg:block lg:aspect-[3/4]"
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
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0"
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
              <p
                data-member-photo-description-index={member.editorIndex}
                className={`bg-gradient-to-r from-white via-white to-orange-400 bg-clip-text text-xl font-semibold leading-snug text-transparent ${member.photoDescription ? "" : "hidden"}`}
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
    <div className="space-y-2.5 md:space-y-4">
      {blockMembers.map((member) => (
        <motion.div
          key={`${member.group}-${member.editorIndex}-card`}
          onClick={() => handleMemberClick(member.editorIndex)}
          onMouseEnter={() => (!isEditing && !isMobile) && setActiveIndex(member.editorIndex)}
          whileHover={isEditing ? undefined : { scale: 1.02, x: 8 }}
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
          className={`group flex min-h-[62px] w-full touch-manipulation items-center justify-between rounded-xl border p-3.5 text-left transition-all duration-300 md:min-h-[88px] md:rounded-2xl md:p-6
            ${
              activeIndex === member.editorIndex
                ? "border-orange-500 bg-zinc-900/80"
                : "border-white/10 hover:border-white/20 bg-black/40 hover:bg-zinc-950"
            }`}
          style={getBandMemberCardStyle(data.elementStyles || {}, `member-item-${member.editorIndex}`)}
        >
          <div className="min-w-0 flex-1">
            <h4
              data-editor-node-id={`member-item-${member.editorIndex}-name`}
              data-editor-node-type="text"
              data-editor-node-label={`${member.fullName} name`}
              data-member-name-index={member.editorIndex}
              style={getElementLayoutStyle(data.elementStyles || {}, `member-item-${member.editorIndex}-name`)}
              className={`truncate text-base font-medium transition-colors md:text-xl ${
                activeIndex === member.editorIndex ? "text-white" : "text-white/80 group-hover:text-white"
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
              className={`mt-0.5 text-xs transition-colors md:mt-1 md:text-sm ${
                activeIndex === member.editorIndex ? "text-orange-400" : "text-white/50"
              }`}
            >
              {member.role}
            </p>
          </div>

          <div
            data-editor-node-id={`member-item-${member.editorIndex}-number`}
            data-editor-node-type="text"
            data-editor-node-label={`${member.fullName} number`}
            data-member-number-index={member.editorIndex}
            style={getElementLayoutStyle(data.elementStyles || {}, `member-item-${member.editorIndex}-number`)}
            className={`ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs transition-all md:h-8 md:w-8 ${
              activeIndex === member.editorIndex
                ? "border-orange-500 bg-orange-950 text-orange-400"
                : "border-white/20 text-white/40 group-hover:border-white/40"
            }`}
          >
            {member.number}
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
      style={getElementLayoutStyle(data.elementStyles || {}, "band-members-section")}
    >
      {/* Fondo full width */}
      <div 
        data-editor-node-id="band-members-bg"
        data-editor-node-type="background"
        data-editor-media-kind="image"
        data-editor-node-label="Imagen de fondo banda"
        className="absolute inset-0 z-0"
        style={getElementLayoutStyle(data.elementStyles || {}, "band-members-bg")}
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
          <div className="grid items-start gap-5 md:gap-8 lg:grid-cols-2 lg:gap-14">
            {renderMemberPhoto(bandMembers, 0)}
            {renderMemberCards(bandMembers)}
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
              <div className="grid items-start gap-5 md:gap-8 lg:grid-cols-2 lg:gap-14">
                {renderMemberCards(colabMembers)}
                {renderMemberPhoto(colabMembers, bandMembers.length)}
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
