import { apies } from "@/lib/routes";
import { Token } from "@/lib/token";
import { useNotification } from "@/state/use_notification";
import { Button } from "@mantine/core";
import { useState } from "react";

export function UserButtonLogout() {
    const { set: setValue } = useNotification()
    const [loading, setLoading] = useState(false)
    async function onClick() {
        setLoading(true)
        const res = await fetch(apies["/api/signout"], {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${Token.value}`
            }
        })

        setLoading(false)
        if (res.ok) {
            return window.location.href = "/auth/signin"
        }

        setValue({
            type: "error",
            msg: "Something went wrong"
        })

    }
    return <Button onClick={onClick} variant="subtle" size="compact-xs">Logout</Button>
}