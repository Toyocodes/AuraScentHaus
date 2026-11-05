import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: ReactNode;
  /** Small uppercase line above the title, e.g. "Collection". */
  eyebrow?: string;
  description?: ReactNode;
  /** Buttons on the right, e.g. "+ New product". */
  actions?: ReactNode;
  /** h1 for page titles, h2 for sections inside a layout that already has an h1. */
  as?: "h1" | "h2";
  className?: string;
}

export function PageHeader({ title, eyebrow, description, actions, as: Heading = "h1", className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="space-y-3">
        {eyebrow && <p className="eyebrow text-gold">{eyebrow}</p>}
        <Heading className={Heading === "h1" ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl"}>{title}</Heading>
        {description && <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
