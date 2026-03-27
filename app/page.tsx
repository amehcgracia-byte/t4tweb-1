import Image from "next/image"
import { HeroSection } from "@/components/hero-section"
import { SectionDivider } from "@/components/section-divider"
import { AboutSection } from "@/components/about-section"
import { PressKitSection } from "@/components/press-kit-section"
import { BandMembersSection } from "@/components/band-members-section"
import { LiveSection } from "@/components/live-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { SceneSection } from "@/components/scene-section"

export default function Home() {
  return (
    <main className="relative bg-black">
      {/* Global fixed background (single active layer) */}
      <div className="fixed inset-0 -z-20 opacity-0 animate-fade-in">
        <Image
          src="/images/banner.gif"
          alt="Tales for the Tillerman base animated banner"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <Navigation />

      <SceneSection id="hero" imageSrc="/images/t4t-1.jpg" imageAlt="Band hero scene">
        <HeroSection />
      </SceneSection>

      <SectionDivider />

      <SceneSection id="about" imageSrc="/images/t4t-2.jpg" imageAlt="About band scene">
        <AboutSection />
      </SceneSection>

      <SectionDivider />

      <SceneSection id="press-kit" imageSrc="/images/t4t-3.jpg" imageAlt="Press kit scene">
        <PressKitSection />
      </SceneSection>

      <SectionDivider />

      <SceneSection id="band" imageSrc="/images/t4t-4.jpg" imageAlt="Band members scene">
        <BandMembersSection />
      </SceneSection>

      <SectionDivider />

      <SceneSection id="live" imageSrc="/images/band-live.jpg" imageAlt="Live show scene">
        <LiveSection />
      </SceneSection>

      <SectionDivider />

      <SceneSection id="contact" imageSrc="/images/DSC_4710.JPG" imageAlt="Contact scene">
        <ContactSection />
      </SceneSection>

      <Footer />
    </main>
  )
}


