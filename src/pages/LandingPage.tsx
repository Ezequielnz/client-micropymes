import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import WhySection from '@/components/landing/WhySection';
import Features from '@/components/landing/Features';
import Modules from '@/components/landing/Modules';
import Benefits from '@/components/landing/Benefits';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <WhySection />
      <Features />
      <Modules />
      <Benefits />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

export default LandingPage; 