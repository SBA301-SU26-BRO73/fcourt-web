import HeroSection from "./components/hero-section";
import NearbyCourtsSection from "./components/nearby-courts-section";
import SportsCategoriesSection from "./components/sports-categories-section";
import PromoBannerSection from "./components/promo-banner-section";
import MapVenuesSection from "./components/map-venues-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <NearbyCourtsSection />
      <SportsCategoriesSection />
      <PromoBannerSection />
      <MapVenuesSection />
    </>
  );
}