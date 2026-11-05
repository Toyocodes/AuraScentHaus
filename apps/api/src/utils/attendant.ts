/**
 * The name shown as "Attended by" on in-store orders: the signed-in admin's first name.
 * Falls back to the part of their email before the @ when they have no name set.
 */
export function attendantFirstName(user: { name: string | null; email: string }): string {
  const first = user.name?.trim().split(/\s+/)[0];
  if (first) return first;
  const local = user.email.split("@")[0] ?? user.email;
  return local.charAt(0).toUpperCase() + local.slice(1);
}
