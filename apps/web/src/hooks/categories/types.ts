import type { CategoryDetailDTO, CategoryDTO, CategoryTreeDTO, CategoryWithCountDTO } from "@aurascenthaus/shared";
import type { DataResponse } from "../helper/types";

export type { CategoryDTO, CategoryDetailDTO, CategoryTreeDTO, CategoryWithCountDTO };

export type CategoryListResponse = DataResponse<CategoryWithCountDTO[]>;
export type CategoryTreeResponse = DataResponse<CategoryTreeDTO[]>;
export type CategoryDetailResponse = DataResponse<CategoryDetailDTO>;
