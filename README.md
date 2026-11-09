# AuraScentHaus

A premium fragrance and lifestyle store: perfumes, home fragrance, body care, gifts and accessories. It's an npm-workspaces monorepo:

| Folder            | What                                                                   |
| ----------------- | ---------------------------------------------------------------------- |
| `apps/web`        | Storefront and admin: Next.js 16, TypeScript, Tailwind v4, shadcn/ui   |
| `apps/api`        | REST API: Express 5, Prisma 7, Supabase Postgres + Storage             |
| `packages/shared` | Types, Zod schemas, constants and money helpers used by both apps      |

```
Browser ──/api/*──▶ Next.js (rewrite) ──▶ Express API ──▶ Prisma ──▶ Supabase Postgres
                                              ├──▶ Supabase Storage (images)
                                              ├──▶ Resend (login codes, receipts)
Paystack ──webhook──────────────────────────▶ └──▶ Paystack API (payments)
```

## Features

- **Passwordless login.** The customer enters an email, gets a 6-digit code (sent by Resend) and is signed in. The first login creates the account, so there's no separate sign-up and no Google login. Codes are stored as an HMAC, expire after 10 minutes, allow 5 attempts, and work once. Sending is rate-limited per email and per IP.
- **Cookie sessions.** A random token is kept in an **httpOnly, SameSite=Lax, Secure (in prod)** cookie. The database stores only its SHA-256 hash, so sessions can be revoked ("Sign out on all devices"). Expiry is sliding: 30 days, renewed while the customer is active.
- **Cross-device cart.** For signed-in users the cart lives in Postgres, so it's the same on every device and refreshes when the tab regains focus. Guests get a localStorage cart that's merged into the account cart on login.
- **RBAC** with roles `CUSTOMER`, `ADMIN` and `SUPER_ADMIN`. What each role may do is defined once, in `ROLE_PERMISSIONS` (`packages/shared/src/constants/permissions.ts`). The API checks it on every admin route with `requirePermission("products:delete")` and so on, and that's the real security boundary. The web app reads the same map (`usePermission()`, `<Can>`) only to hide UI. `ADMIN` runs the shop, and only `SUPER_ADMIN` can see the team and change roles.
- **Paystack checkout.** Checkout copies the cart into a `PENDING` order, then Paystack hosts the payment page. A webhook checks the signature (HMAC-SHA512) and confirms the transaction with Paystack, then marks the order `PAID`, reduces stock, clears those items from the cart and emails a receipt. This step is idempotent, and `/checkout/callback` also runs it so the result shows up immediately.
- **In-store sales.** Admins record sales for customers who shop in person (`/admin/orders/new`, `POST /api/admin/orders`). The order records the payment method (cash, card or transfer) and whether it was collected or will be delivered. The buyer can be a walk-in, an existing customer, or a new customer created on the spot. **Attended by** is the signed-in admin's first name. The API takes it from the session, never from the request, so it can't be edited or faked, and it stays the same when the order is edited. Stock is taken when the sale is saved, and it goes back if the items change or the order is cancelled.
- **Editing orders.** In-store orders can change their items, customer, payment method, delivery and note, and can be marked paid. Online orders were paid on Paystack, so only their note and delivery address can change.
- **Customers added by hand** (`POST /api/admin/customers`). They can sign in later with that email and see their in-store orders.
- **Dashboard date ranges**: today, yesterday, last 7/30 days, this month, last month, last 3/6/12 months, this year and all time (`GET /api/admin/stats?range=…`). The dashboard shows revenue against the previous period, a revenue chart, sales by channel and payment method, best sellers and new customers. Days follow Lagos time. The range rules live in `packages/shared/src/utils/date-range.ts`.
- **Money is stored as integer kobo everywhere** (₦1 = 100 kobo). Use `formatNaira()` from `@aurascenthaus/shared` for display.

## Getting started

### 1. Prerequisites

