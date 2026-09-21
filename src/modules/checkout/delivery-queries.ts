import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export interface DeliveryRange {
  id: string;
  minDistanceKm: number;
  maxDistanceKm: number;
  feeCents: number;
}

export const deliveryQueryOptions = queryOptions({
  queryKey: ["delivery-ranges"],
  queryFn: async (): Promise<{ maxDistanceKm: number; ranges: DeliveryRange[] }> => {
    const [settingsResult, rangesResult] = await Promise.all([
      supabase.from("delivery_settings").select("max_distance_km").eq("active", true).limit(1).maybeSingle(),
      supabase
        .from("delivery_ranges")
        .select("id,min_distance_km,max_distance_km,fee_cents")
        .eq("active", true)
        .order("sort_order"),
    ]);

    if (settingsResult.error) throw settingsResult.error;
    if (rangesResult.error) throw rangesResult.error;
    if (!settingsResult.data) throw new Error("Entrega não configurada.");

    return {
      maxDistanceKm: Number(settingsResult.data.max_distance_km),
      ranges: (rangesResult.data ?? []).map((range) => ({
        id: range.id,
        minDistanceKm: Number(range.min_distance_km),
        maxDistanceKm: Number(range.max_distance_km),
        feeCents: range.fee_cents,
      })),
    };
  },
});

export function findDeliveryFee(ranges: DeliveryRange[], distanceKm: number) {
  return ranges.find(
    (range, index) =>
      distanceKm >= range.minDistanceKm &&
      (distanceKm <= range.maxDistanceKm ||
        (index < ranges.length - 1 && distanceKm < range.maxDistanceKm)),
  )?.feeCents;
}