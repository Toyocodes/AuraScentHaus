"use client";

import { useQuery } from "@tanstack/react-query";
import type { DeliveryZoneDTO } from "@aurascenthaus/shared";
import type { DataResponse } from "../helper/types";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";

/** The delivery options on offer (Lagos axes, other areas, outside Lagos, store pickup) with their fees. */
export function useDeliveryZones() {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.deliveryZones.all,
    queryFn: async () => {
      const { data } = await axios.get<DataResponse<DeliveryZoneDTO[]>>(routes.FETCH_DELIVERY_ZONES);
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
