import { Container, Stack } from "@mantine/core";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <Stack>
            <Container maw={360}>
                {children}
            </Container>
        </Stack>
    );
}