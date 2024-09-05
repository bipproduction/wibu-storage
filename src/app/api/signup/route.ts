import { libServer } from "@/lib/lib_server";
import prisma from "@/lib/prisma";
import { pages } from "@/lib/routes";
import bcrypt from "bcrypt";
export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password } = body;
  if (!name || !email || !password) {
    return new Response("Please fill in all fields", { status: 400 });
  }
  const sup = await signup({ name, email, password });

  return sup;
}

async function signup({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (existingUser) {
    console.log("User already exists");
    return new Response(
      JSON.stringify({ success: false, message: "User already exists" }),
      { status: 400 }
    );
  }
  const hashedPassword = await bcrypt.hash(password as string, 10);
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const api = await libServer.apiKeyCreate({
      name: "default",
      user: user,
    });

    if (!api) {
      console.log("Failed to create API key");
      return new Response(
        JSON.stringify({ success: false, message: "Failed to create API key" }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, user, redirect: pages["/auth/signin"] }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ success: false, message: error }), {
      status: 500,
    });
  }
}
