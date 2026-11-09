import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About us",
  description: "AuraScentHaus is a fragrance house for you and your home: perfumes, perfume oils, candles, diffusers and body care, delivered across Nigeria.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="Our story"
      title="The art of scent"
      description="Fragrance for you and your home, chosen with care and delivered across Nigeria."
    >
      <InfoSection title="Who we are">
        <p>
          AuraScentHaus began with a simple belief: a fragrance should whisper, never shout. We bring together perfumes,
          perfume oils, scented candles, diffusers and body care that are made to linger, from bright citrus to the deepest
          oud.
        </p>
        <p>
          Every product is chosen for its quality and lasting power. We look for rare ingredients such as agarwood, Turkish
          rose and sandalwood, and for scents that feel considered rather than loud.
        </p>
      </InfoSection>

      <InfoSection title="How we shop with you">
        <ul>
          <li>
            <strong>Shop by what it is or how it smells.</strong> Browse by category, or by scent family such as oud,
            floral or fresh, across everything we sell.
          </li>
          <li>
            <strong>Sign in with just your email.</strong> No password to remember, and your bag follows you on every
            device.
          </li>
          <li>
            <strong>Pay securely.</strong> Payments are handled by Paystack. We never see or store your card details.
          </li>
        </ul>
      </InfoSection>

      <div className="flex flex-wrap gap-3 border-t pt-8">
        <Button asChild size="lg">
          <Link href="/shop">Shop the collection</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </InfoPage>
  );
}
