"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { AdminCreateCustomerInput, CustomerResponse } from "./types";

/** Needs "customers:write". Add a customer by hand, e.g. someone who shopped in person. */
export function useCreateCustomer() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AdminCreateCustomerInput) => {
      const { data } = await axios.post<CustomerResponse>(routes.ADMIN_CUSTOMERS, input);
      return data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.customers.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats.all });
    },
  });
}
