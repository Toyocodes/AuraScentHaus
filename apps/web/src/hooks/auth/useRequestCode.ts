"use client";

import { useMutation } from "@tanstack/react-query";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { RequestCodeInput, RequestCodeResponse } from "./types";

/** Step 1 of login: email the user a 6-digit code. Also used for "Resend code". */
export function useRequestCode() {
  const axios = useAxios();

  return useMutation({
    mutationFn: async (input: RequestCodeInput) => {
      const { data } = await axios.post<RequestCodeResponse>(routes.REQUEST_CODE, input);
      return data;
    },
  });
}
