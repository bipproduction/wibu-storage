"use client";

import { gState } from "@/lib/gatate";
import { apies, pages } from "@/lib/routes";
import { Token } from "@/lib/token";
import { clientLogger } from "@/util/client-logger";
import { useHookstate } from "@hookstate/core";
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

export function TreePage({ dirId }: { dirId: string }) {
  const { value: triggerReloadDir, set: reloadDir } = useHookstate(
    gState.reloadDirState
  );
  
  const [listDir, setListDir] = useLocalStorage<Dirs[]>({
    key: "listDir",
    defaultValue: []
  });

  async function loadTree() {
    try {
      const res = await fetch(apies["/api/dir/[id]/tree"]({ id: "root" }), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${Token.value}`
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert("Failed to load directories: " + errorText);
        clientLogger.error("Failed to load directories: " + errorText);
        return;
      }

      const dataJson = await res.json();
      setListDir(dataJson.data);
    } catch (error) {
      alert("Failed to load directories: " + error);
      clientLogger.error("Failed to load directories: " + error);
    }
  }

  useShallowEffect(() => {
    loadTree();
  }, [triggerReloadDir]);

  return (
    <ScrollArea p={"md"}>
      <Stack p={"md"} gap={0}>
        {listDir.map((item) => (
          <DirItem key={item.id} dirs={item} depth={0} dirId={dirId} />
        ))}
      </Stack>
    </ScrollArea>
  );
}

function DirItem({
  dirs,
  depth,
  dirId
}: {
  dirs: Dirs;
  depth: number;
  dirId: string;
}) {
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
          bg={dirId === dirs.id ? "gray" : "transparent"}
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
              <DirItem
                dirId={dirId}
                key={child.id}
                dirs={child}
                depth={depth + 1}
              />
            ))}
          </Stack>
        )}
    </Box>
  );
}
