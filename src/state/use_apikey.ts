"use client";
import { apis } from "@/lib/routes";
import { wraperUseGlobal } from "@/lib/wraperUse";
import { hookstate } from "@hookstate/core";
import { Prisma } from "@prisma/client";

const state = hookstate<Prisma.ApiKeyCreateInput[] | null>(null);
export const useApikey = wraperUseGlobal(state, apis["/api/apikey"]);
