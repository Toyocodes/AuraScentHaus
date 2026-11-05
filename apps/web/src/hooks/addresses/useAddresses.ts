"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { AddressListResponse } from "./types";

/** Saved delivery addresses (account page and checkout). */
export function useAddresses() {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.addresses.all,
    queryFn: async () => {
      const { data } = await axios.get<AddressListResponse>(routes.FETCH_ADDRESSES);
      return data.data;
    },
  });
}
