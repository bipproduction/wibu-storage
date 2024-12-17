import { libClient } from "@/lib/lib_client";
import { pages } from "@/lib/routes";
import { Box, Menu, Paper, Stack, Text, TextInput, Alert } from "@mantine/core";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MdDelete, MdEdit, MdFolder, MdOpenInNew } from "react-icons/md";
import { useHookstate } from "@hookstate/core";
import { gState } from "@/lib/gatate";
import { useRouter } from "next/navigation";
import { clientLogger } from "@/util/client-logger";

// Validasi nama folder
const validateFolderName = (name: string) => {
  if (!name.trim()) {
    throw new Error("Nama folder tidak boleh kosong");
  }
  
  // Cek karakter yang tidak valid
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
  if (invalidChars.test(name)) {
    throw new Error("Nama folder mengandung karakter yang tidak valid");
  }

  // Maksimal panjang nama folder
  if (name.length > 255) {
    throw new Error("Nama folder terlalu panjang (maksimal 255 karakter)");
  }

  return true;
};

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
  const router = useRouter();
  const [isRename, setIsRename] = useState(false);
  const [renameValue, setRenameValue] = useState(dir.name);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { set: reloadDir } = useHookstate(gState.reloadDirState);

  // Handler untuk keyboard events
  const handleKeyDown = async (e: KeyboardEvent) => {
    try {
      // Hanya proses jika folder ini sedang dipilih
      if (selectedId !== dir.id) return;

      if (e.key === 'Enter' && !isRename) {
        e.preventDefault();
        setIsRename(true);
      } else if (e.key === 'Escape' && isRename) {
        setIsRename(false);
        setRenameValue(dir.name); // Reset ke nama asli
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan saat memproses keyboard";
      setError(message);
      clientLogger.error("Error handling keyboard:", error);
    }
  };

  // Event listener untuk keyboard
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedId, isRename, dir.name]);

  const onClick = () => {
    try {
      setError(null);
      setSelectedId(dir.id);
      setContextMenu("");
      if (selectedId !== dir.id) {
        setIsRename(false);
        setRenameValue(dir.name);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan";
      setError(message);
      clientLogger.error("Error onClick:", error);
    }
  };

  const onContextMenu = (e: React.MouseEvent) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu(contextMenu === dir.id ? "" : dir.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan";
      setError(message);
      clientLogger.error("Error context menu:", error);
    }
  };

  const onDoubleClick = () => {
    try {
      router.push(pages["/user/dir/[id]"]({ id: dir.id }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal membuka folder";
      setError(message);
      clientLogger.error("Error opening folder:", error);
    }
  };

  const onCreate = async () => {
    try {
      setLoading(true);
      setError(null);
      await libClient.dirCreate(parentId, "new folder", () => {
        setContextMenu("");
        reloadDir(Math.random());
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal membuat folder baru";
      setError(message);
      clientLogger.error("Error creating folder:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRename = async () => {
    try {
      setError(null);
      setLoading(true);

      // Validasi nama folder
      validateFolderName(renameValue);

      await libClient.dirRename(renameValue, dir.id, () => {
        setIsRename(false);
        reloadDir(Math.random());
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengubah nama folder";
      setError(message);
      clientLogger.error("Error renaming folder:", error);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setError(null);
      setLoading(true);

      const confirmed = window.confirm("Apakah Anda yakin ingin menghapus folder ini?");
      if (!confirmed) return;

      await libClient.dirDelete(dir.id, () => {
        setContextMenu("");
        reloadDir(Math.random());
        alert("Folder berhasil dihapus");
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus folder";
      setError(message);
      clientLogger.error("Error deleting folder:", error);
    } finally {
      setLoading(false);
    }
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
          <Stack gap={"xs"} align="center" justify="end">
            {error && (
              <Alert color="red" title="Error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            
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
                <TextInput
                  size="xs"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onRename();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      setIsRename(false);
                      setRenameValue(dir.name);
                    }
                  }}
                  onBlur={() => {
                    setIsRename(false);
                    setRenameValue(dir.name);
                  }}
                  autoFocus
                />
              ) : (
                <Text
                  style={{
                    wordBreak: "break-word",
                    lineBreak: "anywhere",
                    cursor: "text"
                  }}
                  pos={"relative"}
                  c="white"
                  lineClamp={2}
                  ta={"center"}
                  fz="12"
                >
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
