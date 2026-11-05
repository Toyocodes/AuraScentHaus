"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { CustomerResponse, UpdateCustomerVariables } from "./types";

/** Needs "customers:write". Only works on customers (team members are managed on the roles page). */
export function useUpdateCustomer() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, input }: UpdateCustomerVariables) => {
      const { data } = await axios.patch<CustomerResponse>(routes.ADMIN_CUSTOMER(customerId), input);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.customers.all }),
  });
}
