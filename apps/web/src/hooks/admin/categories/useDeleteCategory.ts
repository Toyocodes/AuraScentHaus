"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { DeleteCategoryVariables } from "./types";

/** Needs "categories:delete". The API refuses if products would be left without a category. */
export function useDeleteCategory() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, reassignTo }: DeleteCategoryVariables) => {
      await axios.delete(routes.ADMIN_CATEGORY(categoryId), { params: { reassignTo } });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}
