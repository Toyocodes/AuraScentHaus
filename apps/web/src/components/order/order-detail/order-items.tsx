import Image from "next/image";
import type { OrderItemDTO } from "@aurascenthaus/shared";
import { ProductVisual } from "@/components/product";
import { formatNaira } from "@/lib/format";

export function OrderItems({ items }: { items: OrderItemDTO[] }) {
  return (
    <ul className="divide-y rounded-sm border">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-4 p-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-muted">
            {item.image ? (
              <Image src={item.image} alt={item.productName} fill sizes="64px" className="object-cover" />
            ) : (
              <ProductVisual name={item.productName} compact />
            )}
          </div>
          <div className="flex-1">
            <p className="font-heading text-lg">{item.productName}</p>
            <p className="text-sm text-muted-foreground">
              {item.sizeMl}ml × {item.quantity} @ {formatNaira(item.unitPrice)}
            </p>
          </div>
          <p>{formatNaira(item.lineTotal)}</p>
        </li>
      ))}
    </ul>
  );
}
