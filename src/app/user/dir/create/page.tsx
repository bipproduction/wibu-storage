'use client'

import { pages } from "@/lib/routes"
import { User } from "@/lib/token"
import { useDir } from "@/state/use_dir"
// import { useDirCreate } from "@/state/use_dir"
// import { useUser } from "@/state/use_user"
import { Button, CloseButton, Group, Stack } from "@mantine/core"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function Page() {
    const id = useSearchParams().get('id')
    // const { value: user } = useUser()
    const { crt: { create, loading } } = useDir()

    async function onCreate() {
        await create({
            parentId: id,
            name: "nama",
            userId: User.value.id
        })
    }

    return <Stack>
        <CloseButton component={Link} href={pages["/user/dir"]} />
        <Group>
            <Button loading={loading} onClick={onCreate}>create</Button>
        </Group>
    </Stack>
}