'use client'

import { ntf } from "@/state/use_notification";
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
            return ntf.set({ type: "error", msg: data.message });
        };
        window.location.href = "/auth/signin";
    }
    return <Stack>
        <Button loading={loading} onClick={onSubmit}> Signout</Button>
    </Stack>
}