import { Stack, Title } from "@mantine/core";
import { SignoutButton } from "./_ui/SignoutButton";

export default function Page() {
    return <Stack py={"xl"}>
            <Title>SIGNOUT</Title>
            <SignoutButton />
    </Stack>
}