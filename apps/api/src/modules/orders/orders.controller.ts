import type { Request, Response } from "express";
import {
  adminCreateOrderSchema,
  adminUpdateOrderSchema,
  orderQuerySchema,
  paginationSchema,
  updateOrderStatusSchema,
} from "@aurascenthaus/shared";
import { parseBody, parseQuery } from "../../middlewares/validate.js";
import * as inStore from "./in-store.service.js";
import * as orders from "./orders.service.js";

type IdParams = { id: string };

/** GET /api/orders */
export async function listMine(req: Request, res: Response) {
  res.json(await orders.listMyOrders(req.user!.id, parseQuery(paginationSchema, req)));
}

/** GET /api/orders/:id */
export async function getMine(req: Request<IdParams>, res: Response) {
  res.json({ data: await orders.getMyOrder(req.user!.id, req.params.id) });
}

/** GET /api/admin/orders?status=&search=&page= */
export async function adminList(req: Request, res: Response) {
  res.json(await orders.adminListOrders(parseQuery(orderQuerySchema, req)));
}

/** GET /api/admin/orders/:id */
export async function adminGet(req: Request<IdParams>, res: Response) {
  res.json({ data: await orders.adminGetOrder(req.params.id) });
}

/** PATCH /api/admin/orders/:id/status  { status } */
export async function adminUpdateStatus(req: Request<IdParams>, res: Response) {
  const { status } = parseBody(updateOrderStatusSchema, req);
  res.json({ data: await orders.adminUpdateOrderStatus(req.params.id, status) });
}

/** POST /api/admin/orders  (in-store sale; the attendant is the signed-in admin) */
export async function adminCreate(req: Request, res: Response) {
  const input = parseBody(adminCreateOrderSchema, req);
  res.status(201).json({ data: await inStore.createInStoreOrder(req.user!, input) });
}

/** PATCH /api/admin/orders/:id */
export async function adminUpdate(req: Request<IdParams>, res: Response) {
  const input = parseBody(adminUpdateOrderSchema, req);
  res.json({ data: await inStore.updateOrder(req.params.id, input) });
}
