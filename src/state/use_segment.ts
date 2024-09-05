"use client";

import { hookstate, useHookstate } from "@hookstate/core";
import { useShallowEffect } from "@mantine/hooks";
import {
  useSelectedLayoutSegments,
} from "next/navigation";

const segments = hookstate<string | null>(null);
export function useSegment() {
  const segts = useSelectedLayoutSegments();
  const stateSegments = useHookstate(segments);

  useShallowEffect(() => {
    console.log("set segments", segts);
    stateSegments.set(segts.join("/"));
  }, [segts]);
  return {
    segments: stateSegments.value,
    setSegments: stateSegments.set,
  } as const;
}
