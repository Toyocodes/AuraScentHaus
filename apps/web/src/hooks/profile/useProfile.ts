"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { ProfileResponse } from "./types";

export function useProfile() {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.profile.all,
    queryFn: async () => {
      const { data } = await axios.get<ProfileResponse>(routes.GET_PROFILE);
      return data.user;
    },
  });
}
