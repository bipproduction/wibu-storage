"use client";
import { apis } from "@/lib/routes";
import { useWrapperCreate } from "@/lib/wraperCreate";
import { wraperUseGlobal, useWraperUseLocal } from "@/lib/wraperUse";
import { hookstate, useHookstate } from "@hookstate/core";
import { useLocalStorage } from "@mantine/hooks";
import { Prisma } from "@prisma/client";

type Dir = {} & Prisma.DirGetPayload<{
  select: { name: true; userId: true; parentId: true; id: true };
}>;

type DirWhere = {} & Prisma.DirWhereInput;

// Initialize the state for directories
const state = hookstate<Dir[] | null>(null);
const stateBrd = hookstate<
  {
    id: string;
    title: string;
  }[]
>([]);
export const useDir = <Where extends DirWhere>({
  where,
}: { where?: Where } = {}) => {
  const gbl = wraperUseGlobal(state, apis["/api/dir"], { where })();
  const lcl = useWraperUseLocal<DirWhere, Dir[]>(apis["/api/dir"], { where });
  const crt = useWrapperCreate(apis["/api/dir"]);
  return {
    gbl,
    lcl,
    crt,
  } as const;
};
