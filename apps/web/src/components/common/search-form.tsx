"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "@/components/form";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ search: z.string().trim().max(100) });
type SearchValues = z.infer<typeof searchSchema>;

interface SearchFormProps {
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  /** Called with the trimmed text ("" clears the search). */
  onSearch?: (search: string) => void;
}

/** Search box for lists and tables. Submits on Enter. */
export function SearchForm({ placeholder = "Search…", defaultValue = "", className, onSearch }: SearchFormProps) {
  const form = useForm<SearchValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { search: defaultValue },
  });

  return (
    <Form {...form}>
      <form
        role="search"
        onSubmit={form.handleSubmit(({ search }) => onSearch?.(search))}
        className={cn("relative", className)}
      >
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <FormInput<SearchValues> name="search" type="search" placeholder={placeholder} aria-label={placeholder} className="pl-9" />
      </form>
    </Form>
  );
}
