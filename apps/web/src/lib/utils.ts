export { cn } from "cn"

/** Only allow same-site relative redirects (prevents open-redirects via ?next=). */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback
  return next
}

/** First value of a Next.js searchParams entry. */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}
