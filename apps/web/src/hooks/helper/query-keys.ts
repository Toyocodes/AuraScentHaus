/**
 * TanStack Query keys, grouped per module.
 * Mutations invalidate by prefix, e.g. `queryKeys.cart.all` refetches every cart query.
 */
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  products: {
    all: ["products"] as const,
    list: (params: object) => [...queryKeys.products.all, "list", params] as const,
    detail: (slug: string) => [...queryKeys.products.all, "detail", slug] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: () => [...queryKeys.categories.all, "list"] as const,
    tree: () => [...queryKeys.categories.all, "tree"] as const,
    detail: (slug: string) => [...queryKeys.categories.all, "detail", slug] as const,
  },
  scentFamilies: {
    all: ["scent-families"] as const,
  },
  deliveryZones: {
    all: ["delivery-zones"] as const,
  },
  cart: {
    all: ["cart"] as const,
  },
  profile: {
    all: ["profile"] as const,
  },
  addresses: {
    all: ["addresses"] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (params: object) => [...queryKeys.orders.all, "list", params] as const,
    detail: (orderId: string) => [...queryKeys.orders.all, "detail", orderId] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
  payments: {
    verify: (reference: string) => ["payments", "verify", reference] as const,
  },
  admin: {
    stats: {
      all: ["admin", "stats"] as const,
      range: (range: string) => ["admin", "stats", range] as const,
    },
    sellableVariants: () => ["admin", "sellable-variants"] as const,
    products: {
      all: ["admin", "products"] as const,
      list: (params: object) => [...queryKeys.admin.products.all, "list", params] as const,
      detail: (productId: string) => [...queryKeys.admin.products.all, "detail", productId] as const,
    },
    categories: {
      all: ["admin", "categories"] as const,
    },
    scentFamilies: {
      all: ["admin", "scent-families"] as const,
    },
    deliveryZones: {
      all: ["admin", "delivery-zones"] as const,
    },
    orders: {
      all: ["admin", "orders"] as const,
      list: (params: object) => [...queryKeys.admin.orders.all, "list", params] as const,
      detail: (orderId: string) => [...queryKeys.admin.orders.all, "detail", orderId] as const,
    },
    customers: {
      all: ["admin", "customers"] as const,
      list: (params: object) => [...queryKeys.admin.customers.all, "list", params] as const,
    },
    users: {
      all: ["admin", "users"] as const,
      list: (params: object) => [...queryKeys.admin.users.all, "list", params] as const,
    },
  },
} as const;
