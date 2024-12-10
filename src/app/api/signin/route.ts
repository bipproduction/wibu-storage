import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import _ from "lodash";
import { pages } from "@/lib/routes";
import backendLogger from "@/util/backend-logger";
import { sessionCreate } from "@/lib/lib_server";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;
  const sin = await signin({ email, password });
  return sin;
}

async function signin({
  email,
  password
}: {
  email: string;
  password: string;
}) {

  backendLogger.info("LOGIN : ", email, password);
  // check if user exists
  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (!user) {
    backendLogger.error("User not found");
    return Response.json(
      { success: false, message: "User not found" },
      { status: 400 }
    );
  }

  if (user.password !== password) {
    backendLogger.error("Incorrect password");
    return Response.json(
      { success: false, message: "Incorrect password" },
      { status: 400 }
    );
  }

  try {
    const apikey = await prisma.apiKey.findFirst({
      where: {
        userId: user.id,
        active: true,
        name: "default"
      }
    });

    if (!apikey) {
      backendLogger.error("API key not found");
      return Response.json(
        { success: false, message: "API key not found" },
        { status: 400 }
      );
    }

    const token = await sessionCreate({
      token: apikey.api_key
    });

    if (!token) {
      backendLogger.error("Failed to create session");
      return Response.json(
        { success: false, message: "Failed to create session" },
        { status: 400 }
      );
    }

    backendLogger.info("Login success");
    return Response.json(
      { success: true, token, redirect: pages["/user"] },
      { status: 200 }
    );
  } catch (error) {
    backendLogger.error("Failed to create session");
    return Response.json(
      { success: false, message: "Failed to create session" },
      { status: 400 }
    );
  }
}
