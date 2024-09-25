"use client";
import { libClient } from "@/lib/lib_client";
import { apis } from "@/lib/routes";
import { ntf } from "@/state/use_notification";
import {
  Box,
  Center,
  Image,
  Loader,
  Menu,
  Paper,
  Stack,
  Text,
  TextInput
} from "@mantine/core";
import { Prisma } from "@prisma/client";
import { useState } from "react";
import { FaFile } from "react-icons/fa";
import {
  MdDelete,
  MdEdit,
  MdFileCopy,
  MdFileDownload,
  MdFileOpen,
  MdShare
} from "react-icons/md";

const listExtImage = [".jpg", ".png", ".jpeg", ".webp", ".svg", ".gif", ".ico"];
export function FileItem({
  file,
  width,
  selectedId,
  setSelectedId,
  contextMenu,
  setContextMenu
}: // reload
{
  file: Prisma.FilesGetPayload<{
    select: { id: true; name: true; ext: true; mime: true };
  }>;
  width: number;
  selectedId: string;
  setSelectedId: (v: string) => void;
  contextMenu: string;
  setContextMenu: (v: string) => void;
  // reload: () => void
}) {
  const [isRename, setIsRename] = useState(false);
  const [renameValue, setRenameValue] = useState<string>(file.name);

  function onClick(id: string) {
    setSelectedId(id);
    setContextMenu(""); // Close context menu when another file is clicked
    if (selectedId !== id) setIsRename(false);
  }

  function onDoubleClick(id: string) {
    window.open(apis["/api/files/[id]"]({ id }), "_blank");
  }

  function onContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(contextMenu === file.id ? "" : file.id); // Toggle context menu
  }

  async function onRename() {
    libClient.fileRename(renameValue, file.id, () => {
      setIsRename(false);
      // todo: reload
      // reload("dir");
    });
  }

  const onDelete = async () => {
    libClient.fileDelete(file.id, () => {
      setContextMenu("");
      // todo: reload
      // reload("dir");
      ntf.set({ type: "success", msg: "deleted" });
    });
  };

  const onCopy = () => {
    const host = window.location.origin;
    window.navigator.clipboard.writeText(
      host + apis["/api/files/[id]"]({ id: file.id })
    );
    setContextMenu("");
    // set({ type: "success", msg: "copied" });
    ntf.set({ type: "success", msg: "copied" });
  };

  const onDownload = () => {
    const fileUrl = "https://example.com/file.pdf"; // Ganti dengan URL file yang ingin diunduh
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "file.pdf"; // Nama file yang akan diunduh
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Stack>
      {/* {JSON.stringify(file)} */}
      <Menu opened={contextMenu === file.id}>
        <Menu.Target>
          <Paper
            pos={"relative"}
            w={width}
            key={file.id}
            onContextMenu={onContextMenu}
            onClick={() => onClick(file.id)}
            onDoubleClick={() => onDoubleClick(file.id)}
          >
            <Stack gap={"xs"} align={"center"} justify={"end"}>
              <Box
                c={"white"}
                bg={selectedId === file.id ? "gray" : "transparent"}
                pos={"relative"}
                // w={56}
                p={"xs"}
                h={66}
                style={{
                  overflowY: "hidden",
                  borderRadius: 8
                }}
              >
                {listExtImage.includes(file.ext!) ? (
                  <DisplayImage file={file} />
                ) : (
                  <FaFile size={46} />
                )}
              </Box>
              <Box
                bg={selectedId === file.id ? "blue" : "transparent"}
                style={{
                  borderRadius: "4px"
                }}
              >
                {selectedId === file.id && isRename ? (
                  <TextInput
                    ml={2}
                    onKeyDown={(e) => e.key === "Enter" && onRename()}
                    size="xs"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.currentTarget.value)}
                    autoFocus // Ensure the input gains focus
                  />
                ) : (
                  <Text
                    style={{
                      wordBreak: "break-word",
                      lineBreak: "anywhere"
                    }}
                    pos={"relative"}
                    c="white"
                    lineClamp={2}
                    ta={"center"}
                    fz="12"
                  >
                    {file.name}
                  </Text>
                )}
              </Box>
            </Stack>
          </Paper>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>{file.name}</Menu.Label>
          <Menu.Item
            onClick={() => onDoubleClick(file.id)}
            leftSection={<MdFileOpen size={14} />}
          >
            Open
          </Menu.Item>
          <Menu.Item
            onClick={() => setIsRename(!isRename)}
            leftSection={<MdEdit size={14} />}
          >
            Rename
          </Menu.Item>
          <Menu.Item onClick={onDelete} leftSection={<MdDelete size={14} />}>
            Delete
          </Menu.Item>
          <Menu.Item onClick={onCopy} leftSection={<MdFileCopy size={14} />}>
            Copy
          </Menu.Item>
          <Menu.Item leftSection={<MdShare size={14} />}>Share</Menu.Item>
          <Menu.Item
            component={"a"}
            download={file.name}
            href={apis["/api/files/[id]"]({ id: file.id })}
            leftSection={<MdFileDownload size={14} />}
          >
            Download
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Stack>
  );
}

function DisplayImage({ file }: { file: Record<string, any> }) {
  const [loading, setLoading] = useState(true);

  return (
    <Box pos={"relative"} style={{ width: "100%", height: "100%" }}>
      <Image
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
        src={apis["/api/files/[id]"]({ id: file.id }) + "-size-100"}
        w={"100%"}
        alt=""
      />
      <Center
        display={loading ? "flex" : "none"}
        pos={"absolute"}
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg={"dark"}
      >
        <Loader size={"xs"} variant={"dots"} />
      </Center>
    </Box>
  );
}
