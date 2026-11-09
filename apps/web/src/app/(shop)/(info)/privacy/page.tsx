import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info";
import { STORE } from "@/lib/store-info";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What personal information AuraScentHaus collects, why, who we share it with and your rights.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Policies"
      title="Privacy policy"
      description="We only collect what we need to run the shop and deliver your orders, and we never sell it."
      updated={STORE.policiesUpdated}
    >
      <InfoSection title="What we collect">
        <ul>
          <li>
            <strong>Your account:</strong> your email address, and your name and phone number if you add them.
          </li>
          <li>
            <strong>Delivery addresses</strong> you save or use at checkout.
          </li>
          <li>
            <strong>Your orders:</strong> what you bought, when, and how much you paid.
          </li>
          <li>
            <strong>Your bag:</strong> the items you add, so they&rsquo;re still there next time.
          </li>
        </ul>
        <p>
          We <strong>don&rsquo;t</strong> see or store your card or bank details. Payments are made on Paystack&rsquo;s secure
          page.
        </p>
      </InfoSection>

      <InfoSection title="Why we use it">
        <ul>
          <li>to sign you in, using a one-time code sent to your email</li>
          <li>to take payment, deliver your order and email you about it</li>
          <li>to answer your questions and handle returns</li>
          <li>to keep the shop secure and prevent fraud</li>
          <li>to keep the records the law requires, such as sales records</li>
        </ul>
        <p>We don&rsquo;t send marketing emails unless you&rsquo;ve asked for them.</p>
      </InfoSection>

      <InfoSection title="Who we share it with">
        <p>We never sell your information. We share only what&rsquo;s needed with the services that help us run the shop:</p>
        <ul>
          <li>
            <strong>Paystack</strong>, to process payments
          </li>
          <li>
            <strong>Delivery partners</strong>, who get your name, phone number and address to deliver your order
          </li>
          <li>
            <strong>Our hosting, database and email providers</strong>, who store our data and send our emails for us
          </li>
        </ul>
        <p>We may also share information if the law requires it.</p>
      </InfoSection>

      <InfoSection title="Cookies and your browser">
        <p>
          We use one essential cookie to keep you signed in. If you shop without signing in, your bag is saved in your
          browser. We don&rsquo;t use advertising or tracking cookies.
        </p>
      </InfoSection>

      <InfoSection title="How long we keep it">
        <p>
          We keep your account until you ask us to delete it. We keep order records for as long as tax and accounting rules
          require, even after an account is deleted.
        </p>
      </InfoSection>

      <InfoSection title="Your rights">
        <p>
          Under the Nigeria Data Protection Act 2023 you can ask to see the information we hold about you, correct it, delete
          it, or object to how we use it. You can update your details and addresses in <Link href="/account">your account</Link>{" "}
          at any time. For anything else, email <a href={`mailto:${STORE.email}`}>{STORE.email}</a> and we&rsquo;ll reply
          within 30 days.
        </p>
        <p>
          If you&rsquo;re unhappy with how we&rsquo;ve handled your information, you can also complain to the Nigeria Data
          Protection Commission.
        </p>
      </InfoSection>

      <InfoSection title="Changes to this policy">
        <p>If we change this policy, we&rsquo;ll update it here and change the date at the top.</p>
      </InfoSection>
    </InfoPage>
  );
}
