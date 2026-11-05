import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  /** Optional "View all →" link on the right. */
  link?: { href: string; label: string };
  align?: "left" | "center";
  className?: string;
}

/** Heading for a homepage / storefront section. */
export function SectionHeading({ eyebrow, title, link, align = "left", className }: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-4",
        centered ? "flex-col items-center text-center" : "justify-between",
        className,
      )}
    >
      <div className="space-y-3">
        {eyebrow && <p className="eyebrow text-gold">{eyebrow}</p>}
        <h2 className="text-4xl md:text-5xl">{title}</h2>
      </div>
      {link && (
        <Link
          href={link.href}
          className="border-b border-foreground/30 pb-1 text-xs tracking-[0.2em] uppercase transition-colors hover:border-foreground"
        >
          {link.label}
        </Link>
      )}
    </div>
  );
}
