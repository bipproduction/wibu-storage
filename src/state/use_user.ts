"use client";
import { apis } from "@/lib/routes";
import { wraperUseGlobal } from "@/lib/wraperUse";
import { hookstate } from "@hookstate/core";
import { Prisma } from "@prisma/client";

const userState = hookstate<Prisma.UserUncheckedCreateInput | null>(null);

const useUser = <Where>({ where }: { where?: Where } = {}) =>
  wraperUseGlobal(userState, apis["/api/user"], { where })();

export {}