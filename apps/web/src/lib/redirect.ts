/**
 * Only allow redirects to paths on this site ("/account"), never to another domain
 * ("https://evil.com" or "//evil.com"). Used for the `?next=` parameter on /login.
 */
export function safeNextPath(value: string | null | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}

/** "/login?next=/account/orders" for the page the visitor is on now. */
export function loginUrlFor(path: string): string {
  return `/login?next=${encodeURIComponent(path)}`;
}
