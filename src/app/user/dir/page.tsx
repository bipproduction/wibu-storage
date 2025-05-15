"use client";

import { apies, pages } from "@/lib/routes";
import { Token } from "@/lib/token";
import { Stack, Text, Box, Group, Button, ActionIcon, Title } from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";
import { AiFillFolder } from "react-icons/ai"; // Import icon folder
import { BiMinusCircle, BiPlusCircle } from "react-icons/bi"; // Icons for expand/collapse

type Dir = Prisma.DirGetPayload<{
  select: { name: true; id: true; parentId: true };
}>;
type Dirs = Dir & { children: Dirs[] };

export default function Page() {
  const [listDir, setListDir] = useState<Dirs[]>([]);

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
        return;
      }

      const dataJson = await res.json();
      setListDir(dataJson.data);
    } catch (error) {
      alert("Failed to load directories: " + error);
    }
  }

  useShallowEffect(() => {
    loadTree();
  }, []);

  return (
    <Stack p={"md"} gap={0}>
      {listDir.map((item) => (
        <DirItem key={item.id} dirs={item} depth={0} />
      ))}
    </Stack>
  );
}

function DirItem({ dirs, depth }: { dirs: Dirs; depth: number }) {
  const [isOpen, setIsOpen] = useState(false); // State for controlling open/close

  return (
    <Box pl={24}>
      <Group style={{ borderLeft: "2px solid #ccc" }} pl={"md"} gap={0}>
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
        <Text component={Link} href={pages["/user/dir/[id]"]({ id: dirs.id })}>
          {dirs.name}
        </Text>
      </Group>

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
