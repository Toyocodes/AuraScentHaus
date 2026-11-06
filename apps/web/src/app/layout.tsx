import type { Metadata } from "next";
import { Cormorant_Garamond, Geist_Mono, Jost } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

// Jost: a clean geometric sans for body text, paired with Cormorant's serif headings.
const sans = Jost({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "AuraScentHaus | The Art of Scent", template: "%s · AuraScentHaus" },
  description: "Luxury perfumes, home fragrance, body care and gifts, delivered across Nigeria.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
