'use client'
import { useNotification } from "@/state/use_notification";
import { useState } from "react";
import { Token } from "./token";

export const useWrapperCreate = (url: string) => {
    const [loading, setLoading] = useState(false); // Manage loading state
    const { set: setNotification } = useNotification(); // Get notification management

    async function create<T>(param: T, { onSuccess }: { onSuccess?: () => void } = {}) {
        try {
            setLoading(true);
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Token.value}`,
                },
                body: JSON.stringify(param),
            });

            if (res.ok) {
                onSuccess && onSuccess();
            } else {
                setNotification({ type: "error", msg: await res.text() }); // Show error notification
            }
        } catch (error) {
            setNotification({ type: "error", msg: error as string }); // Show error notification if request fails
        } finally {
            setLoading(false); 
        }
    };

    return {
        create,
        loading,
    } as const;
};