"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { AddressInput, AddressResponse } from "./types";

export function useCreateAddress() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddressInput) => {
      const { data } = await axios.post<AddressResponse>(routes.CREATE_ADDRESS, input);
      return data.data;
    },
    // Refetch the list: making one address the default changes the others too.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all }),
  });
}
