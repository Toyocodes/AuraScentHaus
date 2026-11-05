"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { DeleteVariantVariables } from "./types";

export function useDeleteVariant() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, variantId }: DeleteVariantVariables) => {
      await axios.delete(routes.ADMIN_PRODUCT_VARIANT(productId, variantId));
    },
    onSuccess: (_data, { productId }) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.detail(productId) }),
  });
}
