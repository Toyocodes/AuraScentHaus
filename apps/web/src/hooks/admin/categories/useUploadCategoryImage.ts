"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { CategoryResponse, UploadCategoryImageVariables } from "./types";

/** Needs "categories:write". Uploads through the API to Supabase Storage. */
export function useUploadCategoryImage() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, file }: UploadCategoryImageVariables) => {
      const body = new FormData();
      body.append("image", file);
      const { data } = await axios.post<CategoryResponse>(routes.ADMIN_CATEGORY_IMAGE(categoryId), body);
      return data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}
