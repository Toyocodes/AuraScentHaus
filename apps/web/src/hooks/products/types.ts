import type { Gender, Paginated, ProductDetailDTO, ProductListItemDTO, ProductSort } from "@aurascenthaus/shared";
import type { DataResponse, PaginationParams } from "../helper/types";

export type { ProductListItemDTO, ProductDetailDTO, ProductSort, Gender };

/** GET /products query string */
export interface ProductListParams extends PaginationParams {
  search?: string;
  category?: string;
  gender?: Gender;
  featured?: boolean;
  sort?: ProductSort;
}

export type ProductListResponse = Paginated<ProductListItemDTO>;
export type ProductDetailResponse = DataResponse<ProductDetailDTO>;
