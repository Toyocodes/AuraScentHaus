interface ScentNotesProps {
  top: string[];
  heart: string[];
  base: string[];
}

const ROWS = [
  { key: "top", label: "Top notes", hint: "The first impression" },
  { key: "heart", label: "Heart notes", hint: "The character" },
  { key: "base", label: "Base notes", hint: "What lingers" },
] as const;

/** The fragrance pyramid: top → heart → base. */
export function ScentNotes(notes: ScentNotesProps) {
  const rows = ROWS.filter((r) => notes[r.key].length > 0);
  if (rows.length === 0) return null;

  return (
    <dl className="divide-y border-y">
      {rows.map((r) => (
        <div key={r.key} className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
          <dt>
            <span className="eyebrow block text-foreground">{r.label}</span>
            <span className="text-xs text-muted-foreground">{r.hint}</span>
          </dt>
          <dd className="font-heading text-lg">{notes[r.key].join(" · ")}</dd>
        </div>
      ))}
    </dl>
  );
}
