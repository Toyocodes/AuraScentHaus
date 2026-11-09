"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { ScentFamilyResponse, UploadScentFamilyImageVariables } from "./types";

/** Needs "categories:write". Uploads through the API to Supabase Storage. */
export function useUploadScentFamilyImage() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ familyId, file }: UploadScentFamilyImageVariables) => {
      const body = new FormData();
      body.append("image", file);
      const { data } = await axios.post<ScentFamilyResponse>(routes.ADMIN_SCENT_FAMILY_IMAGE(familyId), body);
      return data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.scentFamilies.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.scentFamilies.all });
    },
  });
}
