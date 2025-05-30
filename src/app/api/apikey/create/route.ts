import { apiKeyCreate, verifyUserToken } from "@/lib/lib_server";



export const POST = (req: Request) => verifyUserToken(req, async (user) => {
  const body = await req.json();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  const api_key = await apiKeyCreate({
    name: body.name,
    user: user,
  });

  return new Response(JSON.stringify(api_key));
});
