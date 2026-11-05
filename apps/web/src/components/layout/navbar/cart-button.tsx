import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CartButton({ count = 0 }: { count?: number }) {
  return (
    <Button variant="ghost" size="icon" asChild aria-label={`Bag, ${count} items`}>
      <Link href="/cart" className="relative">
        <ShoppingBag className="size-[1.15rem]" strokeWidth={1.5} />
        {count > 0 && (
          <span className="absolute top-0.5 right-0.5 grid size-4 place-items-center rounded-full bg-gold text-[10px] font-medium text-gold-foreground">
            {count}
          </span>
        )}
      </Link>
    </Button>
  );
}
