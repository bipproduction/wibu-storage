'use client'
import { clientLogger } from "@/util/client-logger";
import { Button, Stack } from "@mantine/core"
import { useState } from "react";

export function SignoutButton() {
    const [loading, setLoading] = useState(false);
    async function onSubmit() {
        setLoading(true);
        const response = await fetch("/auth/api/signout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        setLoading(false);
        if (!response.ok) {
            const data = await response.json();
            alert("Error signing out");
            clientLogger.error("Error signing out", data);
            return 
        };
        window.location.href = "/auth/signin";
    }
    return <Stack>
        <Button loading={loading} onClick={onSubmit}> Signout</Button>
    </Stack>
}