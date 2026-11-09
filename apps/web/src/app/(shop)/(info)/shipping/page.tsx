import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info";
import { STORE } from "@/lib/store-info";

export const metadata: Metadata = {
  title: "Shipping and delivery",
  description: "How AuraScentHaus delivers across Nigeria: delivery times, fees and tracking your order.",
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <InfoPage eyebrow="Policies" title="Shipping and delivery" updated={STORE.policiesUpdated}>
      <InfoSection title="Where we deliver">
        <p>We deliver to addresses across Nigeria. At the moment we don&rsquo;t ship outside Nigeria.</p>
      </InfoSection>

      <InfoSection title="How long it takes">
        <p>We prepare orders within 1 to 2 working days of payment. After that, delivery usually takes:</p>
        <ul>
          <li>
            <strong>Lagos:</strong> {STORE.delivery.lagos}
          </li>
          <li>
            <strong>Everywhere else in Nigeria:</strong> {STORE.delivery.elsewhere}
          </li>
        </ul>
        <p>
          Working days are Monday to Friday, excluding public holidays. Times are a guide, and can be longer during sales,
          holidays or bad weather.
        </p>
      </InfoSection>

      <InfoSection title="Delivery fees">
        <p>Any delivery fee is shown at checkout, before you pay. You&rsquo;ll never be charged more after your order is placed.</p>
      </InfoSection>

      <InfoSection title="Following your order">
        <p>
          We email you when your order is confirmed, when it ships and when it&rsquo;s delivered. You can also check its
          status any time in <Link href="/account/orders">My orders</Link>. The courier will call the phone number on your
          delivery address before they arrive, so please make sure it&rsquo;s correct.
        </p>
      </InfoSection>

      <InfoSection title="If something goes wrong">
        <p>
          If your parcel arrives damaged, or something is missing or wrong, tell us within {STORE.reportProblemHours} hours of
          delivery with your order number and a photo. See our <Link href="/returns">returns policy</Link>, or{" "}
          <Link href="/contact">contact us</Link>.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
