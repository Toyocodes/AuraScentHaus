"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { VerifyCodeInput, VerifyCodeResponse } from "./types";

/** Step 2 of login: the API checks the code and sets the httpOnly session cookie. */
export function useVerifyCode() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: VerifyCodeInput) => {
      const { data } = await axios.post<VerifyCodeResponse>(routes.VERIFY_CODE, input);
      return data;
    },
    onSuccess: ({ user }) => {
      queryClient.setQueryData(queryKeys.auth.me(), user);
      // A different person may now be signed in, so refetch everything that's per-user.
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
  });
}
