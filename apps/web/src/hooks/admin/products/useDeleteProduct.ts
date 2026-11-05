"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";

/** Needs "products:delete". Past orders keep their own copy of the product details. */
export function useDeleteProduct() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      await axios.delete(routes.ADMIN_PRODUCT(productId));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}
