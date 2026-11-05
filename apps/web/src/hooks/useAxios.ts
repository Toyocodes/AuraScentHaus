import axios from "axios";

/**
 * One axios instance for the whole app (browser only: it's used by the client-side hooks).
 *
 * baseURL is "/api": the browser calls the Next.js app, and the rewrite in next.config.ts
 * forwards it to the Express API. That keeps the httpOnly session cookie first-party.
 *
 * No default Content-Type: axios sets `application/json` for plain objects by itself, and
 * leaves FormData alone so the browser can add the multipart boundary (image uploads).
 */
export const api = axios.create({
  baseURL: "/api",
  // Same-origin requests send cookies anyway. This keeps them working if the API is ever
  // called directly on another subdomain (see COOKIE_DOMAIN in apps/api/.env.example).
  withCredentials: true,
  timeout: 20_000,
});

/** Use inside hooks: `const axios = useAxios();` */
export function useAxios() {
  return api;
}
