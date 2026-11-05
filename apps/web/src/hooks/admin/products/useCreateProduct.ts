"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { AdminProductResponse, ProductInput } from "./types";

export function useCreateProduct() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ProductInput) => {
      const { data } = await axios.post<AdminProductResponse>(routes.ADMIN_PRODUCTS, input);
      return data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}
