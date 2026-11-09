"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";

interface ImagePickerButtonProps {
  /** The current picture, if there is one. */
  imageUrl: string | null;
  /** For screen readers, e.g. "Candles". */
  name: string;
  canEdit: boolean;
  /** Should show its own error message and rethrow, so a failed upload can be retried. */
  onPick?: (file: File) => void | Promise<void>;
}

/** A small square thumbnail. Click it to choose a new picture (JPEG, PNG, WebP or AVIF, up to 5 MB). */
export function ImagePickerButton({ imageUrl, name, canEdit, onPick }: ImagePickerButtonProps) {
  const input = useRef<HTMLInputElement>(null);

  const picture: ReactNode = imageUrl ? (
    <Image src={imageUrl} alt="" fill sizes="36px" className="object-cover" />
  ) : (
    <ImagePlus className="size-4 text-muted-foreground" />
  );

  if (!canEdit) {
    return <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-sm bg-muted">{picture}</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => input.current?.click()}
        aria-label={`Change the picture for ${name}`}
        className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-sm bg-muted hover:opacity-80"
      >
        {picture}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          try {
            await onPick?.(file);
          } catch {
            // The parent has shown why it failed.
          }
        }}
      />
    </>
  );
}
