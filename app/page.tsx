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
import { RibbonsBlock } from "@/components/ribbons-block"

/** Always refetch hero from Sanity (editor deploy + revalidate); avoids stale static shell in dev). */
export const dynamic = "force-dynamic"

export default async function Home() {
  const [heroData, navigationData] = await Promise.all([loadHeroData(), loadNavigationData()])

  return (
    <main className="relative bg-black">
      <RibbonsBlock />
      <Navigation data={navigationData} />

      <HeroSectionWrapper data={heroData} />

      <SectionDivider />

      <IntroBannerSection />

      <SectionDivider />

      <SceneSection id="latest-release">
        <LatestReleaseSection />
      </SceneSection>

      <SectionDivider />

      <SceneSection id="about">
        <AboutSection />
      </SceneSection>

      <SectionDivider />

      <SceneSection id="press-kit">
        <PressKitSection />
      </SceneSection>

      <SectionDivider />

      <SceneSection id="band">
        <BandMembersSection />
      </SceneSection>

      <SectionDivider />

      <SceneSection id="live">
        <LiveSection />
      </SceneSection>

      <SectionDivider />

      <SceneSection id="contact">
        <ContactSection />
      </SceneSection>

      <SectionDivider />

      <Footer />
    </main>
  )
}
