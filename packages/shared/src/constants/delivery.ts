/**
 * Delivery options and how the fee for an order is chosen.
 * The options themselves (names, areas, fees, times) live in the database and admins edit them.
 * At checkout the customer picks one, and the checkout page and the API both use
 * `pickDeliveryZone`, so the fee shown is the fee charged.
 */

/**
 * - LAGOS_AXIS: a part of Lagos with named areas (Ikeja Axis: Ikeja, Maryland…). Admins add and delete these.
 * - LAGOS_OTHER: a Lagos area that isn't listed under any axis.
 * - NIGERIA: any other state (sent with GIG Logistics).
 * - PICKUP: the customer collects the order from the store.
 * There is exactly one of each kind except LAGOS_AXIS. Those can be edited or switched off, not deleted.
 */
export const DELIVERY_ZONE_KINDS = ["LAGOS_AXIS", "LAGOS_OTHER", "NIGERIA", "PICKUP"] as const;
export type DeliveryZoneKind = (typeof DELIVERY_ZONE_KINDS)[number];

export const DELIVERY_METHODS = ["DELIVERY", "PICKUP"] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

/** The 36 states and the FCT, for the address form. We only deliver within Nigeria. */
export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara",
] as const;

export const isNigeria = (country: string | null | undefined) => !country || country.trim().toLowerCase() === "nigeria";

/** The fields of a delivery option that decide the fee. */
export interface DeliveryZoneLike {
  id: string;
  name: string;
  kind: DeliveryZoneKind;
  areas: string[];
  fee: number; // kobo
  deliveryTime: string | null;
  isActive: boolean;
}

/** The options a customer can pick under "Delivery" (everything except store pickup), in display order. */
export const deliveryChoices = <Z extends DeliveryZoneLike>(zones: readonly Z[]) =>
  zones.filter((z) => z.isActive && z.kind !== "PICKUP");

export interface DeliveryRequest {
  method: DeliveryMethod;
  /** For DELIVERY: the option the customer picked, and the address's country. */
  zoneId?: string | null;
  country?: string | null;
}

export type DeliveryResolution<Z extends DeliveryZoneLike> =
  | { ok: true; zone: Z }
  | { ok: false; reason: "PICKUP_UNAVAILABLE" | "OUTSIDE_NIGERIA" | "ZONE_REQUIRED" | "ZONE_UNAVAILABLE"; message: string };

/**
 * The option this order is charged for. The customer's pick is trusted: if they pick the wrong
 * axis, the shop calls them to settle the difference before sending the order out.
 */
export function pickDeliveryZone<Z extends DeliveryZoneLike>(zones: readonly Z[], request: DeliveryRequest): DeliveryResolution<Z> {
  if (request.method === "PICKUP") {
    const pickup = zones.find((z) => z.isActive && z.kind === "PICKUP");
    return pickup
      ? { ok: true, zone: pickup }
      : { ok: false, reason: "PICKUP_UNAVAILABLE", message: "Store pickup isn't available at the moment." };
  }

  if (!isNigeria(request.country)) {
    return { ok: false, reason: "OUTSIDE_NIGERIA", message: "We only deliver within Nigeria." };
  }
  if (!request.zoneId) return { ok: false, reason: "ZONE_REQUIRED", message: "Choose your delivery area." };

  const zone = deliveryChoices(zones).find((z) => z.id === request.zoneId);
  return zone
    ? { ok: true, zone }
    : {
        ok: false,
        reason: "ZONE_UNAVAILABLE",
        message: "That delivery option is no longer available. Please choose another one.",
      };
}
