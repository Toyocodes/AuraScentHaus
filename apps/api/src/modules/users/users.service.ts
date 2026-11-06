import type {
  AddressInput,
  AdminCreateCustomerInput,
  AdminUpdateCustomerInput,
  PaginationInput,
  UpdateAddressInput,
  UpdateProfileInput,
} from "@aurascenthaus/shared";
import { prisma } from "../../config/prisma.js";
import type { Prisma, Role } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { paginated, toSkipTake } from "../../utils/pagination.js";
import { toAddressDTO, toUserDTO } from "./users.mapper.js";

// ─── Profile ─────────────────────────────────────────────────

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.update({ where: { id: userId }, data: input });
  return toUserDTO(user);
}

// ─── Addresses ───────────────────────────────────────────────

export async function listAddresses(userId: string) {
  const rows = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toAddressDTO);
}

export async function createAddress(userId: string, input: AddressInput) {
  const address = await prisma.$transaction(async (tx) => {
    const count = await tx.address.count({ where: { userId } });
    const isDefault = input.isDefault ?? count === 0; // first address becomes default
    if (isDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.address.create({ data: { ...input, isDefault, userId } });
  });
  return toAddressDTO(address);
}

export async function updateAddress(userId: string, id: string, input: UpdateAddressInput) {
  const address = await prisma.$transaction(async (tx) => {
    const existing = await tx.address.findFirst({ where: { id, userId } });
    if (!existing) throw ApiError.notFound("Address");
    if (input.isDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.address.update({ where: { id }, data: input });
  });
  return toAddressDTO(address);
}

export async function deleteAddress(userId: string, id: string) {
  const { count } = await prisma.address.deleteMany({ where: { id, userId } });
  if (count === 0) throw ApiError.notFound("Address");
}

// ─── Admin: customers & roles ────────────────────────────────

export async function listUsers(query: PaginationInput & { role?: Role; search?: string }) {
  const where: Prisma.UserWhereInput = {
    ...(query.role && { role: query.role }),
    ...(query.search && {
      OR: [
        { email: { contains: query.search, mode: "insensitive" } },
        { name: { contains: query.search, mode: "insensitive" } },
        { phone: { contains: query.search } },
      ],
    }),
  };

  const [rows, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...toSkipTake(query),
      include: { _count: { select: { orders: { where: { paidAt: { not: null } } } } } },
    }),
    prisma.user.count({ where }),
  ]);

  return paginated(
    rows.map((u) => ({ ...toUserDTO(u), paidOrders: u._count.orders })),
    total,
    query,
  );
}

export async function updateUserRole(actorId: string, targetId: string, role: Role) {
  if (actorId === targetId) {
    throw ApiError.badRequest("You can't change your own role", "SELF_ROLE_CHANGE");
  }
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) throw ApiError.notFound("User");

  if (target.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
    const superAdmins = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
    if (superAdmins <= 1) throw ApiError.badRequest("There must be at least one super admin");
  }

  const user = await prisma.user.update({ where: { id: targetId }, data: { role } });
  // Force re-login so the new permissions apply everywhere immediately.
  await prisma.session.deleteMany({ where: { userId: targetId } });
  return toUserDTO(user);
}

/** An admin adds a customer (e.g. someone who shopped in person). They can sign in later with this email. */
export async function createCustomer(input: AdminCreateCustomerInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict("Someone with this email already has an account", "EMAIL_TAKEN", { userId: existing.id });
  }
  const user = await prisma.user.create({
    data: { email: input.email, name: input.name ?? null, phone: input.phone ?? null, role: "CUSTOMER" },
  });
  return { ...toUserDTO(user), paidOrders: 0 };
}

/** Admins may only edit customers here. Team members are managed on the roles page. */
export async function updateCustomer(id: string, input: AdminUpdateCustomerInput) {
  const target = await prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { orders: { where: { paidAt: { not: null } } } } } },
  });
  if (!target || target.role !== "CUSTOMER") throw ApiError.notFound("Customer");

  if (input.email && input.email !== target.email) {
    const taken = await prisma.user.findUnique({ where: { email: input.email } });
    if (taken) throw ApiError.conflict("Someone with this email already has an account", "EMAIL_TAKEN");
  }

  const user = await prisma.user.update({ where: { id }, data: input });
  return { ...toUserDTO(user), paidOrders: target._count.orders };
}
