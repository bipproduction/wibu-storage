import { TokenProfider } from "@/lib/token";
// import { userToken } from "@/lib/user_token"
import { libServer } from "@/lib/lib_server";
import { cookies } from "next/headers";
import { UserHeader } from "./_ui/UserHeader";
export default async function Layout({ children }: { children: React.ReactNode }) {
    const token = cookies().get("ws_token")?.value;
    const user = await libServer.decrypt({ token: token! });
    return <TokenProfider token={token!} user={user!}>
        <UserHeader />
        {children}
    </TokenProfider>
}