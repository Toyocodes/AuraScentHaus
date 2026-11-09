import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info";
import { STORE } from "@/lib/store-info";

export const metadata: Metadata = {
  title: "Returns and refunds",
  description: "AuraScentHaus returns and refunds: what can be returned, damaged or wrong items, and how refunds work.",
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  return (
    <InfoPage eyebrow="Policies" title="Returns and refunds" updated={STORE.policiesUpdated}>
      <InfoSection title="Damaged, faulty or wrong items">
        <p>
          If an item arrives damaged, leaking, faulty or isn&rsquo;t what you ordered, we&rsquo;ll replace it or refund you in
          full, including any delivery fee. Please <Link href="/contact">contact us</Link> within{" "}
          <strong>{STORE.reportProblemHours} hours of delivery</strong> with your order number and a photo of the item and
          packaging.
        </p>
      </InfoSection>

      <InfoSection title="Changed your mind?">
        <p>
          You can return items that are <strong>unopened, unused and still sealed</strong> in their original packaging within{" "}
          <strong>
            {STORE.returnDays} days ({STORE.returnDays * 24} hours) of delivery
          </strong>.
        </p>
        <p>For hygiene reasons we can&rsquo;t accept returns of:</p>
        <ul>
          <li>perfumes, perfume oils and body care that have been opened, sprayed or tested</li>
          <li>candles that have been burned, and diffusers that have been opened</li>
          <li>items bought on clearance, unless they&rsquo;re faulty</li>
        </ul>
        <p>You pay the cost of sending a change-of-mind return back to us.</p>
      </InfoSection>

      <InfoSection title="How to return something">
        <ul>
          <li>
            <Link href="/contact">Contact us</Link> with your order number and the item you&rsquo;d like to return.
          </li>
          <li>We&rsquo;ll confirm it can be returned and tell you where to send it.</li>
          <li>Pack it securely so it isn&rsquo;t damaged on the way.</li>
        </ul>
      </InfoSection>

      <InfoSection title="Refunds">
        <p>
          Once we&rsquo;ve received and checked the item, we refund you to the card or bank account you paid with. We&rsquo;ll
          email you when it&rsquo;s done. Banks usually take 5 to 10 working days to show the money.
        </p>
        <p>If we cancel your order before it ships, we refund you in full.</p>
      </InfoSection>
    </InfoPage>
  );
}
