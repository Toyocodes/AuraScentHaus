"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { AddVariantVariables, VariantResponse } from "./types";

/** Add a size (e.g. 50ml) with its SKU, price in kobo, and stock. */
export function useAddVariant() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, input }: AddVariantVariables) => {
      const { data } = await axios.post<VariantResponse>(routes.ADMIN_PRODUCT_VARIANTS(productId), input);
      return data.data;
    },
    onSuccess: (_variant, { productId }) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.detail(productId) }),
  });
}
