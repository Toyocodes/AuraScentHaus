import { BrandStory, CollectionTilesSection, FeaturedProductsSection, Hero, ScentFamiliesSection } from "@/components/home";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProductsSection />
      <CollectionTilesSection />
      <ScentFamiliesSection />
      <BrandStory />
    </>
  );
}
