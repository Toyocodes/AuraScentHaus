import Link from "next/link";
import { ProductVisual } from "@/components/product";
import { Button } from "@/components/ui/button";

interface HeroProps {
  /** Perfume shown large on the right. */
  featuredName?: string;
}

export function Hero({ featuredName = "Velvet Rose Noir" }: HeroProps) {
  return (
    <section className="border-b bg-linear-to-b from-sand/60 to-background">
      <div className="container-page grid items-center gap-12 py-16 md:grid-cols-[1.1fr_1fr] md:py-24 lg:gap-20">
        <div className="space-y-8">
          <p className="eyebrow text-gold">Maison de parfum · Lagos</p>
          <h1 className="text-5xl leading-[0.95] sm:text-6xl lg:text-8xl">
            Scent is the
            <br />
            <em className="text-gold">quietest</em> luxury.
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
            Rare oud, velvet rose, smoked cedar and warm amber, composed to stay with you long after you leave the
            room.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/products">Shop the collection</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/collections/oud">Discover oud</Link>
            </Button>
          </div>
        </div>
        <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-sm shadow-[0_40px_80px_-40px_rgb(60_40_25/0.45)]">
          <ProductVisual name={featuredName} />
        </div>
      </div>
    </section>
  );
}
