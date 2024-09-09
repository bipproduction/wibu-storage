"use client";

import { User } from "@/lib/token";
import {
  ActionIcon,
  Avatar,
  Button,
  Flex,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { UserButtonLogout } from "./UserButtonLogout";
import { pages } from "@/lib/routes";
import Link from "next/link";

export function UserHeader() {
  return (
    <Stack
      pos={"sticky"}
      top={0}
      bg={"dark"}
      style={{
        borderBottom: "0.5px solid #444",
        zIndex: 99,
      }}
    >
      <Flex justify={"space-between"} p={"xs"}>
        <Text>{User.value.name}</Text>
        <Group>
          <ActionIcon
            variant="transparent"
            component={Link}
            href={pages["/user"]}
          >
            <Avatar />
          </ActionIcon>
          <UserButtonLogout />
        </Group>
      </Flex>
      <Flex wrap={"wrap"} justify={"end"} px={"xs"}>
        <Button
          component={Link}
          href={pages["/docs"]}
          variant="transparent"
          size="compact-xs"
        >
          Docs
        </Button>
        <Button
          component={Link}
          href={pages["/user/dir/[id]"]({ id: "root" })}
          variant="transparent"
          size="compact-xs"
        >
          Storage
        </Button>
      </Flex>
    </Stack>
  );
}
