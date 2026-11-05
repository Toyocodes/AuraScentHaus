"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { CategoryResponse, UpdateCategoryVariables } from "./types";

export function useUpdateCategory() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, input }: UpdateCategoryVariables) => {
      const { data } = await axios.patch<CategoryResponse>(routes.ADMIN_CATEGORY(categoryId), input);
      return data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}
