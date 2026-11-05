"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { ProductImagesResponse, UploadProductImagesVariables } from "./types";

/** Upload up to 8 images (JPG, PNG, WebP or AVIF, 5 MB each). The API stores them in Supabase Storage. */
export function useUploadProductImages() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, files, alt }: UploadProductImagesVariables) => {
      const form = new FormData();
      files.forEach((file) => form.append("images", file));
      if (alt) form.append("alt", alt);

      // Sent as multipart/form-data: the browser sets the header (with its boundary) for FormData.
      const { data } = await axios.post<ProductImagesResponse>(routes.ADMIN_PRODUCT_IMAGES(productId), form);
      return data.data;
    },
    onSuccess: (_images, { productId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.detail(productId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all });
    },
  });
}
