"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { AddressResponse, UpdateAddressVariables } from "./types";

/** Edit an address, or make it the default with `{ isDefault: true }`. */
export function useUpdateAddress() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ addressId, input }: UpdateAddressVariables) => {
      const { data } = await axios.patch<AddressResponse>(routes.UPDATE_ADDRESS(addressId), input);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all }),
  });
}
