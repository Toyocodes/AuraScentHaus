import type { Gender, Paginated, ProductDetailDTO, ProductListItemDTO, ProductSort } from "@aurascenthaus/shared";
import type { DataResponse, PaginationParams } from "../helper/types";

export type { ProductListItemDTO, ProductDetailDTO, ProductSort, Gender };

/** GET /products query string */
export interface ProductListParams extends PaginationParams {
  search?: string;
  /** Category slug. A main category includes its subcategories. */
  category?: string;
  /** Scent family slugs, comma separated. */
  scent?: string;
  gender?: Gender;
  featured?: boolean;
  /** In kobo. */
  minPrice?: number;
  /** In kobo. */
  maxPrice?: number;
  inStock?: boolean;
  sort?: ProductSort;
}

export type ProductListResponse = Paginated<ProductListItemDTO>;
export type ProductDetailResponse = DataResponse<ProductDetailDTO>;
