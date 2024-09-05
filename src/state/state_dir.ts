"use client";
import { hookstate, useHookstate } from "@hookstate/core";
import { Prisma } from "@prisma/client";

type Dir = {} & Prisma.DirGetPayload<{
  select: { id: true; name: true; userId: true; parentId: true };
}>;
const state = hookstate<Dir[]>([]);
export const useDirState = () => {
  const s = useHookstate(state);
  return [s.value, s.set] as const;
};
