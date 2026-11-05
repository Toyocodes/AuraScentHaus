"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";

export function useDeleteAddress() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: string) => {
      await axios.delete(routes.DELETE_ADDRESS(addressId));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all }),
  });
}
