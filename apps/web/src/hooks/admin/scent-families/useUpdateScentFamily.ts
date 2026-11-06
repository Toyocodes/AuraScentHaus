"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { ScentFamilyResponse, UpdateScentFamilyVariables } from "./types";

export function useUpdateScentFamily() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ familyId, input }: UpdateScentFamilyVariables) => {
      const { data } = await axios.patch<ScentFamilyResponse>(routes.ADMIN_SCENT_FAMILY(familyId), input);
      return data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.scentFamilies.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.scentFamilies.all });
    },
  });
}
