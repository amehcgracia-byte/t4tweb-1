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
import { ExtraNodesRenderer } from "@/components/extra-nodes-renderer"

export const dynamic = "force-dynamic"

export default async function HomePagePublic() {
  const [heroData, navigationData, introBannerData, latestReleaseData, aboutData, pressKitData, bandMembersData, liveData, contactData, footerData] = await Promise.all([
    loadHeroData("published"),
    loadNavigationData(),
    loadIntroBannerData("published"),
    loadLatestReleaseData("published"),
    loadAboutData("published"),
    loadPressKitData("published"),
    loadBandMembersData("published"),
    loadLiveSectionData("published"),
    loadContactSectionData("published"),
    loadFooterData("published"),
  ])

  return (
    <main className="relative overflow-x-clip bg-black">
      <RibbonsBlock />
      <Navigation data={navigationData} />

      <HeroSection data={heroData} />

      <SectionDivider editorId="section-divider-hero-intro" />

      <IntroBannerSection data={introBannerData} />

      <SectionDivider editorId="section-divider-intro-release" />

      <LatestReleaseCorrect data={latestReleaseData} />

      <SectionDivider editorId="section-divider-release-about" />

      <SceneSection id="about">
        <AboutSection data={aboutData} />
      </SceneSection>

      <SectionDivider editorId="section-divider-about-press" />

      <SceneSection id="press-kit">
        <PressKitSection data={pressKitData} />
      </SceneSection>

      <SectionDivider editorId="section-divider-press-band" />

      <SceneSection id="band">
        <BandMembersSectionSimple
          data={bandMembersData}
        />
      </SceneSection>

      <SectionDivider editorId="section-divider-band-live" />

      <SceneSection id="live">
        <LiveSectionSimple data={liveData} />
      </SceneSection>

      <SectionDivider editorId="section-divider-live-contact" />

      <SceneSection id="contact">
        <ContactSection data={contactData} />
      </SceneSection>

      <SectionDivider editorId="section-divider-contact-footer" />

      <Footer data={footerData} />
    </main>
  )
}
