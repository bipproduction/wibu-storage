import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import _ from "lodash";
import { libServer } from "@/lib/lib_server";

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
    return new Response(
      JSON.stringify({ success: false, message: "User not found" }),
      { status: 400 }
    );
  }

  // check if password is correct
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
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
      },
    });

    if (!apikey) {
      return new Response(
        JSON.stringify({ success: false, message: "API key not found" }),
        { status: 400 }
      );
    }

    const token = await libServer.sessionCreate({
      token: apikey.api_key,
    });

    return new Response(
      JSON.stringify({ success: true, token, redirect: "/user" })
    );
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ success: false, message: error }), {
      status: 500,
    });
  }
}
