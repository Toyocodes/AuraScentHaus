import type { Request, Response } from "express";
import { deliveryZoneSchema, updateDeliveryZoneSchema } from "@aurascenthaus/shared";
import { parseBody } from "../../middlewares/validate.js";
import * as delivery from "./delivery.service.js";

/** GET /api/delivery-zones */
export async function list(_req: Request, res: Response) {
  res.json({ data: await delivery.listActiveDeliveryZones() });
}

/** GET /api/admin/delivery-zones (includes switched-off options) */
export async function adminList(_req: Request, res: Response) {
  res.json({ data: await delivery.listAllDeliveryZones() });
}

export async function create(req: Request, res: Response) {
  const input = parseBody(deliveryZoneSchema, req);
  res.status(201).json({ data: await delivery.createDeliveryZone(input) });
}

export async function update(req: Request<{ id: string }>, res: Response) {
  const input = parseBody(updateDeliveryZoneSchema, req);
  res.json({ data: await delivery.updateDeliveryZone(req.params.id, input) });
}

export async function remove(req: Request<{ id: string }>, res: Response) {
  await delivery.deleteDeliveryZone(req.params.id);
  res.status(204).end();
}
