"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { AdminProductResponse, UpdateProductVariables } from "./types";

export function useUpdateProduct() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, input }: UpdateProductVariables) => {
      const { data } = await axios.patch<AdminProductResponse>(routes.ADMIN_PRODUCT(productId), input);
      return data.data;
    },
    onSuccess: (product) => {
      queryClient.setQueryData(queryKeys.admin.products.detail(product.id), product);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}
