import type { ScentFamilyDTO, ScentFamilyInput, UpdateScentFamilyInput } from "@aurascenthaus/shared";
import type { DataResponse } from "../../helper/types";

export type { ScentFamilyDTO, ScentFamilyInput, UpdateScentFamilyInput };

export interface UpdateScentFamilyVariables {
  familyId: string;
  input: UpdateScentFamilyInput;
}

export type AdminScentFamilyListResponse = DataResponse<ScentFamilyDTO[]>;
export type ScentFamilyResponse = DataResponse<ScentFamilyDTO>;
