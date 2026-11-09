import type { Gender, OrderChannel, OrderStatus, PaymentMethod, PaymentStatus, Role, SizeUnit } from "../constants/index.js";
import type { StatsGranularity, StatsRangeKey } from "../utils/date-range.js";

/** Shapes returned by the API (JSON-serialised, so dates are ISO strings). */

export interface ApiErrorBody {
  error: { message: string; code?: string; details?: unknown };
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface UserDTO {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: Role;
  createdAt: string;
}

export interface AddressDTO {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string | null;
  isDefault: boolean;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  /** null = a main category. */
  parentId: string | null;
  position: number;
  isActive: boolean;
  /** Products here may have top, heart and base notes. Inherited from parent categories. */
  hasFragrancePyramid: boolean;
  /** Products here use men / women / unisex. Inherited from parent categories. */
  usesGender: boolean;
  defaultSizeUnit: SizeUnit;
  /** The settings ticked on this category itself, without what it inherits. For the admin form. */
  own: { hasFragrancePyramid: boolean; usesGender: boolean };
}

export type CategoryRef = Pick<CategoryDTO, "id" | "name" | "slug">;

export interface CategoryWithCountDTO extends CategoryDTO {
  /** Products here and in all subcategories. */
  productCount: number;
  /** Products directly in this category: these must be moved before it can be deleted. */
  directProductCount: number;
}

/** GET /categories?tree=true */
export interface CategoryTreeDTO extends CategoryWithCountDTO {
  children: CategoryTreeDTO[];
}

/** GET /categories/:slug */
export interface CategoryDetailDTO extends CategoryDTO {
  parent: CategoryRef | null;
  /** Subcategories that have products to show. */
  children: CategoryRef[];
}

export interface ScentFamilyDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  position: number;
  isActive: boolean;
  productCount: number;
}

export type ScentFamilyRef = Pick<ScentFamilyDTO, "id" | "name" | "slug">;

export interface ProductImageDTO {
  id: string;
  url: string;
  alt: string | null;
  position: number;
}

export interface VariantDTO {
  id: string;
  /** The amount, measured in `sizeUnit`. To show a size, use `sizeLabel`. */
  sizeMl: number;
  sizeUnit: SizeUnit;
  /** "50 ml", "200 g", "Set of 3" */
  sizeLabel: string;
  sku: string;
  price: number; // kobo
  compareAtPrice: number | null; // kobo
  stock: number;
  isActive: boolean;
}

export interface ProductListItemDTO {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  gender: Gender;
  isFeatured: boolean;
  isActive: boolean;
  image: ProductImageDTO | null;
  /** Cheapest active variant price, in kobo. */
  priceFrom: number | null;
  category: CategoryRef | null;
  scentFamilies: ScentFamilyRef[];
}

export interface ProductDetailDTO extends Omit<ProductListItemDTO, "image" | "priceFrom" | "category"> {
  category: (CategoryRef & Pick<CategoryDTO, "hasFragrancePyramid" | "usesGender" | "defaultSizeUnit">) | null;
  description: string;
  /**
   * Fragrance pyramid. Shoppers get empty arrays unless the category has the pyramid.
   * Admins always get what is stored, so notes return if a product is moved back.
   */
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  images: ProductImageDTO[];
  variants: VariantDTO[];
}

export interface CartItemDTO {
  variantId: string;
  quantity: number;
  unitPrice: number; // kobo, current price
  lineTotal: number; // kobo
  sizeMl: number;
  sizeUnit: SizeUnit;
  sizeLabel: string;
  stock: number;
  available: boolean; // false if product/variant was deactivated
  product: { id: string; name: string; slug: string; image: string | null };
}

export interface CartDTO {
  items: CartItemDTO[];
  itemCount: number;
  subtotal: number; // kobo
  updatedAt: string | null;
}

export interface OrderItemDTO {
  id: string;
  /** null if that size was deleted later. */
  variantId: string | null;
  productName: string;
  sizeMl: number;
  sizeUnit: SizeUnit;
  sizeLabel: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  image: string | null;
}

export interface ShippingAddressDTO {
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string | null;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  note: string | null;
  /** null = collected in store (no delivery). */
  shippingAddress: ShippingAddressDTO | null;
  channel: OrderChannel;
  paymentMethod: PaymentMethod;
  /** Who to contact about the order (the customer, or a walk-in buyer). */
  contact: { name: string | null; phone: string | null };
  /** The admin who made an in-store sale. Their first name, saved when the order was created. */
  attendant: { id: string | null; name: string } | null;
  items: OrderItemDTO[];
  payment: {
    reference: string;
    status: PaymentStatus;
    channel: string | null;
    paidAt: string | null;
  } | null;
  /** Admin views only. null = walk-in customer with no account. */
  customer?: Pick<UserDTO, "id" | "email" | "name" | "phone"> | null;
  createdAt: string;
  paidAt: string | null;
}

/** GET /admin/products/sellable: every size, for the in-store order form. */
export interface SellableVariantDTO {
  variantId: string;
  productId: string;
  productName: string;
  sizeMl: number;
  sizeUnit: SizeUnit;
  sizeLabel: string;
  sku: string;
  price: number; // kobo
  stock: number;
  /** false if the size or product is hidden from the website (it can still be sold in store). */
  isActive: boolean;
}

export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  reference: string;
  /** Redirect the browser here to pay on Paystack. */
  authorizationUrl: string;
}

export interface StatsSeriesPoint {
  /** ISO start of the hour / day / month. */
  start: string;
  label: string;
  revenue: number; // kobo
  orders: number;
}

/** GET /admin/stats?range=… Money is in kobo. "Paid" = paid and not cancelled. */
export interface AdminStatsDTO {
  range: { key: StatsRangeKey; label: string; from: string | null; to: string; granularity: StatsGranularity };
  revenue: number;
  /** Paid orders in the range. */
  orders: number;
  averageOrderValue: number;
  itemsSold: number;
  newCustomers: number;
  /** Same-length period just before, for comparison. null for "all time". */
  previous: { revenue: number; orders: number } | null;
  revenueByChannel: Record<OrderChannel, number>;
  revenueByPaymentMethod: Record<PaymentMethod, number>;
  /** Orders placed in the range, by current status. */
  ordersByStatus: Record<OrderStatus, number>;
  series: StatsSeriesPoint[];
  topProducts: Array<{ productName: string; quantity: number; revenue: number }>;
  // Not affected by the range:
  customers: number;
  products: number;
  lowStock: Array<{ variantId: string; productName: string; sizeMl: number; sizeLabel: string; stock: number }>;
  recentOrders: OrderDTO[];
}
