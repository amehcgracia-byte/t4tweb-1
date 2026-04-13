import { HeroSectionWrapper } from "@/components/hero-section-wrapper"
import { SectionDivider } from "@/components/section-divider"
import { AboutSection } from "@/components/about-section"
import { PressKitSection } from "@/components/press-kit-section"
import { BandMembersSection } from "@/components/band-members-section"
import { LiveSection } from "@/components/live-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { SceneSection } from "@/components/scene-section"
import { LatestReleaseSection } from "@/components/latest-release-section"
import { IntroBannerSection } from "@/components/intro-banner-section"
import { loadHeroData } from "@/lib/sanity/hero-loader"
import { loadNavigationData } from "@/lib/sanity/navigation-loader"
import { loadIntroBannerData } from "@/lib/sanity/intro-banner-loader"
import { loadBandMembersData } from "@/lib/sanity/band-members-loader"
import { loadLiveConcerts } from "@/lib/live-concerts-loader"
import { RibbonsBlock } from "@/components/ribbons-block"
import { EditorAwareHomePageWrapper } from "@/components/editor-aware-home-page-wrapper"

export const dynamic = "force-dynamic"

export default async function HomePage({ perspective = "published", isEditorRoute = false }: { perspective?: "published" | "previewDrafts"; isEditorRoute?: boolean } = {}) {
  const [heroData, navigationData, introBannerData, bandMembersData, liveConcerts] = await Promise.all([
    loadHeroData(perspective),
    loadNavigationData(perspective),
    loadIntroBannerData(perspective),
    loadBandMembersData(perspective),
    loadLiveConcerts(),
  ])
  // Editor state is loaded live from DOM during client-side boot
  // Components render directly from Sanity data (perspective handles published vs draft)
  // No homeEditorNodes: Sanity contains the persisted elementStyles

  const mainContent = (
    <main className="relative overflow-x-clip bg-black">
        <RibbonsBlock />
        <Navigation data={navigationData} />

        <HeroSectionWrapper data={heroData} isEditorRoute={isEditorRoute} />

        <SectionDivider editorId="section-divider-hero-intro" />

        <IntroBannerSection data={introBannerData} />

        <SectionDivider editorId="section-divider-intro-release" />

        <LatestReleaseSection />

        <SectionDivider editorId="section-divider-release-about" />

        <SceneSection id="about">
          <AboutSection />
        </SceneSection>

        <SectionDivider editorId="section-divider-about-press" />

        <SceneSection id="press-kit">
          <PressKitSection />
        </SceneSection>

        <SectionDivider editorId="section-divider-press-band" />

        <SceneSection id="band">
          <BandMembersSection initialMembers={bandMembersData.members} elementStyles={bandMembersData.elementStyles} />
        </SceneSection>

        <SectionDivider editorId="section-divider-band-live" />

        <SceneSection id="live">
          <LiveSection initialConcerts={liveConcerts} />
        </SceneSection>

        <SectionDivider editorId="section-divider-live-contact" />

        <SceneSection id="contact">
          <ContactSection />
        </SceneSection>

        <SectionDivider editorId="section-divider-contact-footer" />

        <Footer />
      </main>
  )

  // In /editor, prevent fallback visual by not rendering until editor state is ready
  return <EditorAwareHomePageWrapper isEditorRoute={isEditorRoute}>{mainContent}</EditorAwareHomePageWrapper>
}