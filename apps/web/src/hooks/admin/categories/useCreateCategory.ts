"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { CategoryInput, CategoryResponse } from "./types";

export function useCreateCategory() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CategoryInput) => {
      const { data } = await axios.post<CategoryResponse>(routes.ADMIN_CATEGORIES, input);
      return data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}
