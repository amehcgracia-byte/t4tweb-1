import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { PressKitSection } from "@/components/press-kit-section"
import { BandMembersSectionSimple } from "@/components/band-members-section-simple"
import { LiveSection } from "@/components/live-section"
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
import { loadHomeEditorState } from "@/lib/sanity/home-editor-state-loader"
import { RibbonsBlock } from "@/components/ribbons-block"
import { ExtraNodesRenderer } from "@/components/extra-nodes-renderer"

export const dynamic = "force-dynamic"

function isHeroExtraNode(node: { nodeId: string; content?: { parentSection?: string } }): boolean {
  return node.nodeId.startsWith("extra-") && node.content?.parentSection === "hero-section"
}

export default async function HomePagePublic() {
  const [heroData, navigationData, introBannerData, latestReleaseData, aboutData, pressKitData, bandMembersData, liveData, contactData, footerData, homeEditorNodes] = await Promise.all([
    loadHeroData("published"),
    loadNavigationData("published"),
    loadIntroBannerData("published"),
    loadLatestReleaseData("published"),
    loadAboutData("published"),
    loadPressKitData("published"),
    loadBandMembersData("published"),
    loadLiveSectionData("published"),
    loadContactSectionData("published"),
    loadFooterData("published"),
    loadHomeEditorState("published"),
  ])
  const heroExtraNodes = homeEditorNodes.filter(isHeroExtraNode)

  return (
    <main className="public-home relative overflow-x-clip bg-black">
      <RibbonsBlock />
      <Navigation data={navigationData} />

      <HeroSection data={heroData} extraNodes={heroExtraNodes} />

      <IntroBannerSection data={introBannerData} />

      <LatestReleaseCorrect data={latestReleaseData} />

      <AboutSection data={aboutData} sectionId="about" />

      <PressKitSection data={pressKitData} />

      <SceneSection id="band">
        <BandMembersSectionSimple
          data={bandMembersData}
        />
      </SceneSection>

      <SceneSection id="live">
        <LiveSection data={liveData} />
      </SceneSection>

      <SceneSection id="contact">
        <ContactSection data={contactData} />
      </SceneSection>

      <Footer data={footerData} />
      <ExtraNodesRenderer nodes={homeEditorNodes} />
    </main>
  )
}
