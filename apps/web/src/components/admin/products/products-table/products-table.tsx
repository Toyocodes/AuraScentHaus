import Image from "next/image";
import Link from "next/link";
import type { ProductListItemDTO } from "@aurascenthaus/shared";
import { EmptyState } from "@/components/common";
import { ProductVisual } from "@/components/product";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNaira } from "@/lib/format";

export function ProductsTable({ products }: { products: ProductListItemDTO[] }) {
  if (products.length === 0) {
    return <EmptyState title="No products yet" description="Create your first perfume to start selling." />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-14" />
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">From</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((p) => (
          <TableRow key={p.id}>
            <TableCell>
              <div className="relative size-10 overflow-hidden rounded-sm bg-muted">
                {p.image ? (
                  <Image src={p.image.url} alt="" fill sizes="40px" className="object-cover" />
                ) : (
                  <ProductVisual name={p.name} compact />
                )}
              </div>
            </TableCell>
            <TableCell>
              <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">
                {p.name}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">{p.category?.name ?? "None"}</TableCell>
            <TableCell className="space-x-1">
              <Badge variant={p.isActive ? "secondary" : "outline"}>{p.isActive ? "Active" : "Hidden"}</Badge>
              {p.isFeatured && <Badge>Featured</Badge>}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {p.priceFrom !== null ? formatNaira(p.priceFrom) : "No sizes"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
