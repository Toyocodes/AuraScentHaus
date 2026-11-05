"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { UpdateUserRoleResponse, UpdateUserRoleVariables } from "./types";

/**
 * Needs "users:manage-roles" (SUPER_ADMIN only). Changing a role signs that person out
 * everywhere, so the new role applies from their next sign-in.
 */
export function useUpdateUserRole() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: UpdateUserRoleVariables) => {
      const { data } = await axios.patch<UpdateUserRoleResponse>(routes.ADMIN_USER_ROLE(userId), { role });
      return data.user;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.customers.all });
    },
  });
}
