import { Flex, Skeleton, Stack } from "@mantine/core"

type Param = "list" | "grid"

export function CustomLoading({ view }: { view: Param }) {
    if (view === "list") return <List />
    if (view === "grid") return <Grid />

    return <List />
}

function List() {
    return <Stack p={"md"}>
        <Skeleton h={20} />
        <Skeleton h={20} />
        <Skeleton h={20} />
        <Skeleton h={20} />
        <Skeleton h={20} />
        <Skeleton h={20} />
    </Stack>
}

function Grid() {
    return <Flex gap={"md"}>
        <Skeleton h={200} w={200} />
        <Skeleton h={200} w={200} />
        <Skeleton h={200} w={200} />
        <Skeleton h={200} w={200} />
        <Skeleton h={200} w={200} />
        <Skeleton h={200} w={200} />
    </Flex>
}