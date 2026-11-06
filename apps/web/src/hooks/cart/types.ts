import type {
  AddCartItemInput,
  CartDTO,
  CartItemDTO,
  MergeCartInput,
  UpdateCartItemInput,
  ProductDetailDTO,
  VariantDTO,
} from "@aurascenthaus/shared";
import type { DataResponse } from "../helper/types";

export type { CartDTO, CartItemDTO, AddCartItemInput, MergeCartInput };

/** PATCH /cart/items/:variantId (quantity 0 removes the item) */
export interface UpdateCartItemVariables extends UpdateCartItemInput {
  variantId: string;
}

/** Every cart endpoint returns the whole updated cart. */
export type CartResponse = DataResponse<CartDTO>;

/** useBag().add: the product and size picked on the product page. */
export interface BagAddInput {
  product: Pick<ProductDetailDTO, "id" | "name" | "slug" | "images">;
  variant: Pick<VariantDTO, "id" | "sizeMl" | "sizeUnit" | "price" | "stock">;
  quantity?: number;
}
