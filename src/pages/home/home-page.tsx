import HeroSection from "./components/hero-section";
import StatsSection from "./components/stats-section";
import FeaturesSection from "./components/features-section";
import TestimonialsSection from "./components/testimonials-section";
import CtaSection from "./components/cta-section";
import MobileBottomNav from "./components/mobile-bottom-nav";

export default function HomePage() {
  return (
    <div className="bg-[#faf8fe] dark:bg-[#1a1b1f] min-h-screen text-[#1a1b1f] dark:text-white pb-20 md:pb-0">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CtaSection />
      <MobileBottomNav />
    </div>
  );
}