'use client'
import { apis } from "@/lib/routes";
import { Button, Flex, Stack, Text, TextInput, Title } from "@mantine/core";
import Link from "next/link";
import { useState } from "react";

type SigninForm = {
    email: string | null
    password: string | null
}
export function Signin() {
    const [form, setForm] = useState<SigninForm | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit() {
        try {
            if (!form || !form.email || !form.password) return alert("Please fill all the fields");
            setLoading(true);
            const response = await fetch(apis["/api/signin"], {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const data = await response.text();
            if (response.ok) {
                const dataJson = JSON.parse(data);
                setForm(null);
                return window.location.href = dataJson.redirect;
            };
            return alert(data);
        } catch (error) {
            console.log(error)
            return alert("Something went wrong");
        } finally {
            setLoading(false);
        }

    }
    return <Stack py={"xl"}>
        <Title>SIGNIN</Title>
        <TextInput placeholder="Your email" label="Email" defaultValue={form?.email as string} onChange={(e) => setForm({ ...form!, email: e.target.value })} />
        <TextInput placeholder="Your password" label="Password" defaultValue={form?.password as string} onChange={(e) => setForm({ ...form!, password: e.target.value })} />
        <Button loading={loading} onClick={onSubmit}>Submit</Button>
        <Flex>
            <Text>Dont have an account?</Text>
            <Button variant="transparent" size="compact-xs" component={Link} href="/auth/signup">Signup</Button>
        </Flex>
    </Stack>
}