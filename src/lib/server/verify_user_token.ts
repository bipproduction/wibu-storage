// import _ from "lodash";
import { libServer } from "../lib_server";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";

type User = {} & Prisma.UserGetPayload<{
  select: { id: true; name: true; email: true };
}>;

export async function verifyUserToken(
  req: Request,
  onUser: (user: User) => Promise<Response>
) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "No authorization header" }), {
      status: 401,
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return new Response(JSON.stringify({ error: "No token provided" }), {
      status: 401,
    });
  }

  try {
    const userToken = await libServer.decrypt({ token });
    if (!userToken) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userToken.id,
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        ApiKey: {
          where: {
            api_key: token,
            active: true,
          },
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user || !user.ApiKey.length) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
      });
    }

    return onUser(user);
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
    });
  }
}
