"use client";

import { gState } from "@/lib/gatate";
import { libClient } from "@/lib/lib_client";
import { apies, pages } from "@/lib/routes";
import { DirId } from "@/lib/static_value";
import { Token } from "@/lib/token";
import { clientLogger } from "@/util/client-logger";
import { useHookstate } from "@hookstate/core";
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  FileButton,
  Flex,
  Group,
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
import { useCallback, useRef, useState } from "react";
import { FaX } from "react-icons/fa6";
import { MdArrowForwardIos, MdHome, MdSearch, MdUpload } from "react-icons/md";
import { FileItem } from "./FileItem";
import { FolderItem } from "./FolderItem";
import { TreePage } from "./TreePage";

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
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragEndPos, setDragEndPos] = useState({ x: 0, y: 0 });
  const itemPositionsRef = useRef(new Map<string, DOMRect>());

  useShallowEffect(() => {
    loadDir();
    if (triggerReloadDir) loadDir();
  }, [triggerReloadDir]);

  const loadDir = async () => {
    try {
      setError(null); // Reset error state

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

      if (!res.ok) {
        throw new Error(`Failed to load directory: ${res.statusText}`);
      }

      const json = (await res.json()) as { dirs: any[]; files: any[] };
      setlistDir(json.dirs);
      setlistFile(json.files);

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

      if (!resDir.ok) {
        throw new Error(`Failed to find directory: ${resDir.statusText}`);
      }

      const dirJson = await resDir.json();
      setDirVal(dirJson.data);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat direktori';
      setError(message);
      clientLogger.error("Error loading directory:", error);
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
    try {
      if (parentId === "root") {
        throw new Error("Tidak dapat mengunggah file ke root direktori");
      }

      newFileLoadingState.set(true);
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;

      if (files.length > 0) {
        // Validasi ukuran file
        const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
        for (let i = 0; i < files.length; i++) {
          if (files[i].size > MAX_FILE_SIZE) {
            throw new Error(`File ${files[i].name} terlalu besar. Maksimal 100MB`);
          }
        }

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

      // Penanganan drag & drop gambar
      const imageHtml = e.dataTransfer.getData("text/html");
      if (!imageHtml) {
        throw new Error("Format file tidak didukung");
      }

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
      const message = error instanceof Error ? error.message : 'Gagal mengunggah file';
      alert(message);
      clientLogger.error("Error upload file:", error);
    } finally {
      newFileLoadingState.set(false);
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click only
      e.preventDefault(); // Prevent text selection
      setIsDragging(true);
      setDragStartPos({ x: e.clientX, y: e.clientY });
      setDragEndPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newEndPos = { x: e.clientX, y: e.clientY };
      setDragEndPos(newEndPos);

      const selectionArea = {
        left: Math.min(dragStartPos.x, newEndPos.x),
        right: Math.max(dragStartPos.x, newEndPos.x),
        top: Math.min(dragStartPos.y, newEndPos.y),
        bottom: Math.max(dragStartPos.y, newEndPos.y)
      };

      const newSelected = new Set<string>();
      itemPositionsRef.current.forEach((rect, id) => {
        if (
          rect.left < selectionArea.right &&
          rect.right > selectionArea.left &&
          rect.top < selectionArea.bottom &&
          rect.bottom > selectionArea.top
        ) {
          newSelected.add(id);
        }
      });

      setSelectedItems(newSelected);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return;

    const confirmed = window.confirm(`Hapus ${selectedItems.size} item yang dipilih?`);
    if (!confirmed) return;

    try {
      for (const id of Array.from(selectedItems)) {
        const isFile = listFile.some(file => file.id === id);
        if (isFile) {
          await libClient.fileDelete(id, () => { });
        } else {
          await libClient.dirDelete(id, () => { });
        }
      }

      setSelectedItems(new Set());
      reloadDir(Math.random());
      alert("Items berhasil dihapus");
    } catch (error) {
      alert("Gagal menghapus beberapa item");
      clientLogger.error("Error deleting items:", error);
    }
  };

  const updateItemPosition = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      const rect = element.getBoundingClientRect();
      itemPositionsRef.current.set(id, rect);
    }
  }, []);

  return (
    <Stack p="md">
      <Navbar dirVal={dirVal} />

      {error && (
        <Alert color="red" title="Error">
          {error}
        </Alert>
      )}

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
          pos="relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={onDrop}
          onDropCapture={onDropCapture}
          onClick={rootClick}
          onContextMenu={onContextMenu}
          p="md"
          h={"100vh"}
          bg={"dark"}
          style={{
            border: "0.5px solid gray",
            borderRadius: "4px",
            overflowY: "auto",
            userSelect: "none"
          }}
        >
          {isDragging && (
            <Box
              pos="fixed"
              style={{
                left: Math.min(dragStartPos.x, dragEndPos.x),
                top: Math.min(dragStartPos.y, dragEndPos.y),
                width: Math.abs(dragEndPos.x - dragStartPos.x),
                height: Math.abs(dragEndPos.y - dragStartPos.y),
                border: '1px solid var(--mantine-color-blue-5)',
                backgroundColor: 'rgba(51, 122, 183, 0.1)',
                pointerEvents: 'none',
                zIndex: 1000
              }}
            />
          )}

          {showRootMenu && (
            <Menu opened={true} position="bottom-start">
              <Menu.Dropdown>
                <Menu.Item onClick={onCreateNewFolder}>New Folder</Menu.Item>
                {selectedItems.size > 0 && (
                  <Menu.Item
                    onClick={handleDeleteSelected}
                    color="red"
                  >
                    Delete Selected ({selectedItems.size})
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          )}

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
                isSelected={selectedItems.has(dir.id)}
                onSelect={() => {
                  const newSelected = new Set(selectedItems);
                  if (newSelected.has(dir.id)) {
                    newSelected.delete(dir.id);
                  } else {
                    newSelected.add(dir.id);
                  }
                  setSelectedItems(newSelected);
                }}
                ref={(el) => el && updateItemPosition(dir.id, el)}
                selectedItemsCount={selectedItems.size}
                onDeleteSelected={handleDeleteSelected}
              />
            ))}
            {listFile?.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                width={width}
                selectedId={selectId}
                setSelectedId={setSelectId}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                reloadDir={() => reloadDir(Math.random())}
                isSelected={selectedItems.has(file.id)}
                onSelect={() => {
                  const newSelected = new Set(selectedItems);
                  if (newSelected.has(file.id)) {
                    newSelected.delete(file.id);
                  } else {
                    newSelected.add(file.id);
                  }
                  setSelectedItems(newSelected);
                }}
                ref={(el) => el && updateItemPosition(file.id, el)}
                selectedItemsCount={selectedItems.size}
                onDeleteSelected={handleDeleteSelected}
              />
            ))}
          </Flex>
        </Stack>
      </Flex>

      <SelectionInfo count={selectedItems.size} />
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
        <UploadButton parentId={dirVal?.id || null} variant="button" />
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
      if (!files?.length) {
        throw new Error("Tidak ada file yang dipilih");
      }

      if (!parentId) {
        throw new Error("Tidak bisa upload file ke root direktori");
      }

      newFileLoadingState.set(true);

      // Validasi ukuran file
      const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
      files.forEach(file => {
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`File ${file.name} terlalu besar. Maksimal 100MB`);
        }
      });

      if (files.length === 1) {
        await libClient.fileUpload(files[0], parentId, () => {
          reloadDir(Math.random());
        });
        return;
      }

      const dataTransfer = new DataTransfer();
      files.forEach((file) => {
        dataTransfer.items.add(file);
      });

      await libClient.fileUploadMultiple(dataTransfer.files, parentId, () => {
        reloadDir(Math.random());
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal mengunggah file';
      alert(message);
      clientLogger.error("Error upload:", error);
    } finally {
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

function SelectionInfo({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <Box
      pos="fixed"
      bottom={20}
      right={20}
      p="xs"
      style={{
        backgroundColor: 'var(--mantine-color-blue-7)',
        borderRadius: '4px',
        color: 'white',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}
    >
      {count} item dipilih
    </Box>
  );
}
