import type { ReactNode } from "react";
import { PageHeader } from "@/components/common";

interface InfoPageProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  /** "Last updated …", for policies. */
  updated?: string;
  children: ReactNode;
}

/** A readable text page: About, Contact and the store policies. */
export function InfoPage({ eyebrow, title, description, updated, children }: InfoPageProps) {
  return (
    <div className="container-page max-w-3xl space-y-12 py-16">
      <div className="space-y-3">
        <PageHeader eyebrow={eyebrow} title={title} description={description} />
        {updated && <p className="text-xs text-muted-foreground">Last updated {updated}</p>}
      </div>
      <div className="space-y-10">{children}</div>
    </div>
  );
}

/** One titled part of an info page. Paragraphs, lists and links inside are styled for reading. */
export function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-t pt-8">
      <h2 className="text-2xl md:text-3xl">{title}</h2>
      <div className="space-y-4 text-[0.9375rem] leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
