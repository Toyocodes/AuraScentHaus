import Link from "next/link";
import { ProductVisual } from "@/components/product";

/** Split screen: brand visual on the left (large screens), form on the right. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <ProductVisual name="Royal Oud" compact />
        <div className="absolute inset-0 bg-linear-to-t from-espresso/80 via-espresso/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 space-y-3 p-12 text-espresso-foreground">
          <p className="eyebrow text-gold">AuraScentHaus</p>
          <p className="max-w-md font-heading text-4xl leading-tight">
            Your bag, your orders and your favourite scents, on every device.
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-10 bg-background px-5 py-12">
        <Link href="/" className="font-heading text-2xl tracking-[0.3em] uppercase">
          Aura<span className="text-gold">Scent</span>Haus
        </Link>
        <div className="w-full max-w-sm">{children}</div>
        <Link href="/" className="text-xs tracking-[0.2em] text-muted-foreground uppercase hover:text-foreground">
          ← Back to the store
        </Link>
      </div>
    </div>
  );
}
