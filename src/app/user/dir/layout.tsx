import { Stack } from "@mantine/core";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <Stack>
        {children}
    </Stack>
}