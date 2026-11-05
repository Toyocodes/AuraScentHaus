"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";

/** Needs "categories:delete". Its products stay, just without a category. */
export function useDeleteCategory() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      await axios.delete(routes.ADMIN_CATEGORY(categoryId));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}
