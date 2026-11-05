"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";

/** Sign out of this device. Clears every cached query so no user data lingers. */
export function useLogout() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axios.post(routes.LOGOUT);
    },
    onSettled: () => queryClient.clear(),
  });
}
