"use client";

import { libClient } from "@/lib/lib_client";
import { apies, pages } from "@/lib/routes";
import { Token } from "@/lib/token";
import {
  ActionIcon,
  Box,
  Button,
  Center,
  FileButton,
  Flex,
  Group,
  Image,
  Loader,
  Menu,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton
} from "@mantine/core";
import { useLocalStorage, useShallowEffect } from "@mantine/hooks";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";
import { MdArrowForwardIos, MdHome, MdSearch, MdUpload } from "react-icons/md";
import { FileItem } from "./FileItem";
import { FolderItem } from "./FolderItem";
import { useHookstate } from "@hookstate/core";
import { gState } from "@/lib/gatate";
import { DirId } from "@/lib/static_value";
import { FaX } from "react-icons/fa6";
import { TreePage } from "./TreePage";
import { clientLogger } from "@/util/client-logger";

type Dir = {} & Prisma.DirGetPayload<{
  select: {
    id: true;
    name: true;
    parentId: true;
    ParentDir: { select: { id: true; name: true } };
  };
}>;
export default function DirPage({ params }: { params: { id: string } }) {
  DirId.set(params.id);
  const parentId = params.id;
  const [listDir, setlistDir] = useLocalStorage<Dir[]>({
    key: "listDir_" + parentId,
    defaultValue: []
  });
  const [listFile, setlistFile] = useState<any[]>([]);
  const [selectId, setSelectId] = useState<string>("");
  const [contextMenu, setContextMenu] = useState<string>("");
  const [showRootMenu, setRootMenu] = useState<{ x: number; y: number } | null>(
    null
  );
  const [dirVal, setDirVal] = useState<Dir>();
  const { value: triggerReloadDir, set: reloadDir } = useHookstate(
    gState.reloadDirState
  );
  // const reloadDir = gState.useDirLoader(() => loadDir());
  const width = 100;
  // const [loading, setLoading] = useState(false);
  const newFileLoadingState = useHookstate(gState.newFileLoadingState);
  // const dirState = useHookstate(gState.dirState);

  useShallowEffect(() => {
    loadDir();
    if (triggerReloadDir) loadDir();
  }, [triggerReloadDir]);

  const loadDir = async () => {
    const res = await fetch(
      apies["/api/dir/[id]/list"]({ id: parentId as string }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Token.value}`
        }
      }
    );

    if (res.ok) {
      try {
        const json = (await res.json()) as { dirs: any[]; files: any[] };
        setlistDir(json.dirs);
        setlistFile(json.files);
      } catch (error) {
        clientLogger.error("Error load dir:", error);
      }
    }

    const resDir = await fetch(
      apies["/api/dir/[id]/find/dir"]({ id: parentId as string }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Token.value}`
        }
      }
    );

    if (resDir.ok) {
      try {
        const json = await resDir.json();
        setDirVal(json.data);
      } catch (error) {
        clientLogger.error("Error load dir:", error);
      }
    }
  };

  function onContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (showRootMenu) setRootMenu(null);
    !showRootMenu && setRootMenu({ x: e.clientX, y: e.clientY - 100 });
  }

  const rootClick = () => {
    // selectId && setSelectId("")
    contextMenu && setContextMenu("");
    showRootMenu && setRootMenu(null);
    // reload("rename file", false)
  };

  const onDropCapture = async (e: React.DragEvent) => {
    if (parentId === "root") {
      alert("You can't upload file to root");
      clientLogger.error("You can't upload file to root");
      return;
    }

    // setLoading(true);
    newFileLoadingState.set(true);
    try {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;
      // Jika data berupa file
      if (files.length > 0) {
        if (files.length === 1) {
          await libClient.fileUpload(files[0], parentId, () => {
            reloadDir(Math.random());
          });
          return;
        }

        await libClient.fileUploadMultiple(files, parentId, () => {
          reloadDir(Math.random());
        });
        return;
      }

      // Jika data berupa HTML gambar
      const imageHtml = e.dataTransfer.getData("text/html");

      // Gunakan DOMParser untuk mengambil element gambar
      const parser = new DOMParser();
      const doc = parser.parseFromString(imageHtml, "text/html");
      const imgElement = doc.querySelector("img");

      if (imgElement) {
        const imageUrl = imgElement.src;

        // Jika URL berupa base64 data URL
        if (imageUrl.startsWith("data:image/")) {
          const base64Data = imageUrl.split(",")[1];
          const mimeType = imageUrl.split(";")[0].split(":")[1];

          // Mengkonversi base64 menjadi blob
          const byteString = atob(base64Data);
          const arrayBuffer = new Uint8Array(byteString.length);
          for (let i = 0; i < byteString.length; i++) {
            arrayBuffer[i] = byteString.charCodeAt(i);
          }

          const blob = new Blob([arrayBuffer], { type: mimeType });
          const defaultExtension = mimeType.split("/")[1] || "png";
          const file = new File([blob], `dropped-image.${defaultExtension}`, {
            type: mimeType
          });

          // Upload file ke server
          await libClient.fileUpload(file, parentId, () => {
            reloadDir(Math.random());
          });
        } else {
          // Jika bukan base64, ambil file dari URL
          const urlSegments = imageUrl.split("/");
          let fileName =
            urlSegments[urlSegments.length - 1] || "dropped-image.png";

          // Jika nama file tidak mengandung ekstensi, tambahkan ekstensi default .png
          if (!fileName.includes(".")) {
            fileName += ".png";
          }

          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const fileExtension = blob.type.split("/")[1] || "png";

          // Pastikan file memiliki ekstensi yang sesuai
          if (!fileName.includes(".")) {
            fileName += `.${fileExtension}`;
          }

          const file = new File([blob], fileName, { type: blob.type });

          // Upload file ke server
          await libClient.fileUpload(file, parentId, async () => {
            reloadDir(Math.random());
          });
        }
      }
    } catch (error) {
      clientLogger.error("Error upload file:", error);
    } finally {
      newFileLoadingState.set(false);
      // setLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clientLogger.info("onDrop");
  };

  const onCreateNewFolder = () => {
    libClient.dirCreate(parentId, "New Folder", () => {
      reloadDir(Math.random());
    });
  };

  return (
    <Stack p="md">
      <Navbar dirVal={dirVal} />
      <Flex>
        <Stack
          w={300}
          style={{
            overflow: "auto"
          }}
        >
          <TreePage dirId={parentId} />
        </Stack>
        <Stack
          flex={1}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={onDrop}
          onDropCapture={onDropCapture}
          onClick={rootClick}
          // pos={"relative"}
          onContextMenu={onContextMenu}
          p="md"
          h={"100vh"}
          bg={"dark"}
          style={{
            border: "0.5px solid gray",
            borderRadius: "4px",
            overflowY: "auto"
          }}
        >
          <Flex gap="md" wrap="wrap">
            {listDir?.map((dir) => (
              <FolderItem
                key={dir.id}
                dir={dir as any}
                width={width}
                selectedId={selectId}
                setSelectedId={setSelectId}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                parentId={parentId}
              />
            ))}
          </Flex>
          <Flex wrap={"wrap"} gap={"md"}>
            {listFile?.map((file, k) => (
              <FileItem
                key={k}
                file={file}
                width={width}
                selectedId={selectId}
                setSelectedId={setSelectId}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                //   reload={loadDir}
              />
            ))}
            {newFileLoadingState.value && (
              <Center
                bg={"gray"}
                style={{
                  borderRadius: 8
                }}
                w={width}
                h={66}
              >
                <Loader size={"xs"} variant={"dots"} />
              </Center>
            )}
          </Flex>
          <Box
            pos={"absolute"}
            top={(showRootMenu?.y ?? 0) + 100}
            left={showRootMenu?.x}
          >
            <Menu
              opened={true}
              position="left-start"
              styles={{
                dropdown: {
                  display: showRootMenu ? "block" : "none"
                }
              }}
            >
              <Menu.Target>
                <div
                  style={{
                    width: 0,
                    height: 0
                  }}
                />
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={onCreateNewFolder}>new folder</Menu.Item>
                <UploadButton parentId={parentId} variant="button" />
              </Menu.Dropdown>
            </Menu>
          </Box>
        </Stack>
      </Flex>
    </Stack>
  );
}

