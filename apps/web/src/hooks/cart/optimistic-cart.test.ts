import { describe, expect, it } from "vitest";
import type { CartDTO, CartItemDTO } from "@aurascenthaus/shared";
import { addTo, EMPTY_CART, removeFrom, setQuantityIn, toCartItem } from "./optimistic-cart";

function line(variantId: string, quantity: number, unitPrice = 1000, stock = 10): CartItemDTO {
  return {
    variantId,
    quantity,
    unitPrice,
    lineTotal: quantity * unitPrice,
    sizeMl: 50,
    sizeUnit: "ML",
    sizeLabel: "50 ml",
    stock,
    available: true,
    product: { id: `p-${variantId}`, name: `Product ${variantId}`, slug: `product-${variantId}`, image: null },
  };
}

function cartOf(...items: CartItemDTO[]): CartDTO {
  return {
    items,
    itemCount: items.reduce((n, i) => n + i.quantity, 0),
    subtotal: items.reduce((n, i) => n + i.lineTotal, 0),
    updatedAt: null,
  };
}

describe("setQuantityIn", () => {
  it("changes the quantity, line total, count and subtotal together", () => {
    const next = setQuantityIn(cartOf(line("a", 1), line("b", 2, 500)), "a", 3);
    expect(next.items[0]).toMatchObject({ quantity: 3, lineTotal: 3000 });
    expect(next.itemCount).toBe(5);
    expect(next.subtotal).toBe(4000);
  });

  it("never goes above what's in stock", () => {
    const next = setQuantityIn(cartOf(line("a", 1, 1000, 2)), "a", 5);
    expect(next.items[0].quantity).toBe(2);
  });

  it("removes the item at 0", () => {
    const next = setQuantityIn(cartOf(line("a", 1), line("b", 1)), "a", 0);
    expect(next.items.map((i) => i.variantId)).toEqual(["b"]);
    expect(next.itemCount).toBe(1);
  });

  it("leaves other items alone", () => {
    const b = line("b", 2);
    expect(setQuantityIn(cartOf(line("a", 1), b), "a", 2).items[1]).toBe(b);
  });
});

describe("removeFrom", () => {
  it("takes the line out and updates the totals", () => {
    const next = removeFrom(cartOf(line("a", 2), line("b", 1, 500)), "a");
    expect(next).toMatchObject({ itemCount: 1, subtotal: 500 });
  });
});

describe("addTo", () => {
  it("adds to a line that's already there", () => {
    const next = addTo(cartOf(line("a", 1)), line("a", 0), 2);
    expect(next.items).toHaveLength(1);
    expect(next.items[0].quantity).toBe(3);
  });

  it("appends a new line at the end, like the server", () => {
    const next = addTo(cartOf(line("a", 1)), line("b", 0, 2500), 1);
    expect(next.items.map((i) => i.variantId)).toEqual(["a", "b"]);
    expect(next.subtotal).toBe(3500);
  });

  it("works on an empty bag", () => {
    expect(addTo(EMPTY_CART, line("a", 0), 1).itemCount).toBe(1);
  });

  it("doesn't add an out-of-stock size", () => {
    const cart = cartOf(line("a", 1));
    expect(addTo(cart, line("b", 0, 1000, 0), 1)).toBe(cart);
  });

  it("is capped at 20 per item", () => {
    const next = addTo(EMPTY_CART, line("a", 0, 1000, 500), 25);
    expect(next.items[0].quantity).toBe(20);
  });
});

describe("toCartItem", () => {
  it("builds a bag line from the product page, with a readable size", () => {
    const item = toCartItem({
      product: { id: "p1", name: "Amber Hearth", slug: "amber-hearth", images: [] },
      variant: { id: "v1", sizeMl: 200, sizeUnit: "G", price: 1500000, stock: 4 },
    });
    expect(item).toMatchObject({ variantId: "v1", sizeLabel: "200 g", unitPrice: 1500000, stock: 4 });
    expect(item.product.image).toBeNull();
  });
});
