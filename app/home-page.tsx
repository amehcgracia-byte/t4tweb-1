import { HeroSection } from "@/components/hero-section"
import { SectionDivider } from "@/components/section-divider"
import { AboutSection } from "@/components/about-section"
import { PressKitSection } from "@/components/press-kit-section"
import { BandMembersSectionSimple } from "@/components/band-members-section-simple"
import { LiveSectionSimple } from "@/components/live-section-simple"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { SceneSection } from "@/components/scene-section"
import { LatestReleaseCorrect } from "@/components/latest-release-correct"
import { IntroBannerSection } from "@/components/intro-banner-section"
import { loadHeroData } from "@/lib/sanity/hero-loader"
import { loadNavigationData } from "@/lib/sanity/navigation-loader"
import { loadIntroBannerData } from "@/lib/sanity/intro-banner-loader"
import { loadLatestReleaseData } from "@/lib/sanity/latest-release-loader"
import { loadAboutData } from "@/lib/sanity/about-loader"
import { loadPressKitData } from "@/lib/sanity/press-kit-loader"
import { loadBandMembersData } from "@/lib/sanity/band-members-loader"
import { loadContactSectionData } from "@/lib/sanity/contact-loader"
import { loadFooterData } from "@/lib/sanity/footer-loader"
import { loadLiveSectionData } from "@/lib/live-concerts-loader"
import { RibbonsBlock } from "@/components/ribbons-block"
import { HomeEditorOverridesProvider } from "@/components/home-editor-overrides-provider"
import { loadHomeEditorState } from "@/lib/sanity/home-editor-state-loader"
import { ExtraNodesRenderer } from "@/components/extra-nodes-renderer"

export const dynamic = "force-dynamic"

function isHeroExtraNode(node: { nodeId: string; content?: { parentSection?: string } }): boolean {
  return node.nodeId.startsWith("extra-") && node.content?.parentSection === "hero-section"
}

function getEditorNodeState(nodes: Awaited<ReturnType<typeof loadHomeEditorState>>, nodeId: string) {
  return nodes.find((node) => node.nodeId === nodeId) || null
}

export default async function HomePage({ perspective = "published", isEditorRoute = false }: { perspective?: "published" | "drafts"; isEditorRoute?: boolean } = {}) {
  const [heroData, navigationData, introBannerData, latestReleaseData, aboutData, pressKitData, bandMembersData, liveData, contactData, footerData] = await Promise.all([
    loadHeroData(perspective),
    loadNavigationData(perspective),
    loadIntroBannerData(perspective),
    loadLatestReleaseData(perspective),
    loadAboutData(perspective),
    loadPressKitData(perspective),
    loadBandMembersData(perspective),
    loadLiveSectionData(perspective),
    loadContactSectionData(perspective),
    loadFooterData(perspective),
  ])
  // Load homeEditorNodes only for editor mode (for visual-editor state), but don't pass to sections
  // Sections render from Sanity data only, without client-side override mixing
  const homeEditorNodes = isEditorRoute
    ? await loadHomeEditorState(perspective)
    : []
  const heroExtraNodes = homeEditorNodes.filter(isHeroExtraNode)

  return (
    <main className="relative overflow-x-clip bg-black">
      {isEditorRoute ? (
        <HomeEditorOverridesProvider nodes={homeEditorNodes}>
          <ExtraNodesRenderer nodes={homeEditorNodes} />
          <RibbonsBlock />
          <Navigation data={navigationData} />

          <HeroSection data={heroData} extraNodes={heroExtraNodes} />

          <SectionDivider editorId="section-divider-hero-intro" state={getEditorNodeState(homeEditorNodes, "section-divider-hero-intro")} />

          <IntroBannerSection data={introBannerData} />

          <SectionDivider editorId="section-divider-intro-release" state={getEditorNodeState(homeEditorNodes, "section-divider-intro-release")} />

          <LatestReleaseCorrect data={latestReleaseData} />

          <SectionDivider editorId="section-divider-release-about" state={getEditorNodeState(homeEditorNodes, "section-divider-release-about")} />

          <SceneSection id="about">
            <AboutSection data={aboutData} />
          </SceneSection>

          <SectionDivider editorId="section-divider-about-press" state={getEditorNodeState(homeEditorNodes, "section-divider-about-press")} />

          <SceneSection id="press-kit">
            <PressKitSection data={pressKitData} />
          </SceneSection>

          <SectionDivider editorId="section-divider-press-band" state={getEditorNodeState(homeEditorNodes, "section-divider-press-band")} />

          <SceneSection id="band">
            <BandMembersSectionSimple
              data={bandMembersData}
            />
          </SceneSection>

          <SectionDivider editorId="section-divider-band-live" state={getEditorNodeState(homeEditorNodes, "section-divider-band-live")} />

          <SceneSection id="live">
            <LiveSectionSimple data={liveData} />
          </SceneSection>

          <SectionDivider editorId="section-divider-live-contact" state={getEditorNodeState(homeEditorNodes, "section-divider-live-contact")} />

          <SceneSection id="contact">
            <ContactSection data={contactData} />
          </SceneSection>

          <SectionDivider editorId="section-divider-contact-footer" state={getEditorNodeState(homeEditorNodes, "section-divider-contact-footer")} />

          <Footer data={footerData} />
        </HomeEditorOverridesProvider>
      ) : (
        <>
          <RibbonsBlock />
          <Navigation data={navigationData} />

          <HeroSection data={heroData} extraNodes={heroExtraNodes} />

          <SectionDivider editorId="section-divider-hero-intro" state={getEditorNodeState(homeEditorNodes, "section-divider-hero-intro")} />

          <IntroBannerSection data={introBannerData} />

          <SectionDivider editorId="section-divider-intro-release" state={getEditorNodeState(homeEditorNodes, "section-divider-intro-release")} />

          <LatestReleaseCorrect data={latestReleaseData} />

          <SectionDivider editorId="section-divider-release-about" state={getEditorNodeState(homeEditorNodes, "section-divider-release-about")} />

          <SceneSection id="about">
            <AboutSection data={aboutData} />
          </SceneSection>

          <SectionDivider editorId="section-divider-about-press" state={getEditorNodeState(homeEditorNodes, "section-divider-about-press")} />

          <SceneSection id="press-kit">
            <PressKitSection data={pressKitData} />
          </SceneSection>

          <SectionDivider editorId="section-divider-press-band" state={getEditorNodeState(homeEditorNodes, "section-divider-press-band")} />

          <SceneSection id="band">
            <BandMembersSectionSimple
              data={bandMembersData}
            />
          </SceneSection>

          <SectionDivider editorId="section-divider-band-live" state={getEditorNodeState(homeEditorNodes, "section-divider-band-live")} />

          <SceneSection id="live">
            <LiveSectionSimple data={liveData} />
          </SceneSection>

          <SectionDivider editorId="section-divider-live-contact" state={getEditorNodeState(homeEditorNodes, "section-divider-live-contact")} />

          <SceneSection id="contact">
            <ContactSection data={contactData} />
          </SceneSection>

          <SectionDivider editorId="section-divider-contact-footer" state={getEditorNodeState(homeEditorNodes, "section-divider-contact-footer")} />

          <Footer data={footerData} />
          <ExtraNodesRenderer nodes={homeEditorNodes} />
        </>
      )}
    </main>
  )
}
