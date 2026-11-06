"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { CategoryTreeDTO, Gender } from "@aurascenthaus/shared";
import { FormInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useCategoryTree } from "@/hooks/categories";
import { useScentFamilies } from "@/hooks/scent-families";
import { cn } from "@/lib/utils";
import { GENDER_OPTIONS } from "./filter-options";
import { priceFilterSchema, type PriceFilterValues } from "./filter-schema";
import type { ShopFilters } from "../product-browser/use-filter-params";

interface FilterPanelProps {
  filters: ShopFilters;
  setFilters: (changes: Partial<ShopFilters>) => void;
  /** A link to another category that keeps the current filters. */
  hrefFor: (path: string) => string;
  /** The category being viewed, if any. */
  categorySlug?: string;
  showGender?: boolean;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 border-b pb-6 last:border-b-0">
      <h2 className="eyebrow text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function CheckRow({ label, checked, onChange, count }: { label: string; checked: boolean; onChange: (on: boolean) => void; count?: number }) {
  return (
    <Label className="flex cursor-pointer items-center gap-2.5 py-1 font-normal">
      <Checkbox checked={checked} onCheckedChange={(on) => onChange(on === true)} />
      <span className="flex-1 text-sm">{label}</span>
      {count !== undefined && <span className="text-xs text-muted-foreground tabular-nums">{count}</span>}
    </Label>
  );
}

function CategoryLinks({ tree, current, hrefFor }: { tree: CategoryTreeDTO[]; current?: string; hrefFor: (path: string) => string }) {
  const linkClass = (slug?: string) =>
    cn("block py-1 text-sm transition-colors hover:text-foreground", slug === current ? "font-medium text-foreground" : "text-muted-foreground");

  return (
    <ul className="space-y-1">
      <li>
        <Link href={hrefFor("/shop")} className={linkClass(undefined)} aria-current={current ? undefined : "page"}>
          Everything
        </Link>
      </li>
      {tree.map((main) => (
        <li key={main.id}>
          <Link href={hrefFor(`/shop/${main.slug}`)} className={linkClass(main.slug)} aria-current={main.slug === current ? "page" : undefined}>
            {main.name}
          </Link>
          {main.children.length > 0 && (
            <ul className="ml-3 border-l pl-3">
              {main.children.map((child) => (
                <li key={child.id}>
                  <Link href={hrefFor(`/shop/${child.slug}`)} className={linkClass(child.slug)} aria-current={child.slug === current ? "page" : undefined}>
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function PriceForm({ filters, setFilters }: Pick<FilterPanelProps, "filters" | "setFilters">) {
  const form = useForm<PriceFilterValues>({
    resolver: zodResolver(priceFilterSchema),
    defaultValues: { min: filters.minPrice?.toString() ?? "", max: filters.maxPrice?.toString() ?? "" },
  });

  return (
    <Form {...form}>
      <form
        noValidate
        className="space-y-3"
        onSubmit={form.handleSubmit(({ min, max }) =>
          setFilters({ minPrice: min === "" ? undefined : Number(min), maxPrice: max === "" ? undefined : Number(max) }),
        )}
      >
        <div className="grid grid-cols-2 gap-2">
          <FormInput<PriceFilterValues> name="min" type="number" min={0} placeholder="Min ₦" aria-label="Minimum price in naira" />
          <FormInput<PriceFilterValues> name="max" type="number" min={0} placeholder="Max ₦" aria-label="Maximum price in naira" />
        </div>
        <Button type="submit" variant="outline" size="sm" className="w-full">
          Apply
        </Button>
      </form>
    </Form>
  );
}

/** Category, scent family, price, availability and (where it applies) gender. */
export function FilterPanel({ filters, setFilters, hrefFor, categorySlug, showGender }: FilterPanelProps) {
  const { data: tree = [] } = useCategoryTree();
  const { data: scentFamilies = [] } = useScentFamilies();
  // Keep a selected family listed even if nothing is on sale in it right now.
  const families = scentFamilies.filter((s) => s.productCount > 0 || filters.scents.includes(s.slug));

  const toggleScent = (slug: string, on: boolean) =>
    setFilters({ scents: on ? [...filters.scents, slug] : filters.scents.filter((s) => s !== slug) });

  return (
    <div className="space-y-6">
      <Section title="Category">
        <CategoryLinks tree={tree} current={categorySlug} hrefFor={hrefFor} />
      </Section>

      {families.length > 0 && (
        <Section title="Scent family">
          <div className="space-y-0.5">
            {families.map((family) => (
              <CheckRow
                key={family.id}
                label={family.name}
                count={family.productCount}
                checked={filters.scents.includes(family.slug)}
                onChange={(on) => toggleScent(family.slug, on)}
              />
            ))}
          </div>
        </Section>
      )}

      <Section title="Price">
        {/* Remount when the URL changes, e.g. after "Clear all" or the back button. */}
        <PriceForm key={`${filters.minPrice}-${filters.maxPrice}`} filters={filters} setFilters={setFilters} />
      </Section>

      <Section title="Availability">
        <CheckRow label="In stock only" checked={filters.inStock} onChange={(on) => setFilters({ inStock: on })} />
      </Section>

      {showGender && (
        <Section title="For">
          <div className="space-y-0.5">
            {GENDER_OPTIONS.map((option) => (
              <CheckRow
                key={option.value}
                label={option.label}
                checked={filters.gender === option.value}
                onChange={(on) => setFilters({ gender: on ? (option.value as Gender) : undefined })}
              />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
