import { describe, expect, it } from "vitest";
import { deliveryChoices, pickDeliveryZone, type DeliveryZoneLike } from "@aurascenthaus/shared";

const zone = (id: string, kind: DeliveryZoneLike["kind"], fee: number, isActive = true): DeliveryZoneLike => ({
  id,
  name: id,
  kind,
  areas: [],
  fee,
  deliveryTime: null,
  isActive,
});

const zones = [
  zone("ikeja", "LAGOS_AXIS", 3000_00),
  zone("off", "LAGOS_AXIS", 1000_00, false),
  zone("other", "LAGOS_OTHER", 7000_00),
  zone("gig", "NIGERIA", 7000_00),
  zone("pickup", "PICKUP", 0),
];

const pick = (request: Parameters<typeof pickDeliveryZone>[1], list = zones) => {
  const result = pickDeliveryZone(list, request);
  return result.ok ? result.zone.id : result.reason;
};

describe("pickDeliveryZone", () => {
  it("charges the option the customer picked", () => {
    expect(pick({ method: "DELIVERY", zoneId: "ikeja" })).toBe("ikeja");
    expect(pick({ method: "DELIVERY", zoneId: "other", country: "Nigeria" })).toBe("other");
    expect(pick({ method: "DELIVERY", zoneId: "gig", country: " nigeria " })).toBe("gig");
  });

  it("asks for an option", () => {
    expect(pick({ method: "DELIVERY" })).toBe("ZONE_REQUIRED");
  });

  it("refuses options that are switched off, unknown, or store pickup", () => {
    expect(pick({ method: "DELIVERY", zoneId: "off" })).toBe("ZONE_UNAVAILABLE");
    expect(pick({ method: "DELIVERY", zoneId: "deleted" })).toBe("ZONE_UNAVAILABLE");
    expect(pick({ method: "DELIVERY", zoneId: "pickup" })).toBe("ZONE_UNAVAILABLE");
  });

  it("refuses addresses outside Nigeria", () => {
    expect(pick({ method: "DELIVERY", zoneId: "ikeja", country: "Ghana" })).toBe("OUTSIDE_NIGERIA");
  });

  it("uses store pickup when chosen, if it is on", () => {
    expect(pick({ method: "PICKUP" })).toBe("pickup");
    const noPickup = zones.map((z) => (z.kind === "PICKUP" ? { ...z, isActive: false } : z));
    expect(pick({ method: "PICKUP" }, noPickup)).toBe("PICKUP_UNAVAILABLE");
  });

  it("offers every active option except pickup under Delivery", () => {
    expect(deliveryChoices(zones).map((z) => z.id)).toEqual(["ikeja", "other", "gig"]);
  });
});
