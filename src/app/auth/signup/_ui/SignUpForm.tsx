'use client'
import { apis } from "@/lib/routes"
import { useNotification } from "@/state/use_notification"
import { Button, Flex, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core"
import Link from "next/link"
import { useState } from "react"
type DefaultSignupForm = {
    name: string | null
    email: string | null
    password: string | null
}

export function SignupForm() {
    const [form, setForm] = useState<DefaultSignupForm | null>(null);
    const [loading, setLoading] = useState(false);
    const { set: setValue } = useNotification()
    async function onSubmit() {
        if (!form || !form.name || !form.email || !form.password) return alert("Please fill all the fields");

        setLoading(true);
        const response = await fetch(apis["/api/signup"], {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(form)
        });
        setLoading(false);
        if (response.status !== 200) {

            return setValue({ type: "error", msg: "Something went wrong" })
        };
        setForm(null);
        window.location.href = "/auth/signin";
    }
    return <Stack py={"xl"}>
        <Title>SIGNUP</Title>
        <TextInput placeholder="Your name" label="Name" defaultValue={form?.name as string} onChange={(e) => setForm({ ...form!, name: e.target.value })} />
        <TextInput placeholder="Your email" label="Email" defaultValue={form?.email as string} onChange={(e) => setForm({ ...form!, email: e.target.value })} />
        <PasswordInput placeholder="Your password" label="Password" defaultValue={form?.password as string} onChange={(e) => setForm({ ...form!, password: e.target.value })} />
        <Button loading={loading} onClick={onSubmit}>Submit</Button>
        <Flex>
            <Text>Already have an account?</Text>
            <Button variant="transparent" size="compact-xs" component={Link} href="/auth/signin">Login</Button>
        </Flex>
    </Stack>
}