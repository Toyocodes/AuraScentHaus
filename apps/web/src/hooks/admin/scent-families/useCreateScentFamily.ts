"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { ScentFamilyInput, ScentFamilyResponse } from "./types";

export function useCreateScentFamily() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ScentFamilyInput) => {
      const { data } = await axios.post<ScentFamilyResponse>(routes.ADMIN_SCENT_FAMILIES, input);
      return data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.scentFamilies.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.scentFamilies.all });
    },
  });
}
