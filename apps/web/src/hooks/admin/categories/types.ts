import type { CategoryDTO, CategoryInput, CategoryWithCountDTO, UpdateCategoryInput } from "@aurascenthaus/shared";
import type { DataResponse } from "../../helper/types";

export type { CategoryDTO, CategoryInput, UpdateCategoryInput };

/** The admin list includes empty and inactive categories, with product counts. */
export type AdminCategoryDTO = CategoryWithCountDTO;

export interface UpdateCategoryVariables {
  categoryId: string;
  input: UpdateCategoryInput;
}

export interface DeleteCategoryVariables {
  categoryId: string;
  /** Where to move its products. Required if it has any. */
  reassignTo?: string;
}

export interface UploadCategoryImageVariables {
  categoryId: string;
  file: File;
}

export type AdminCategoryListResponse = DataResponse<AdminCategoryDTO[]>;
export type CategoryResponse = DataResponse<CategoryDTO>;
