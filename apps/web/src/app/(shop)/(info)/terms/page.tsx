import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info";
import { STORE } from "@/lib/store-info";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: "The terms for buying from AuraScentHaus: orders, prices, payment, delivery and returns.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Policies"
      title="Terms and conditions"
      description={`These terms apply when you use this website and buy from ${STORE.name}. By placing an order, you agree to them.`}
      updated={STORE.policiesUpdated}
    >
      <InfoSection title="Your account">
        <p>
          You sign in with a one-time code sent to your email. Please keep your email secure, and tell us straight away if
          you think someone else has used your account.
        </p>
      </InfoSection>

      <InfoSection title="Orders">
        <p>
          Your order is confirmed once your payment succeeds and we email you a confirmation. We may cancel an order and
          refund you in full if an item is unexpectedly out of stock, if there&rsquo;s an obvious error in its price or
          description, or if we suspect fraud.
        </p>
      </InfoSection>

      <InfoSection title="Prices and payment">
        <p>
          Prices are in Nigerian naira (₦). Any delivery fee is shown at checkout before you pay. Payment is taken by Paystack
          when you place your order.
        </p>
      </InfoSection>

      <InfoSection title="Products">
        <p>
          We describe and photograph our products as accurately as we can, but colours can look different on screens, and a
          fragrance can smell slightly different on each person. If you have allergies or sensitive skin, read the
          ingredients and do a patch test first. Keep candles, diffusers and fragrance away from children, pets and open
          flames, and follow the instructions on each product.
        </p>
      </InfoSection>

      <InfoSection title="Delivery, returns and refunds">
        <p>
          See our <Link href="/shipping">shipping policy</Link> and <Link href="/returns">returns policy</Link>. Nothing in these
          terms affects your rights under Nigerian consumer protection law.
        </p>
      </InfoSection>

      <InfoSection title="Our liability">
        <p>
          We&rsquo;re responsible for losses you suffer that are a foreseeable result of us breaking these terms. We aren&rsquo;t
          responsible for losses that weren&rsquo;t foreseeable, or for business losses. Our total liability for an order is
          limited to the amount you paid for it, except where the law doesn&rsquo;t allow us to limit it.
        </p>
      </InfoSection>

      <InfoSection title="The website">
        <p>
          The content of this website, including text, photos and logos, belongs to {STORE.name} and can&rsquo;t be copied
          without our permission. How we use your information is covered by our <Link href="/privacy">privacy policy</Link>.
        </p>
      </InfoSection>

      <InfoSection title="Changes and governing law">
        <p>
          We may update these terms. The version on this page when you place an order is the one that applies to it. These
          terms are governed by the laws of the Federal Republic of Nigeria.
        </p>
        <p>
          Questions? <Link href="/contact">Contact us</Link>.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
