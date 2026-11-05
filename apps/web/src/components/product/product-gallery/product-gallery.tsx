"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImageDTO } from "@aurascenthaus/shared";
import { cn } from "@/lib/utils";
import { ProductVisual } from "../product-visual/product-visual";

/** Main image plus thumbnails. Click a thumbnail to show it large. */
export function ProductGallery({ images, name }: { images: ProductImageDTO[]; name: string }) {
  const [activeId, setActiveId] = useState(images[0]?.id);
  const active = images.find((i) => i.id === activeId) ?? images[0];

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
        {active ? (
          <Image
            src={active.url}
            alt={active.alt ?? name}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <ProductVisual name={name} />
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveId(img.id)}
              aria-label={`Show image ${img.position + 1}`}
              className={cn(
                "relative aspect-square overflow-hidden rounded-sm bg-muted opacity-70 transition-opacity hover:opacity-100",
                img.id === active?.id && "opacity-100 ring-1 ring-foreground",
              )}
            >
              <Image src={img.url} alt={img.alt ?? name} fill sizes="10vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
