import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">404</p>
      <h1 className="text-4xl">This page has evaporated</h1>
      <p className="text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Button asChild>
        <Link href="/">Back to the store</Link>
      </Button>
    </div>
  );
}
