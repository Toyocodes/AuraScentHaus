"use client";

import { useQuery } from "@tanstack/react-query";
import { getErrorStatus } from "../helper/errors";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { MeResponse, UserDTO } from "./types";

/** The signed-in user, or `null` when signed out (a 401 isn't treated as an error). */
export function useMe() {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async (): Promise<UserDTO | null> => {
      try {
        const { data } = await axios.get<MeResponse>(routes.ME);
        return data.user;
      } catch (error) {
        if (getErrorStatus(error) === 401) return null;
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
