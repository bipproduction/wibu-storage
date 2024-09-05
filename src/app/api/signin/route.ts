import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import _ from "lodash";
import { libServer } from "@/lib/lib_server";
import { pages } from "@/lib/routes";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;
  const sin = await signin({ email, password });
  return sin;
}

async function signin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  console.log("LOGIN : ", email, password);
  // check if user exists
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    console.log("User not found");
    return new Response(
      JSON.stringify({ success: false, message: "User not found" }),
      { status: 400 }
    );
  }

  // check if password is correct
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    console.log("Incorrect password");
    return new Response(
      JSON.stringify({ success: false, message: "Incorrect password" }),
      { status: 400 }
    );
  }

  try {
    const apikey = await prisma.apiKey.findFirst({
      where: {
        userId: user.id,
        active: true,
        name: "default",
      },
    });

    if (!apikey) {
      console.log("API key not found");
      return new Response(
        JSON.stringify({ success: false, message: "API key not found" }),
        { status: 400 }
      );
    }

    const token = await libServer.sessionCreate({
      token: apikey.api_key,
    });

    if (!token) {
      console.log("Failed to create session");
      return new Response(
        JSON.stringify({ success: false, message: "Failed to create session" }),
        { status: 500 }
      );
    }

    console.log("Login successful");
    return new Response(
      JSON.stringify({ success: true, token, redirect: pages["/user"] })
    );

  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ success: false, message: error }), {
      status: 500,
    });
  }
}
