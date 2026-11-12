/**
 * Every API endpoint the web app calls, in one place.
 * Paths are relative to the axios baseURL ("/api"), so `routes.ADMIN_CATEGORIES` is `/api/admin/categories`.
 * Hooks import from here instead of hard-coding strings.
 */
const id = (value: string) => encodeURIComponent(value);

export const routes = {
  // ── Auth ──
  REQUEST_CODE: "/auth/request-code",
  VERIFY_CODE: "/auth/verify-code",
  ME: "/auth/me",
  LOGOUT: "/auth/logout",
  LOGOUT_ALL: "/auth/logout-all",

  // ── Catalog (public) ──
  FETCH_ALL_PRODUCTS: "/products",
  FETCH_SINGLE_PRODUCT: (slug: string) => `/products/${id(slug)}`,
  FETCH_CATEGORIES: "/categories",
  FETCH_SINGLE_CATEGORY: (slug: string) => `/categories/${id(slug)}`,
  FETCH_SCENT_FAMILIES: "/scent-families",
  FETCH_DELIVERY_ZONES: "/delivery-zones",

  // ── Cart (signed in) ──
  GET_CART: "/cart",
  CLEAR_CART: "/cart",
  MERGE_CART: "/cart/merge",
  ADD_TO_CART: "/cart/items",
  UPDATE_CART_ITEM: (variantId: string) => `/cart/items/${id(variantId)}`,
  DELETE_CART_ITEM: (variantId: string) => `/cart/items/${id(variantId)}`,

  // ── Profile & addresses (signed in) ──
  GET_PROFILE: "/users/me",
  UPDATE_PROFILE: "/users/me",
  FETCH_ADDRESSES: "/users/me/addresses",
  CREATE_ADDRESS: "/users/me/addresses",
  UPDATE_ADDRESS: (addressId: string) => `/users/me/addresses/${id(addressId)}`,
  DELETE_ADDRESS: (addressId: string) => `/users/me/addresses/${id(addressId)}`,

  // ── Orders (signed in) ──
  FETCH_USER_ORDERS: "/orders",
  FETCH_USER_ORDER: (orderId: string) => `/orders/${id(orderId)}`,

  // ── Notifications (signed in: the bell) ──
  FETCH_NOTIFICATIONS: "/notifications",
  READ_NOTIFICATION: (notificationId: string) => `/notifications/${id(notificationId)}/read`,
  READ_ALL_NOTIFICATIONS: "/notifications/read-all",

  // ── Payments (Paystack) ──
  INITIALIZE_PAYMENT: "/payments/checkout",
  VERIFY_PAYMENT: (reference: string) => `/payments/verify/${id(reference)}`,

  // ── Admin: dashboard ──
  ADMIN_STATS: "/admin/stats",

  // ── Admin: products ──
  ADMIN_PRODUCTS: "/admin/products",
  /** Every size with price and stock, for the in-store order form. */
  ADMIN_SELLABLE_VARIANTS: "/admin/products/sellable",
  ADMIN_PRODUCT: (productId: string) => `/admin/products/${id(productId)}`,
  ADMIN_PRODUCT_VARIANTS: (productId: string) => `/admin/products/${id(productId)}/variants`,
  ADMIN_PRODUCT_VARIANT: (productId: string, variantId: string) =>
    `/admin/products/${id(productId)}/variants/${id(variantId)}`,
  ADMIN_PRODUCT_IMAGES: (productId: string) => `/admin/products/${id(productId)}/images`,
  ADMIN_PRODUCT_IMAGE: (productId: string, imageId: string) =>
    `/admin/products/${id(productId)}/images/${id(imageId)}`,

  // ── Admin: categories ──
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_CATEGORY: (categoryId: string) => `/admin/categories/${id(categoryId)}`,
  ADMIN_CATEGORY_IMAGE: (categoryId: string) => `/admin/categories/${id(categoryId)}/image`,

  // ── Admin: scent families ──
  ADMIN_SCENT_FAMILIES: "/admin/scent-families",
  ADMIN_SCENT_FAMILY: (familyId: string) => `/admin/scent-families/${id(familyId)}`,
  ADMIN_SCENT_FAMILY_IMAGE: (familyId: string) => `/admin/scent-families/${id(familyId)}/image`,

  // ── Admin: delivery options ──
  ADMIN_DELIVERY_ZONES: "/admin/delivery-zones",
  ADMIN_DELIVERY_ZONE: (zoneId: string) => `/admin/delivery-zones/${id(zoneId)}`,

  // ── Admin: orders ── (POST ADMIN_ORDERS = new in-store sale, PATCH ADMIN_ORDER = edit)
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_ORDER: (orderId: string) => `/admin/orders/${id(orderId)}`,
  ADMIN_ORDER_STATUS: (orderId: string) => `/admin/orders/${id(orderId)}/status`,

  // ── Admin: customers ── (POST ADMIN_CUSTOMERS = add, PATCH ADMIN_CUSTOMER = edit)
  ADMIN_CUSTOMERS: "/admin/customers",
  ADMIN_CUSTOMER: (customerId: string) => `/admin/customers/${id(customerId)}`,

  // ── Super admin: team & roles ──
  ADMIN_USERS: "/admin/users",
  ADMIN_USER_ROLE: (userId: string) => `/admin/users/${id(userId)}/role`,
} as const;
