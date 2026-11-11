import {
  type DeliveryZoneDTO,
  type DeliveryZoneInput,
  type UpdateDeliveryZoneInput,
} from "@aurascenthaus/shared";
import { prisma } from "../../config/prisma.js";
import type { DeliveryZone } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

const ORDER = [{ position: "asc" }, { fee: "asc" }, { name: "asc" }] as const;

export function toDeliveryZoneDTO(z: DeliveryZone): DeliveryZoneDTO {
  return {
    id: z.id,
    name: z.name,
    kind: z.kind,
    areas: z.areas,
    fee: z.fee,
    deliveryTime: z.deliveryTime,
    position: z.position,
    isActive: z.isActive,
  };
}

/** For shoppers (checkout and the shipping page): the options in use. */
export async function listActiveDeliveryZones() {
  const rows = await prisma.deliveryZone.findMany({ where: { isActive: true }, orderBy: [...ORDER] });
  return rows.map(toDeliveryZoneDTO);
}

/** For admins: every option, including switched-off ones. */
export async function listAllDeliveryZones() {
  const rows = await prisma.deliveryZone.findMany({ orderBy: [...ORDER] });
  return rows.map(toDeliveryZoneDTO);
}

const key = (area: string) => area.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * Tidies a list of areas (trims, drops repeats) and makes sure none of them is already in
 * another axis, so every area has exactly one fee.
 */
async function checkAreas(areas: string[], exceptZoneId?: string): Promise<string[]> {
  const seen = new Set<string>();
  const clean: string[] = [];
  for (const raw of areas) {
    const area = raw.trim().replace(/\s+/g, " ");
    if (!area || seen.has(key(area))) continue;
    seen.add(key(area));
    clean.push(area);
  }

  const others = await prisma.deliveryZone.findMany({
    where: { kind: "LAGOS_AXIS", ...(exceptZoneId && { id: { not: exceptZoneId } }) },
    select: { name: true, areas: true },
  });
  for (const zone of others) {
    const clash = zone.areas.find((a) => seen.has(key(a)));
    if (clash) {
      throw ApiError.conflict(`${clash} is already in ${zone.name}. Remove it there first.`, "AREA_IN_ANOTHER_AXIS", {
        area: clash,
        zone: zone.name,
      });
    }
  }
  return clean;
}

/** Adds a Lagos axis. (The other kinds of option exist once each and are only edited.) */
export async function createDeliveryZone(input: DeliveryZoneInput) {
  const areas = await checkAreas(input.areas ?? []);
  if (areas.length === 0) throw ApiError.badRequest("Add at least one area to this axis", "AREAS_REQUIRED");
  const row = await prisma.deliveryZone.create({ data: { ...input, areas, kind: "LAGOS_AXIS" } });
  return toDeliveryZoneDTO(row);
}

export async function updateDeliveryZone(id: string, input: UpdateDeliveryZoneInput) {
  const existing = await prisma.deliveryZone.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("Delivery option");

  const { areas: rawAreas, ...rest } = input;
  let areas: string[] | undefined;
  if (existing.kind === "LAGOS_AXIS" && rawAreas) {
    areas = await checkAreas(rawAreas, id);
    if (areas.length === 0) throw ApiError.badRequest("Add at least one area to this axis", "AREAS_REQUIRED");
  }

  const row = await prisma.deliveryZone.update({ where: { id }, data: { ...rest, ...(areas && { areas }) } });
  return toDeliveryZoneDTO(row);
}

/**
 * Only Lagos axes can be deleted. Past orders keep the option name and fee they were charged;
 * addresses that last used it simply have nothing preselected next time.
 */
export async function deleteDeliveryZone(id: string) {
  const existing = await prisma.deliveryZone.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("Delivery option");
  if (existing.kind !== "LAGOS_AXIS") {
    throw ApiError.badRequest(`${existing.name} can't be deleted. Edit it, or untick Active to stop offering it.`, "ZONE_REQUIRED");
  }
  await prisma.deliveryZone.delete({ where: { id } });
}
