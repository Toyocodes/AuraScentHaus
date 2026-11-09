/**
 * The shop's contact details and policy numbers, used by the About, Contact, Shipping, Returns,
 * Privacy and Terms pages and the footer.
 *
 * CHANGE BEFORE LAUNCH: the email below is a placeholder. Fill in your real details, and set a
 * value to null to hide it (for example if you don't use WhatsApp).
 */
export const STORE = {
  name: "AuraScentHaus",
  email: "hello@aurascenthaus.com",
  /** Shown as a tap-to-call link, e.g. "+234 800 000 0000". */
  phone: null as string | null,
  /** International format without "+" or spaces, e.g. "2348000000000". */
  whatsapp: null as string | null,
  /** Where the shop is based, e.g. "Lekki, Lagos". Shown on the Contact page. */
  location: "Lagos, Nigeria",
  hours: "Monday to Saturday, 9am to 6pm",
  /** How long delivery usually takes. */
  delivery: {
    lagos: "1 to 3 working days",
    elsewhere: "3 to 7 working days",
  },
  /** Days after delivery that unopened items can be returned. */
  returnDays: 7,
  /** Hours after delivery to report a damaged or wrong item. */
  reportProblemHours: 48,
  /** Shown at the top of the policy pages. Update it whenever you change a policy. */
  policiesUpdated: "9 November 2026",
} as const;

export const whatsappLink = (number: string) => `https://wa.me/${number}`;