// navbar
function Navbar({ dirVal }: { dirVal: Dir | undefined }) {
  return (
    <Flex gap={"md"} align={"center"} justify={"space-between"}>
      <Group>
        <ActionIcon
          variant="transparent"
          component={Link}
          href={pages["/user/dir/[id]"]({ id: "root" })}
        >
          <MdHome />
        </ActionIcon>
        {dirVal?.ParentDir && (
          <Button
            component={Link}
            href={pages["/user/dir/[id]"]({ id: dirVal.ParentDir.id })}
            variant="transparent"
            size="compact-xs"
          >
            {dirVal?.ParentDir?.name}
            <MdArrowForwardIos />
          </Button>
        )}
        {dirVal && (
          <Button variant="transparent" size="compact-xs">
            {dirVal?.name}
          </Button>
        )}
      </Group>
      {/* <Group>{loading && <Loader size={"xs"} variant={"dots"} />}</Group> */}
      <Group>
        <UploadButton parentId={dirVal?.id || null} />
        <DirSearch />
      </Group>
    </Flex>
  );
}

function UploadButton({
  parentId,
  variant = "icon"
}: {
  parentId: string | null;
  variant?: "icon" | "button";
}) {
  // const dirState = useHookstate(gState.dirState);
  // const reloadDir = gState.useDirLoader(() => {});
  const { set: reloadDir } = useHookstate(gState.reloadDirState);

  const newFileLoadingState = useHookstate(gState.newFileLoadingState);
  async function onUpload(files: File[] | null) {
    try {
      newFileLoadingState.set(true);
      if (!parentId) {
        alert("tidak bisa upload file ke root");
        clientLogger.error("tidak bisa upload file ke root");
        return;
      }

      if (!files || files.length === 0) {
        alert("tidak ada file yang dipilih");
        clientLogger.error("tidak ada file yang dipilih");
        return;
      }

      if (files.length > 0) {
        if (files.length === 1) {
          await libClient.fileUpload(files[0], parentId!, () => {
            // dirState.set(gState.random());
            reloadDir(Math.random());
          });
          return;
        }

        const dataTransfer = new DataTransfer();

        files.forEach((file) => {
          dataTransfer.items.add(file);
        });

        await libClient.fileUploadMultiple(
          dataTransfer.files,
          parentId!,
          () => {
            // dirState.set(gState.random());
            reloadDir(Math.random());
          }
        );
        return;
      }
    } catch (error) {
      clientLogger.error("Error upload:", error);
    } finally {
      // dirState.set(gState.random());
      reloadDir(Math.random());
      newFileLoadingState.set(false);
    }
  }

  return (
    <Stack gap={0}>
      <Tooltip label={"Upload"}>
        <FileButton onChange={onUpload} multiple={true}>
          {(props) =>
            variant === "icon" ? (
              <ActionIcon {...props} variant="transparent">
                <MdUpload />
              </ActionIcon>
            ) : (
              <UnstyledButton px={"xs"} {...props} variant="transparent">
                <Text fz={14}> New File</Text>
              </UnstyledButton>
            )
          }
        </FileButton>
      </Tooltip>
    </Stack>
  );
}

function DirSearch() {
  const [value, setValue] = useState("");

  async function onSearch() {
    setValue(value);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const res = await fetch(
      apies["/api/dir/[id]/search/[q]"]({
        id: DirId.value,
        q: value || "empty-search"
      }),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${Token.value}`
        }
      }
    );
    const data = await res.text();

    clientLogger.info(data);
  }

  useShallowEffect(() => {
    if (value) onSearch();
  }, [value]);
  return (
    <Stack gap={0}>
      {/* {DirId.value} */}
      <TextInput
        rightSection={
          value.length > 0 && (
            <ActionIcon
              onClick={() => setValue("")}
              variant="transparent"
              size={"xs"}
            >
              <FaX />
            </ActionIcon>
          )
        }
        value={value}
        placeholder="Search"
        onChange={(e) => setValue(e.target.value)}
        size="xs"
        leftSection={<MdSearch />}
      />
    </Stack>
  );
}
