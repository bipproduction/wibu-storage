'use client'

import { Stack } from "@mantine/core"
import { UserHeader } from "./UserHeader"

export function UserPage({ token }: { token: string }) {


    return <Stack>
        <UserHeader  />

    </Stack>
}