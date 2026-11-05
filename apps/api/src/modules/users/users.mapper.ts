import type { AddressDTO, UserDTO } from "@aurascenthaus/shared";
import type { Address, User } from "../../generated/prisma/client.js";

export function toUserDTO(u: Pick<User, "id" | "email" | "name" | "phone" | "role" | "createdAt">): UserDTO {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  };
}

export function toAddressDTO(a: Address): AddressDTO {
  return {
    id: a.id,
    fullName: a.fullName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    country: a.country,
    postalCode: a.postalCode,
    isDefault: a.isDefault,
  };
}
