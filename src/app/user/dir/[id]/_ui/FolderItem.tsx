import { libClient } from "@/lib/lib_client";
import { pages } from "@/lib/routes";
import { Box, Menu, Paper, Stack, Text } from "@mantine/core";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";
import { MdDelete, MdEdit, MdFolder, MdOpenInNew } from "react-icons/md";
import { Rename } from "./Rename";
import { ntf } from "@/state/use_notification";
import { useHookstate } from "@hookstate/core";
import { gState } from "@/lib/gatate";

export function FolderItem({
  dir,
  width,
  selectedId,
  setSelectedId,
  contextMenu,
  setContextMenu,
  parentId
}: {
  dir: Prisma.DirGetPayload<{
    select: { id: true; name: true; parentId: true; userId: true };
  }>;
  width: number;
  selectedId: string;
  setSelectedId: (v: string) => void;
  contextMenu: string;
  setContextMenu: (v: string) => void;
  parentId: string;
}) {
  const [isRename, setIsRename] = useState(false);
  const dirState = useHookstate(gState.dirState);

  const onClick = () => {
    setSelectedId(dir.id);
    setContextMenu("");
    if (selectedId !== dir.id) setIsRename(false);
  };

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(contextMenu === dir.id ? "" : dir.id);
  };

  const onDoubleClick = () => {
    window.location.href = pages["/user/dir/[id]"]({ id: dir.id });
  };

  const onCreate = async () => {
    // todo : create folder
    libClient.dirCreate(parentId, "new folder", () => {
      setContextMenu("");
      dirState.set(gState.random());

    });
  };

  const onDelete = async () => {
    libClient.dirDelete(dir.id, () => {
      setContextMenu("");
      dirState.set(gState.random());
      ntf.set({
        type: "success",
        msg: "Folder deleted successfully"
      });
    });
  };

  return (
    <Menu opened={contextMenu === dir.id}>
      <Menu.Target>
        <Paper
          w={width}
          key={dir.id}
          onContextMenu={onContextMenu}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
        >
          <Stack gap={"0"} align="center" justify="end">
            <Box
              c={"blue"}
              bg={selectedId === dir.id ? "gray" : "transparent"}
              style={{
                borderRadius: "4px"
              }}
            >
              <MdFolder size={46} />
            </Box>
            <Box
              bg={selectedId === dir.id ? "blue" : "transparent"}
              style={{
                borderRadius: "4px"
              }}
            >
              {selectedId === dir.id && isRename ? (
                <Rename
                  dirId={dir.id}
                  name={dir.name}
                  setIsRename={setIsRename}
                />
              ) : (
                <Text c="white" lineClamp={2} ta={"center"} fz="12">
                  {dir.name}
                </Text>
              )}
            </Box>
          </Stack>
        </Paper>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{dir.name}</Menu.Label>
        <Menu.Item
          component={Link}
          href={pages["/user/dir/[id]"]({ id: dir.id })}
          leftSection={<MdOpenInNew size={14} />}
        >
          open
        </Menu.Item>
        <Menu.Item onClick={onCreate} leftSection={<MdFolder size={14} />}>
          new folder
        </Menu.Item>
        <Menu.Item
          onClick={() => setIsRename(!isRename)}
          leftSection={<MdEdit size={14} />}
        >
          rename
        </Menu.Item>
        <Menu.Item onClick={onDelete} leftSection={<MdDelete size={14} />}>
          delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