- Node 20.19+ (22 LTS recommended) and npm 10+
- A [Supabase](https://supabase.com) project
- A [Paystack](https://paystack.com) account (test keys are fine)
- A [Resend](https://resend.com) API key. This is optional in development, where emails are printed to the API console instead.

### 2. Install

```bash
npm install          # installs all workspaces, builds packages/shared, generates the Prisma client
```

### 3. Environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

In `apps/api/.env`, fill in at least `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` and `SEED_SUPER_ADMIN_EMAIL`. Then add `PAYSTACK_SECRET_KEY`, `SUPABASE_*` and `RESEND_API_KEY` when you need those features.

**Supabase setup:**

- **Database:** go to Dashboard → **Connect** → ORMs → Prisma and copy the two connection strings. The pooled one (port 6543) is `DATABASE_URL` and the direct one (port 5432) is `DIRECT_URL`.
- **Storage:** create a **public** bucket called `product-images`, then copy `SUPABASE_URL` and the `service_role` key from Project Settings → API. The service-role key stays on the API server only.

### 4. Database

```bash
npm run db:migrate   # creates tables (prompts for a migration name, e.g. "init")
npm run db:seed      # sample products + your SUPER_ADMIN user (the migrations create the categories)
```

### 5. Run

```bash
npm run dev          # shared (watch) + web on :3000 + api on :4000
```

Open http://localhost:3000 and sign in with `SEED_SUPER_ADMIN_EMAIL`. If `RESEND_API_KEY` is empty, the login code is printed in the API terminal. Then go to `/admin`.

## Testing the API on its own (Postman)

```bash
npm run dev:api
```

Import `apps/api/postman/AuraScentHaus.postman_collection.json` and `local.postman_environment.json`. Then:

1. Set `email` in the environment and run **Auth → Request code**.
2. Copy the code into `otpCode` and run **Auth → Verify code**. Postman stores the session cookie for later requests.

With the Postman CLI:

```bash
postman collection run apps/api/postman/AuraScentHaus.postman_collection.json \
  -e apps/api/postman/local.postman_environment.json -i "Health"
```

## Paystack webhooks

Set the webhook URL in Paystack Dashboard → Settings → API Keys & Webhooks:

```
https://<your-api-domain>/api/payments/webhook
```

Paystack can't reach `localhost` during local development. Payments still complete, because `/checkout/callback` asks the API to confirm the transaction with Paystack. To test the webhook itself locally, expose port 4000 with a tunnel such as ngrok or cloudflared.

Paystack test card: `4084 0840 8408 4081`, any future expiry date, CVV `408`, PIN `0000`, OTP `123456`.

## Deploying

| App        | Host              | Settings                                                                                                                                         |
| ---------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/web` | Vercel            | Root directory `apps/web`. Env: `API_URL=https://<api-domain>`, `SESSION_COOKIE_NAME`                                                            |
| `apps/api` | Render or Railway | Root: repo root. Build: `npm ci && npm run build -w packages/shared && npm run build -w apps/api && npm run db:deploy -w apps/api`. Start: `npm run start -w apps/api`. Env: everything in `.env.example` with `NODE_ENV=production`, `WEB_URL=https://<web-domain>`, `TRUST_PROXY=2` |

> **`API_URL` must be set when the web app is _built_**, not just at runtime: Next.js bakes rewrite destinations into the build. On Vercel, add it as an environment variable and redeploy.

The browser only ever talks to the web domain, and `/api/*` is rewritten to the API. The session cookie is therefore first-party, and you **don't** need a shared custom domain for login to work.

## Scripts (run from the repo root)

| Script                | Does                                                    |
| --------------------- | ------------------------------------------------------- |
| `npm run dev`         | Run everything in watch mode                            |
| `npm run dev:web`     | Run only the web app                                    |
| `npm run dev:api`     | Run only the API                                        |
| `npm run build`       | Build shared, then the API, then the web app            |
| `npm run typecheck`   | Typecheck all workspaces                                |
| `npm run db:migrate`  | Create and apply a migration (dev)                      |
| `npm run db:seed`     | Seed sample data and the super admin                    |
| `npm run db:studio`   | Open Prisma Studio                                      |

## Frontend structure (`apps/web/src`)

> **Status:** the UI isn't connected to the API yet. Pages render their components with empty data, and every endpoint already has a TanStack Query hook ready to wire in. Each page has a `Not connected yet:` comment naming the hooks it needs.

```
app/                      Routes only. Pages compose components and contain no data logic.
components/
  ui/                     shadcn/ui primitives (incl. form.tsx = react-hook-form FormProvider)
  form/                   FormInput, FormSelect, FormTextarea, FormCheckbox, SubmitButton
  common/                 EmptyState, PageHeader, Price, Pagination, ConfirmDialog, SearchForm…
  layout/                 navbar/, footer/, side-nav/, site-shell/
  auth/  product/  cart/  checkout/  address/  order/  account/
  admin/                  layout/, dashboard/, products/, categories/, scent-families/, orders/, customers/, users/
  providers/              QueryProvider (TanStack Query), guest-cart hydration, toaster
hooks/
  useAxios.ts             The axios instance (baseURL "/api", withCredentials)
  helper/routes.ts        Every endpoint: routes.ADMIN_CATEGORIES, routes.ADD_TO_CART, …
  helper/query-keys.ts    Query keys per module (used for cache invalidation)
  helper/errors.ts        getErrorMessage, applyFieldErrors (API 422 → form fields)
  <module>/types.ts       Request/response types for that module
  <module>/use<Thing>.ts  One hook per endpoint
  auth/ products/ categories/ scent-families/ cart/ profile/ addresses/ orders/ payments/
  admin/                  stats/, products/, categories/, scent-families/, orders/, customers/, users/
store/guest-cart.ts       Zustand cart for signed-out visitors (localStorage)
```

**Forms** use react-hook-form + zod + the shadcn `<Form>`. Each form keeps its zod schema in a `*-schema.ts` file next to it, reusing the shared API schemas where it can, so the browser and the API validate the same way. Forms take `onSubmit`, `isPending` and `defaultValues` props, so you connect them by passing a mutation:

```tsx
const createCategory = useCreateCategory();
<CategoryForm isPending={createCategory.isPending} onSubmit={(input) => createCategory.mutateAsync(input)} />
```

**Adding an endpoint:** add it to `hooks/helper/routes.ts`, add its types to that module's `types.ts`, and write a `useX.ts` hook that calls `useAxios()` with `routes.X`.

## Where to change things

- **Shipping fees:** `apps/api/src/modules/orders/shipping.ts`
- **Order status rules:** `ORDER_STATUS_TRANSITIONS` in `packages/shared/src/constants/order-status.ts`
- **Email templates:** `apps/api/src/emails/`
- **Theme and colours:** `apps/web/src/app/globals.css` (shadcn tokens). Fonts are set in `apps/web/src/app/layout.tsx`.
- **Add shadcn components:** `cd apps/web && npx shadcn@latest add <component>`
# AuraScentHaus

## The catalogue

- **Categories are what a product is.** They nest up to 3 levels (Personal Fragrance → Perfumes) and are managed in admin. The store's menu, footer and filters all read them from the API.
- **Empty categories stay hidden.** Shoppers only see active categories with products on sale, so they appear by themselves as you stock them. A deactivated category hides its subcategories and products too.
- **Scent families are what it smells like.** A product has one category and any number of scent families, and shoppers can filter by scent across every category.
- **The fragrance pyramid is a setting on the category.** `hasFragrancePyramid` is on for Perfumes and Perfume Oils, and subcategories inherit it. Switch it on or off in Admin → Categories. Notes sent for any other category are refused. If a product moves away its notes stay stored but hidden from shoppers, and come back if it moves back.
- **Sizes have a unit.** `sizeUnit` is `ML`, `G` or `PIECE`. The amount stays in the field named `sizeMl` for compatibility, so a 200 g candle has `sizeMl: 200`. To show a size, always use `sizeLabel` ("200 g", "Set of 3").
- **Deleting is safe.** A category with products can only be deleted by choosing where to move them. Categories with subcategories, and the ones that switch the pyramid on, are protected. Scent families in use can't be deleted, but can be deactivated.

Filters go in the URL: `/shop/perfumes?scent=oud,woody&min=20000&max=80000&stock=1&gender=WOMEN&sort=price_asc`. Old `/products` and `/collections/*` links redirect.

Customers are emailed when their order is confirmed, shipped, delivered or cancelled (a cancelled order only if it was paid).

The shop's contact details and policy numbers (return window, delivery times) are in `apps/web/src/lib/store-info.ts`, used by the About, Contact, Shipping, Returns, Privacy and Terms pages.

Run the tests with `npm test`.
