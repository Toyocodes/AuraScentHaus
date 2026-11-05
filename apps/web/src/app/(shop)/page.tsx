import { BrandStory, CollectionTilesSection, FeaturedProductsSection, Hero } from "@/components/home";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProductsSection />
      <CollectionTilesSection />
      <BrandStory />
    </>
  );
}
