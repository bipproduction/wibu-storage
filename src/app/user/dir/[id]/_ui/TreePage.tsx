"use client";

import { apis, pages } from "@/lib/routes";
import { Token } from "@/lib/token";
import { ntf } from "@/state/use_notification";
import { ActionIcon, Box, Flex, ScrollArea, Stack, Text } from "@mantine/core";
import { useLocalStorage, useShallowEffect } from "@mantine/hooks";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { AiFillFolder } from "react-icons/ai"; // Import icon folder
import { BiMinusCircle, BiPlusCircle } from "react-icons/bi"; // Icons for expand/collapse

type Dir = Prisma.DirGetPayload<{
  select: { name: true; id: true; parentId: true };
}>;
type Dirs = Dir & { children: Dirs[] };

export function TreePage() {
  const [listDir, setListDir] = useLocalStorage<Dirs[]>({
    key: "listDir",
    defaultValue: []
  });

  async function loadTree() {
    try {
      const res = await fetch(apis["/api/dir/[id]/tree"]({ id: "root" }), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${Token.value}`
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        ntf.set({ msg: errorText, type: "error" });
        return;
      }

      const dataJson = await res.json();
      setListDir(dataJson.data);
    } catch (error) {
      ntf.set({ msg: `Failed to load directories: ${error}`, type: "error" });
    }
  }

  useShallowEffect(() => {
    loadTree();
  }, []);

  return (
    <ScrollArea p={"md"}>
      <Stack p={"md"} gap={0}>
        {listDir.map((item) => (
          <DirItem key={item.id} dirs={item} depth={0} />
        ))}
      </Stack>
    </ScrollArea>
  );
}

function DirItem({ dirs, depth }: { dirs: Dirs; depth: number }) {
  const [isOpen, setIsOpen] = useLocalStorage<boolean>({
    key: dirs.id,
    defaultValue: false
  }); // State for controlling open/close

  return (
    <Box pl={24}>
      <Flex
        align={"center"}
        style={{ borderLeft: "2px solid #ccc", whiteSpace: "nowrap" }} // Ensure no wrapping of text
        pl={"md"}
        gap={0}
      >
        {dirs.children &&
          dirs.children.length > 0 && ( // Show button only if there are children
            <ActionIcon
              size="xs"
              variant="subtle"
              onClick={() => setIsOpen(!isOpen)}
              style={{ marginRight: "5px" }}
            >
              {isOpen ? <BiMinusCircle /> : <BiPlusCircle />}{" "}
              {/* Toggle button */}
            </ActionIcon>
          )}
        <AiFillFolder size={20} color="orange" />
        <Text
          flex={1}
          component={Link}
          href={pages["/user/dir/[id]"]({ id: dirs.id })}
          style={{ overflow: "hidden", textOverflow: "ellipsis" }} // Truncate long text
        >
          {dirs.name}
        </Text>
      </Flex>

      {isOpen &&
        dirs.children &&
        dirs.children.length > 0 && ( // Conditional rendering of children
          <Stack gap={0}>
            {dirs.children.map((child) => (
              <DirItem key={child.id} dirs={child} depth={depth + 1} />
            ))}
          </Stack>
        )}
    </Box>
  );
}