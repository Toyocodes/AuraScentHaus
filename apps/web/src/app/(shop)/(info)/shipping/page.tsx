import type { Metadata } from "next";
import Link from "next/link";
import type { DeliveryZoneDTO } from "@aurascenthaus/shared";
import { InfoPage, InfoSection } from "@/components/info";
import { getDeliveryZones } from "@/lib/catalog-metadata";
import { formatNaira } from "@/lib/format";
import { STORE } from "@/lib/store-info";

export const metadata: Metadata = {
  title: "Shipping and delivery",
  description: "How AuraScentHaus delivers across Nigeria: delivery fees, times, store pickup and tracking your order.",
  alternates: { canonical: "/shipping" },
};

/** "₦3,000 · 1 to 2 working days" */
const feeAndTime = (zone: DeliveryZoneDTO) => [formatNaira(zone.fee), zone.deliveryTime].filter(Boolean).join(" · ");

export default async function ShippingPage() {
  // The same options and fees admins manage on the Delivery page, so this never goes out of date.
  const zones = await getDeliveryZones();
  const axes = zones?.filter((z) => z.kind === "LAGOS_AXIS") ?? [];
  const otherLagos = zones?.find((z) => z.kind === "LAGOS_OTHER");
  const nigeria = zones?.find((z) => z.kind === "NIGERIA");
  const pickup = zones?.find((z) => z.kind === "PICKUP");

  return (
    <InfoPage eyebrow="Policies" title="Shipping and delivery" updated={STORE.policiesUpdated}>
      <InfoSection title="Where we deliver">
        <p>
          We deliver to addresses across Nigeria. We don&rsquo;t ship outside Nigeria.
          {pickup && <> You can also collect your order from our store in {STORE.location}.</>}
        </p>
      </InfoSection>

      <InfoSection title="Delivery fees and times">
        <p>
          The fee depends on where you are. At checkout you choose the delivery area your address is in, and the fee and
          total are shown before you pay. If the area chosen doesn&rsquo;t match the address, we&rsquo;ll call you to sort
          out the difference before sending your order.
        </p>
        {zones && (
          <ul>
            {axes.map((z) => (
              <li key={z.id}>
                <strong>{z.name}</strong> ({z.areas.join(", ")}): {feeAndTime(z)}
              </li>
            ))}
            {otherLagos && (
              <li>
                <strong>Other areas in Lagos:</strong> {feeAndTime(otherLagos)}
              </li>
            )}
            {nigeria && (
              <li>
                <strong>{nigeria.name}:</strong> {feeAndTime(nigeria)}
              </li>
            )}
            {pickup && (
              <li>
                <strong>{pickup.name}:</strong> {formatNaira(pickup.fee)}
                {pickup.deliveryTime && <>, ready in {pickup.deliveryTime}</>}
              </li>
            )}
          </ul>
        )}
        <p>
          Working days are Monday to Friday, excluding public holidays. Times are a guide, and can be longer during sales,
          holidays or bad weather.
        </p>
      </InfoSection>

      <InfoSection title="Following your order">
        <p>
          We email you when your order is confirmed, when it ships and when it&rsquo;s delivered. You can also check its
          status any time in <Link href="/account/orders">My orders</Link>. The courier will call the phone number on your
          delivery address before they arrive, so please make sure it&rsquo;s correct.
          {pickup && <> For store pickup, we&rsquo;ll email you when your order is ready to collect.</>}
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
