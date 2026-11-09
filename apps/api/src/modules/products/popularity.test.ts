import { describe, expect, it } from "vitest";
import { rankByUnitsSold } from "./rank-by-units-sold.js";

describe("rankByUnitsSold", () => {
  it("puts the best sellers first", () => {
    const sold = new Map([
      ["b", 3],
      ["c", 10],
    ]);
    expect(rankByUnitsSold(["a", "b", "c"], sold)).toEqual(["c", "b", "a"]);
  });

  it("keeps the incoming order (newest first) for ties and products with no sales", () => {
    const sold = new Map([
      ["b", 2],
      ["d", 2],
    ]);
    expect(rankByUnitsSold(["a", "b", "c", "d"], sold)).toEqual(["b", "d", "a", "c"]);
  });

  it("works with no sales at all", () => {
    expect(rankByUnitsSold(["a", "b"], new Map())).toEqual(["a", "b"]);
  });
});
