import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { encrypt } from "./encrypt";


type User = {} & Prisma.UserGetPayload<{
  select: { id: true; name: true; email: true };
}>;

export async function apiKeyCreate({
  name,
  user,
  exp = "100 years",
  desc,
}: {
  name: string;
  user: User;
  exp?: string;
  desc?: string;
}) {
  const token = await encrypt({ user, exp });
  const apiKey = await prisma.apiKey.create({
    data: {
      name,
      api_key: token,
      userId: user.id,
      desc,
    },
    select: {
      name: true,
      userId: true,
      desc: true,
    },
  });
  return apiKey;
}
