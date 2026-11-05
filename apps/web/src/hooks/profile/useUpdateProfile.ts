"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { ProfileResponse, UpdateProfileInput } from "./types";

export function useUpdateProfile() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const { data } = await axios.patch<ProfileResponse>(routes.UPDATE_PROFILE, input);
      return data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.profile.all, user);
      queryClient.setQueryData(queryKeys.auth.me(), user);
    },
  });
}
