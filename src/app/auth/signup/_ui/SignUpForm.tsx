'use client'
import { apies } from "@/lib/routes"
import { clientLogger } from "@/util/client-logger"
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

    async function onSubmit() {
        if (!form || !form.name || !form.email || !form.password) {
            alert("Please fill all the fields");
            clientLogger.error("Please fill all the fields");
            return;
        }

        setLoading(true);
        const response = await fetch(apies["/api/signup"], {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(form)
        });
        setLoading(false);
        const data = await response.text();
        if (response.status !== 200) {
            alert(data);
            clientLogger.error(data);
            return;
        };
        setForm(null);
        const dataJson = JSON.parse(data);
        window.location.href = dataJson.redirect;
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