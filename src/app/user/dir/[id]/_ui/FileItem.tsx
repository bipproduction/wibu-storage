"use client";
import { libClient } from "@/lib/lib_client";
import { apies } from "@/lib/routes";
import { clientLogger } from "@/util/client-logger";
import {
  Box,
  Center,
  Image,
  Loader,
  Menu,
  Paper,
  Stack,
  Text,
  TextInput,
  Alert
} from "@mantine/core";
import { Prisma } from "@prisma/client";
import { useState, useEffect } from "react";
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

// Tambahkan validasi nama file
const validateFileName = (name: string) => {
  if (!name.trim()) {
    throw new Error("Nama file tidak boleh kosong");
  }
  
  // Cek karakter yang tidak valid
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
  if (invalidChars.test(name)) {
    throw new Error("Nama file mengandung karakter yang tidak valid");
  }

  // Maksimal panjang nama file
  if (name.length > 255) {
    throw new Error("Nama file terlalu panjang (maksimal 255 karakter)");
  }

  return true;
};

export function FileItem({
  file,
  width,
  selectedId,
  setSelectedId,
  contextMenu,
  setContextMenu,
  reloadDir
}: {
    file: Prisma.FilesGetPayload<{
      select: { id: true; name: true; ext: true; mime: true };
    }>;
    width: number;
    selectedId: string;
    setSelectedId: (v: string) => void;
    contextMenu: string;
    setContextMenu: (v: string) => void;
    reloadDir: () => void;
  }) {
  const [isRename, setIsRename] = useState(false);
  const [renameValue, setRenameValue] = useState<string>(file.name);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Tambahkan handler untuk keydown global
  const handleKeyDown = async (e: KeyboardEvent) => {
    try {
      // Hanya proses jika file ini sedang dipilih
      if (selectedId !== file.id) return;

      if (e.key === 'Enter' && !isRename) {
        e.preventDefault();
        setIsRename(true);
      } else if (e.key === 'Escape' && isRename) {
        setIsRename(false);
        setRenameValue(file.name); // Reset ke nama asli
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan saat memproses keyboard";
      setError(message);
      clientLogger.error("Error handling keyboard:", error);
    }
  };

  // Tambahkan dan hapus event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedId, isRename, file.name]);

  // Modifikasi fungsi onClick untuk menangani single click
  function onClick(id: string) {
    try {
      setError(null);
      setSelectedId(id);
      setContextMenu(""); 
      
      // Jika mengklik file yang berbeda, tutup mode rename
      if (selectedId !== id) {
        setIsRename(false);
        setRenameValue(file.name);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan";
      setError(message);
      clientLogger.error("Error onClick:", error);
    }
  }

  async function onDoubleClick(id: string) {
    try {
      setError(null);
      const response = await fetch(apies["/api/files/[id]"]({ id }));
      
      if (!response.ok) {
        throw new Error(`Gagal membuka file: ${response.statusText}`);
      }
      
      window.open(apies["/api/files/[id]"]({ id }), "_blank");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal membuka file";
      setError(message);
      clientLogger.error("Error opening file:", error);
    }
  }

  function onContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(contextMenu === file.id ? "" : file.id); // Toggle context menu
  }

  async function onRename() {
    try {
      setError(null);
      setLoading(true);

      // Validasi nama file
      validateFileName(renameValue);

      await libClient.fileRename(renameValue, file.id, () => {
        setIsRename(false);
        reloadDir();
      });
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengubah nama file";
      setError(message);
      clientLogger.error("Error renaming file:", error);
    } finally {
      setLoading(false);
    }
  }

  const onDelete = async () => {
    try {
      setError(null);
      setLoading(true);

      const confirmed = window.confirm("Apakah Anda yakin ingin menghapus file ini?");
      if (!confirmed) return;

      await libClient.fileDelete(file.id, () => {
        setContextMenu("");
        alert("File berhasil dihapus");
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus file";
      setError(message);
      clientLogger.error("Error deleting file:", error);
    } finally {
      setLoading(false);
    }
  };

  const onCopy = async () => {
    try {
      setError(null);
      const host = window.location.origin;
      const url = host + apies["/api/files/[id]"]({ id: file.id });
      
      await navigator.clipboard.writeText(url);
      setContextMenu("");
      alert("URL file berhasil disalin");

    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menyalin URL file";
      setError(message);
      clientLogger.error("Error copying URL:", error);
    }
  };

  // const onDownload = () => {
  //   const fileUrl = "https://example.com/file.pdf"; // Ganti dengan URL file yang ingin diunduh
  //   const link = document.createElement("a");
  //   link.href = fileUrl;
  //   link.download = "file.pdf"; // Nama file yang akan diunduh
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  return (
    <Stack>
      {error && (
        <Alert color="red" title="Error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        onRename();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        setIsRename(false);
                        setRenameValue(file.name);
                      }
                    }}
                    size="xs"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.currentTarget.value)}
                    onBlur={() => {
                      // Batalkan rename jika user click di luar
                      setIsRename(false);
                      setRenameValue(file.name);
                    }}
                    autoFocus
                  />
                ) : (
                  <Text
                    style={{
                      wordBreak: "break-word",
                      lineBreak: "anywhere",
                      cursor: "text" // Tambahkan cursor text untuk indikasi bisa diedit
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

            {loading && (
              <Center 
                pos="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="rgba(0,0,0,0.5)"
              >
                <Loader size="sm" />
              </Center>
            )}
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
            href={apies["/api/files/[id]"]({ id: file.id })}
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
        src={apies["/api/files/[id]"]({ id: file.id }) + "-size-100"}
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
