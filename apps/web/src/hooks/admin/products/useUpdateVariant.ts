"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { UpdateVariantVariables, VariantResponse } from "./types";

/** Change a size's price, stock or visibility. */
export function useUpdateVariant() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, variantId, input }: UpdateVariantVariables) => {
      const { data } = await axios.patch<VariantResponse>(routes.ADMIN_PRODUCT_VARIANT(productId, variantId), input);
      return data.data;
    },
    onSuccess: (_variant, { productId }) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.detail(productId) }),
  });
}
