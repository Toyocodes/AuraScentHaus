"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { DeleteProductImageVariables } from "./types";

export function useDeleteProductImage() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, imageId }: DeleteProductImageVariables) => {
      await axios.delete(routes.ADMIN_PRODUCT_IMAGE(productId, imageId));
    },
    onSuccess: (_data, { productId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.detail(productId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all });
    },
  });
}
