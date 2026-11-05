import { BrandStory, CollectionTiles, FeaturedProducts, Hero } from "@/components/home";
import { mockCategories, mockFeaturedProducts } from "@/mocks";

/** Sample data for now. Later: `useProducts({ featured: true, limit: 8 })` and `useCategories()`. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts products={mockFeaturedProducts} />
      <CollectionTiles categories={mockCategories} />
      <BrandStory />
    </>
  );
}
