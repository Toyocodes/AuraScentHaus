"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DeliveryZoneDTO, DeliveryZoneInput, UpdateDeliveryZoneInput } from "@aurascenthaus/shared";
import type { DataResponse } from "../../helper/types";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";

/** Every delivery option, including switched-off ones. */
export function useAdminDeliveryZones() {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.admin.deliveryZones.all,
    queryFn: async () => {
      const { data } = await axios.get<DataResponse<DeliveryZoneDTO[]>>(routes.ADMIN_DELIVERY_ZONES);
      return data.data;
    },
  });
}

/** After any change, refresh the admin list and what shoppers see at checkout. */
function useRefreshZones() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.deliveryZones.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.deliveryZones.all });
  };
}

/** Adds a Lagos axis. Needs "delivery:write". */
export function useCreateDeliveryZone() {
  const axios = useAxios();
  const refresh = useRefreshZones();

  return useMutation({
    mutationFn: async (input: DeliveryZoneInput) => {
      const { data } = await axios.post<DataResponse<DeliveryZoneDTO>>(routes.ADMIN_DELIVERY_ZONES, input);
      return data.data;
    },
    onSuccess: refresh,
  });
}

export function useUpdateDeliveryZone() {
  const axios = useAxios();
  const refresh = useRefreshZones();

  return useMutation({
    mutationFn: async ({ zoneId, input }: { zoneId: string; input: UpdateDeliveryZoneInput }) => {
      const { data } = await axios.patch<DataResponse<DeliveryZoneDTO>>(routes.ADMIN_DELIVERY_ZONE(zoneId), input);
      return data.data;
    },
    onSuccess: refresh,
  });
}

/** Only Lagos axes can be deleted. */
export function useDeleteDeliveryZone() {
  const axios = useAxios();
  const refresh = useRefreshZones();

  return useMutation({
    mutationFn: async (zoneId: string) => {
      await axios.delete(routes.ADMIN_DELIVERY_ZONE(zoneId));
    },
    onSuccess: refresh,
  });
}
