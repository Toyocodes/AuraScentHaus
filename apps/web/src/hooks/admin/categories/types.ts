import type { CategoryDTO, CategoryInput, UpdateCategoryInput } from "@aurascenthaus/shared";
import type { DataResponse } from "../../helper/types";

export type { CategoryDTO, CategoryInput, UpdateCategoryInput };

/** The admin list also says how many products each category has. */
export interface AdminCategoryDTO extends CategoryDTO {
  productCount: number;
}

export interface UpdateCategoryVariables {
  categoryId: string;
  input: UpdateCategoryInput;
}

export type AdminCategoryListResponse = DataResponse<AdminCategoryDTO[]>;
export type CategoryResponse = DataResponse<CategoryDTO>;
