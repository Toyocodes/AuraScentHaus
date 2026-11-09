import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { InfoPage, InfoSection } from "@/components/info";
import { STORE, whatsappLink } from "@/lib/store-info";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Questions about an order, a product or a gift? Get in touch with AuraScentHaus.",
  alternates: { canonical: "/contact" },
};

const telLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export default function ContactPage() {
  const details = [
    { icon: Mail, label: "Email", value: STORE.email, href: `mailto:${STORE.email}` },
    STORE.phone && { icon: Phone, label: "Phone", value: STORE.phone, href: telLink(STORE.phone) },
    STORE.whatsapp && { icon: MessageCircle, label: "WhatsApp", value: "Chat with us", href: whatsappLink(STORE.whatsapp) },
    { icon: Clock, label: "Hours", value: STORE.hours },
    STORE.location && { icon: MapPin, label: "Based in", value: STORE.location },
  ].filter((d) => !!d);

  return (
    <InfoPage eyebrow="We're here to help" title="Contact us" description="Questions about an order, a product or a gift? We usually reply within one working day.">
      <ul className="grid gap-4 sm:grid-cols-2">
        {details.map(({ icon: Icon, label, value, href }) => (
          <li key={label} className="flex items-start gap-4 rounded-md border bg-card p-5">
            <Icon className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
            <div className="min-w-0 space-y-1">
              <p className="eyebrow text-muted-foreground">{label}</p>
              {href ? (
                <a
                  href={href}
                  className="break-words underline-offset-4 hover:underline"
                  {...(href.startsWith("http") && { target: "_blank", rel: "noreferrer" })}
                >
                  {value}
                </a>
              ) : (
                <p>{value}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <InfoSection title="About an order">
        <p>
          Please include your <strong>order number</strong> (it starts with &ldquo;ASH&rdquo; and is in your confirmation email)
          so we can find it quickly. You can also follow every order in{" "}
          <Link href="/account/orders">My orders</Link>.
        </p>
        <p>
          For deliveries, returns and refunds, see our <Link href="/shipping">shipping</Link> and{" "}
          <Link href="/returns">returns</Link> policies.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
