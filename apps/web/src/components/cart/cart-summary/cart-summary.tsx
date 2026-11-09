import Link from "next/link";
import { SummaryRow } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatNaira } from "@/lib/format";

interface CartSummaryProps {
  itemCount: number;
  /** In kobo. */
  subtotal: number;
  isSignedIn?: boolean;
  /** Changes are still saving, so checking out would use an old quantity. */
  isSaving?: boolean;
}

export function CartSummary({ itemCount, subtotal, isSignedIn = false, isSaving = false }: CartSummaryProps) {
  return (
    <aside className="h-fit space-y-4 rounded-sm border bg-card p-6">
      <h2 className="text-xl">Summary</h2>
      <SummaryRow label="Items" value={itemCount} />
      <SummaryRow label="Shipping" value="Calculated at checkout" />
      <Separator />
      <SummaryRow label="Subtotal" value={formatNaira(subtotal)} strong />
      {isSaving ? (
        <Button size="lg" className="w-full" disabled>
          Saving your bag…
        </Button>
      ) : (
        <Button size="lg" className="w-full" asChild>
          <Link href={isSignedIn ? "/checkout" : "/login?next=/checkout"}>Checkout</Link>
        </Button>
      )}
      {!isSignedIn && (
        <p className="text-center text-xs text-muted-foreground">
          Sign in with your email to check out. Your bag will be saved to your account.
        </p>
      )}
    </aside>
  );
}
