"use client";

import { useQuery } from "@tanstack/react-query";
import { healthApi, queryKeys } from "@/lib/api";

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => healthApi.get(),
    retry: false,
  });
}
