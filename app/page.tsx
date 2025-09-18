import { HeroSection } from "@/components/hero-section"
import { BenefitsSection } from "@/components/benefits-section"
import { SocialProofSection } from "@/components/social-proof-section"
import { ProductExplanationSection } from "@/components/product-explanation-section"
import { SecondCTASection } from "@/components/second-cta-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <BenefitsSection />
      <SocialProofSection />
      <ProductExplanationSection />
      <SecondCTASection />
      <Footer />
    </main>
  )
}
