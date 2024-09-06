'use client'

import { apis } from "@/lib/routes";
import { Token } from "@/lib/token";
import { ntf } from "@/state/use_notification";
import { ActionIcon, Button, CopyButton, Divider, Flex, Group, Loader, Radio, Skeleton, Stack, Switch, Text, TextInput, Title } from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";
import { Prisma } from "@prisma/client";
import { ChangeEvent, ChangeEventHandler, KeyboardEventHandler, useState } from "react";
import { FaEdit } from "react-icons/fa";


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
        <Divider />
        <ListApiDisplay listApikey={listApikey!} />
    </Stack>
}

function ListApiDisplay({ listApikey }: { listApikey: Prisma.ApiKeyUncheckedCreateInput[] }) {
    if (!listApikey) return <Stack p={"md"}>
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
    </Stack>


    return <Stack p={"md"}>
        <Title order={3}>API Keys</Title>
        {listApikey.map((item, index) => {
            if (item.name === "default") return null
            return <ApiKeyItem key={index} data={item} />
        })}
    </Stack>
}

function ApiKeyItem({ data }: { data: Prisma.ApiKeyUncheckedCreateInput }) {
    const [isRename, setIsRename] = useState(false)
    const [dataItem, setDataItem] = useState(data)

    return <Stack gap={0} >
        {isRename ? <ApiKeyRename dataApi={dataItem} setDataItem={setDataItem} setIsRename={setIsRename} /> : <Text>{dataItem.name}</Text>}
        <Group pos={"relative"} gap={"md"} align={"center"}>
            <Text flex={1} lineClamp={1} style={{
                lineBreak: "anywhere",
                color: "gray"
            }} >{(data.api_key as string)}</Text>
            <ActionIcon variant="transparent" onClick={() => setIsRename(!isRename)}>
                <FaEdit />
            </ActionIcon>
            <CopyButton value={(data.api_key as string)}>
                {({ copied, copy }) => <Button variant={"transparent"} size="compact-xs" onClick={copy}>{copied ? "Copied" : "Copy"}</Button>}
            </CopyButton>
            <ApiKeyItemActivate data={dataItem} />
        </Group>
    </Stack>
}

function ApiKeyItemActivate({ data }: { data: Prisma.ApiKeyUncheckedCreateInput }) {
    const [loading, setLoading] = useState(false)
    const [dataApi, setDataApi] = useState(data)
    async function onActivate(e: ChangeEvent<HTMLInputElement>) {
        setLoading(true)

        try {
            const res = await fetch(apis["/api/apikey/[id]/activate"]({ id: data.id as string }), {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${Token.value}`
                },
                body: JSON.stringify({
                    active: e.target.checked
                })
            })
            const resText = await res.text()
            if (!res.ok) {
                console.log(resText)
                ntf.set({ type: "error", msg: resText })
                return
            }

            const resJson = JSON.parse(resText)
            setDataApi(resJson)

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return <Switch disabled={loading} label={dataApi.active ? "Active" : "Inactive"} defaultChecked={dataApi.active} onChange={onActivate} />
}

function ApiKeyRename({ dataApi, setIsRename, setDataItem }: { dataApi: Prisma.ApiKeyUncheckedCreateInput, setIsRename: any, setDataItem: any }) {
    const [loading, setLoading] = useState(false)


    async function onRename(e: KeyboardEvent) {

        if (e.key !== "Enter") return
        try {
            setLoading(true)
            if (dataApi.name === "") return ntf.set({ type: "error", msg: "name cannot be empty" })
            const res = await fetch(apis["/api/apikey/[id]/rename"]({ id: dataApi.id as string }), {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${Token.value}`
                },
                body: JSON.stringify({
                    name: dataApi.name
                })
            })
            const dataText = await res.text()

            if (!res.ok) {
                console.log(dataText)
                ntf.set({ type: "error", msg: dataText })
                return
            }

            const dataJson = JSON.parse(dataText)
            setDataItem(dataJson)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
            setIsRename(false)
        }
    }

    if (loading) return <Group>
        <Skeleton height={40} w={150} />
    </Group>
    return <Group>
        <TextInput description={"Enter to confirm"} onChange={(e) => setDataItem({ ...dataApi, name: e.target.value })} disabled={loading} value={dataApi.name} onKeyDown={onRename as any} />
    </Group>
}

function ApikeyCreate({ loadApikey }: {
    loadApikey: () => void
}) {
    const [form, setForm] = useState({ name: "" } as ApiKey)
    const [loading, setLoading] = useState(false)
    async function onCreate() {
        if (form.name === "") return ntf.set({ type: "error", msg: "name cannot be empty" })
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