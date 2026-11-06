"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";

/** Needs "categories:delete". The API refuses while products use the family. */
export function useDeleteScentFamily() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (familyId: string) => {
      await axios.delete(routes.ADMIN_SCENT_FAMILY(familyId));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.scentFamilies.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.scentFamilies.all });
    },
  });
}
