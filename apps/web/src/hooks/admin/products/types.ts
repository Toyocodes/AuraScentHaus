import type {
  Paginated,
  ProductDetailDTO,
  ProductImageDTO,
  ProductInput,
  ProductListItemDTO,
  UpdateProductInput,
  UpdateVariantInput,
  VariantDTO,
  VariantInput,
} from "@aurascenthaus/shared";
import type { DataResponse } from "../../helper/types";
import type { ProductListParams } from "../../products/types";

export type {
  ProductDetailDTO,
  ProductImageDTO,
  ProductInput,
  ProductListItemDTO,
  UpdateProductInput,
  UpdateVariantInput,
  VariantDTO,
  VariantInput,
};

/** GET /admin/products: same filters as the storefront, but hidden products are included. */
export type AdminProductListParams = ProductListParams;

export interface UpdateProductVariables {
  productId: string;
  input: UpdateProductInput;
}

export interface AddVariantVariables {
  productId: string;
  input: VariantInput;
}

export interface UpdateVariantVariables {
  productId: string;
  variantId: string;
  input: UpdateVariantInput;
}

export interface DeleteVariantVariables {
  productId: string;
  variantId: string;
}

export interface UploadProductImagesVariables {
  productId: string;
  files: File[];
  alt?: string;
}

export interface DeleteProductImageVariables {
  productId: string;
  imageId: string;
}

export type AdminProductListResponse = Paginated<ProductListItemDTO>;
export type AdminProductResponse = DataResponse<ProductDetailDTO>;
export type VariantResponse = DataResponse<VariantDTO>;
export type ProductImagesResponse = DataResponse<ProductImageDTO[]>;
