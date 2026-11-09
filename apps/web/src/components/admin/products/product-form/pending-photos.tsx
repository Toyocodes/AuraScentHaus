"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 5 * 1024 * 1024;
/** The API takes up to 8 photos in one upload. */
export const MAX_NEW_PHOTOS = 8;

export interface PendingPhoto {
  id: string;
  file: File;
  /** A local preview (blob: URL). Nothing is uploaded until the product is saved. */
  preview: string;
}

/** Why a file can't be used, or null if it's fine. Mirrors the API's checks. */
export function photoProblem(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return `${file.name} isn't a JPG, PNG, WebP or AVIF image.`;
  if (file.size > MAX_BYTES) return `${file.name} is larger than 5 MB.`;
  return null;
}

interface PendingPhotosProps {
  photos: PendingPhoto[];
  onChange: (photos: PendingPhoto[]) => void;
  disabled?: boolean;
}

/**
 * Photos chosen while creating a product. They're kept in the browser with a preview, and
 * uploaded right after the product is saved. The first one is the cover.
 */
export function PendingPhotos({ photos, onChange, disabled }: PendingPhotosProps) {
  const input = useRef<HTMLInputElement>(null);
  const [problems, setProblems] = useState<string[]>([]);

  // Free the previews when the form goes away (after saving, or leaving the page).
  const latest = useRef(photos);
  useEffect(() => {
    latest.current = photos;
  }, [photos]);
  useEffect(() => () => latest.current.forEach((p) => URL.revokeObjectURL(p.preview)), []);

  function add(files: FileList | null) {
    if (!files?.length) return;
    const found: string[] = [];
    const added: PendingPhoto[] = [];
    for (const file of Array.from(files)) {
      const problem = photoProblem(file);
      if (problem) found.push(problem);
      else if (photos.length + added.length >= MAX_NEW_PHOTOS) found.push(`You can add up to ${MAX_NEW_PHOTOS} photos here. Add more after saving.`);
      else added.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) });
    }
    setProblems([...new Set(found)]);
    if (added.length) onChange([...photos, ...added]);
  }

  function remove(id: string) {
    const photo = photos.find((p) => p.id === id);
    if (photo) URL.revokeObjectURL(photo.preview);
    onChange(photos.filter((p) => p.id !== id));
  }

  function move(index: number, by: -1 | 1) {
    const next = [...photos];
    const [photo] = next.splice(index, 1);
    next.splice(index + by, 0, photo);
    onChange(next);
  }

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-medium">Photos</legend>
      {photos.length > 0 && (
        <ol className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((photo, i) => (
            <li key={photo.id} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image src={photo.preview} alt={`Photo ${i + 1}`} fill unoptimized sizes="160px" className="object-cover" />
              {i === 0 && <span className="absolute top-1 left-1 rounded bg-background/85 px-1.5 text-[10px]">Cover</span>}
              <button
                type="button"
                onClick={() => remove(photo.id)}
                className="absolute top-1 right-1 rounded-full bg-background/85 p-1"
                aria-label={`Remove photo ${i + 1}`}
              >
                <X className="size-3" />
              </button>
              <div className="absolute inset-x-1 bottom-1 flex justify-between">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="rounded-full bg-background/85 p-1 disabled:invisible"
                  aria-label={`Move photo ${i + 1} earlier`}
                >
                  <ChevronLeft className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === photos.length - 1}
                  className="rounded-full bg-background/85 p-1 disabled:invisible"
                  aria-label={`Move photo ${i + 1} later`}
                >
                  <ChevronRight className="size-3" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      <input
        ref={input}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        hidden
        onChange={(e) => {
          add(e.target.files);
          e.target.value = "";
        }}
      />
      <Button type="button" variant="outline" onClick={() => input.current?.click()} disabled={photos.length >= MAX_NEW_PHOTOS}>
        <ImagePlus /> {photos.length ? "Add more photos" : "Add photos"}
      </Button>
      {problems.length > 0 && (
        <ul className="space-y-1 text-sm text-destructive" role="alert">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        JPG, PNG, WebP or AVIF, max 5 MB each. The first photo is the cover. They upload when you create the product.
      </p>
    </fieldset>
  );
}
