import prisma from "@/lib/prisma";
import { encrypt } from "@/lib/server/encrypt";

export async function POST(req: Request) {
    const body = await req.json();
    const { email, phone } = body;

    if (!email && !phone) {
        return new Response("Please fill in all fields", { status: 400 });
    }
    const findUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!findUser) {
        return new Response("User not found", { status: 400 });
    }

    const decriptedEmail = await encrypt({
        user: findUser,
        exp: "1 hour",
    });

    const sendWa = await fetch("https://wa.wibudev.com/code?nom=" + phone + "&text=https://wibu-storage.wibudev.com/auth/reset-password/" + decriptedEmail);

    if (!sendWa.ok) {
        return new Response("Failed to send WhatsApp message", { status: 400 });
    }
    const responseText = await sendWa.text();
    return new Response(responseText, { status: 200 });
}