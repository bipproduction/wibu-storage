'use client'
import { pages } from '@/lib/routes'
import { ActionIcon, Flex, Stack } from '@mantine/core'
import { useShallowEffect } from '@mantine/hooks'
import Markdown from '@uiw/react-markdown-preview'
import Link from 'next/link'
import { useState } from 'react'
import { FaArrowCircleLeft } from 'react-icons/fa'

export const dynamic = "force-dynamic"
export default function DocsPage({ content }: { content: string }) {
    const [dataContent, setDataContent] = useState<string | null>(content)

    async function getDataContent() {
        const res = await fetch('/assets/docs/DOCS.md')
        const text = await res.text()
        setDataContent(text)
    }

    useShallowEffect(() => {
        getDataContent()
    }, [])

    if (!dataContent) return null
    return <Stack>
        <Flex p={"md"}>
            <ActionIcon component={Link} href={pages["/user"]}>
                <FaArrowCircleLeft />
            </ActionIcon>
        </Flex>
        <Markdown style={{
            padding: "1rem",
        }} source={dataContent!} />
    </Stack>
}