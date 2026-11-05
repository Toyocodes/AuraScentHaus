import { cn } from "@/lib/utils";

/** Warm backdrop + bottle tints. Each product always gets the same one (picked from its name). */
const TONES = [
  { bg: "from-[#f3ebdf] to-[#e2d2bb]", glass: "#d9c2a0", liquid: "#b98d5c", cap: "#5a4030" }, // sand / honey
  { bg: "from-[#f1e4dc] to-[#dcc0ae]", glass: "#e4c6b5", liquid: "#b9806a", cap: "#4d3328" }, // rose clay
  { bg: "from-[#ece4d6] to-[#cdb99a]", glass: "#cdb48e", liquid: "#8f6a42", cap: "#3d2b1f" }, // oud amber
  { bg: "from-[#efeadf] to-[#d8cfb9]", glass: "#dad2b8", liquid: "#a99a6c", cap: "#4a4232" }, // fig / olive
  { bg: "from-[#e9ddd0] to-[#c4a88c]", glass: "#c9a988", liquid: "#7b5638", cap: "#2f2119" }, // cocoa
] as const;

function toneFor(seed: string) {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[hash % TONES.length]!;
}

interface ProductVisualProps {
  name: string;
  className?: string;
  /** Hide the name engraved on the bottle (for small thumbnails). */
  compact?: boolean;
}

/**
 * Illustrated perfume bottle, used wherever a product has no photo yet.
 * Fills its parent, so give the parent a size or aspect ratio.
 */
export function ProductVisual({ name, className, compact }: ProductVisualProps) {
  const tone = toneFor(name);

  return (
    <div
      className={cn("relative grid size-full place-items-center overflow-hidden bg-linear-to-b", tone.bg, className)}
      role="img"
      aria-label={`${name} bottle`}
    >
      <svg viewBox="0 0 120 160" className="h-[68%] w-auto drop-shadow-[0_18px_22px_rgb(60_40_25/0.18)]" aria-hidden>
        {/* cap */}
        <rect x="46" y="8" width="28" height="26" rx="3" fill={tone.cap} />
        <rect x="49" y="10" width="4" height="22" rx="2" fill="#ffffff" opacity="0.12" />
        {/* neck */}
        <rect x="52" y="34" width="16" height="10" fill={tone.glass} opacity="0.9" />
        {/* bottle */}
        <rect x="20" y="44" width="80" height="106" rx="10" fill={tone.glass} opacity="0.55" />
        <rect x="26" y="70" width="68" height="74" rx="6" fill={tone.liquid} opacity="0.55" />
        <rect x="20" y="44" width="80" height="106" rx="10" fill="none" stroke={tone.cap} strokeOpacity="0.18" />
        {/* highlight */}
        <rect x="28" y="52" width="6" height="88" rx="3" fill="#ffffff" opacity="0.35" />
        {/* label */}
        <rect x="38" y="92" width="44" height="26" rx="1" fill="#fbf7f0" opacity="0.85" />
        <line x1="44" y1="100" x2="76" y2="100" stroke={tone.cap} strokeOpacity="0.5" strokeWidth="0.8" />
        <line x1="50" y1="110" x2="70" y2="110" stroke={tone.cap} strokeOpacity="0.3" strokeWidth="0.8" />
      </svg>
      {!compact && (
        <span className="absolute bottom-5 font-heading text-sm tracking-[0.25em] text-[#3d2b1f]/55 uppercase">
          {name}
        </span>
      )}
    </div>
  );
}
