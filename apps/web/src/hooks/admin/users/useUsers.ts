"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { UserListParams, UserListResponse } from "./types";

/** Every account, any role. Needs "users:read" (SUPER_ADMIN only). */
export function useUsers(params: UserListParams = {}) {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.admin.users.list(params),
    queryFn: async () => {
      const { data } = await axios.get<UserListResponse>(routes.ADMIN_USERS, { params });
      return data;
    },
    placeholderData: keepPreviousData,
  });
}
