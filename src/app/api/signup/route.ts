
import { apiKeyCreate } from "@/lib/lib_server";
import prisma from "@/lib/prisma";
import { pages } from "@/lib/routes";
import backendLogger from "@/util/backend-logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return Response.json(
        { success: false, message: "Please fill all the fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (existingUser) {
      backendLogger.info("User already exists");
      return Response.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: password
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    const api = await apiKeyCreate({
      name: "default",
      user: user
    });

    if (!api) {
      backendLogger.error("Failed to create API key");
      return Response.json(
        { success: false, message: "Failed to create API key" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      user,
      redirect: pages["/auth/signin"]
    });
    
  } catch (error) {
    backendLogger.error(error);
    return Response.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
}