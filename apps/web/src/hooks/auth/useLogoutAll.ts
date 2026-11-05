"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";

/** Sign out on every device (revokes all sessions). */
export function useLogoutAll() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axios.post(routes.LOGOUT_ALL);
    },
    onSettled: () => queryClient.clear(),
  });
}
