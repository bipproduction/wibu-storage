'use client'

import { apis } from "@/lib/routes";
import { Token } from "@/lib/token";
import { Button, CopyButton, Flex, Group, Skeleton, Stack, Text, TextInput, Title } from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";
import { Prisma } from "@prisma/client";
import { useState } from "react";


type ApiKey = {} & Prisma.ApiKeyGetPayload<{ select: { name: true } }>
export default function Page() {
    const [listApikey, setListApikey] = useState<any[] | null>(null);
    async function loadApikey() {
        const res = await fetch(apis["/api/apikey/list"], {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${Token.value}`
            }
        })

        if (res.ok) {
            const json = await res.json()
            setListApikey(json)
            return
        }

        console.log(await res.text())
    }



    useShallowEffect(() => {
        loadApikey()
    }, [])


    return <Stack>
        <ApikeyCreate loadApikey={loadApikey} />
        <ListApiDisplay listApikey={listApikey!} />
    </Stack>
}

function ListApiDisplay({ listApikey }: { listApikey: any[] }) {
    if (!listApikey) return <Stack>
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
    </Stack>
    return <Stack p={"md"}>
        {listApikey.map((item, index) => {
            return <Stack key={index} gap={0} >
                <Text>{item.name}</Text>
                <Flex pos={"relative"} gap={"md"}>
                    <Text flex={1} lineClamp={1} style={{
                        lineBreak: "anywhere",
                        color: "gray"
                    }} >{(item.api_key as string)}</Text>
                    <CopyButton value={(item.api_key as string)}>
                        {({ copied, copy }) => <Button variant={"transparent"} size="compact-xs" onClick={copy}>{copied ? "Copied" : "Copy"}</Button>}
                    </CopyButton>
                </Flex>
            </Stack>
        })}
    </Stack>
}

function ApikeyCreate({ loadApikey }: {
    loadApikey: () => void
}) {
    const [form, setForm] = useState({ name: "" } as ApiKey)
    const [loading, setLoading] = useState(false)
    async function onCreate() {
        if (form.name === "") return alert("name can't be empty")
        try {
            setLoading(true)
            const res = await fetch(apis["/api/apikey/create"], {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${Token.value}`
                },
                body: JSON.stringify({ name: form.name } as ApiKey)
            })

            if (res.ok) {
                setForm({ name: "" } as ApiKey)
                loadApikey()
                return
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }
    return <Group>
        <Stack p={"md"}>
            <Title order={3}>create apikey</Title>
            <TextInput label="name" placeholder="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Button loading={loading} onClick={onCreate} >create</Button>
        </Stack>
    </Group>
}