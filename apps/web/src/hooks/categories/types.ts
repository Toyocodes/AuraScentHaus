import type { CategoryDTO } from "@aurascenthaus/shared";
import type { DataResponse } from "../helper/types";

export type { CategoryDTO };

export type CategoryListResponse = DataResponse<CategoryDTO[]>;
export type CategoryDetailResponse = DataResponse<CategoryDTO>;
