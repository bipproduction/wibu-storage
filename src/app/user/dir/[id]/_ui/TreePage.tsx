"use client";

import { gState } from "@/lib/gatate";
import { apies, pages } from "@/lib/routes";
import { Token } from "@/lib/token";
import { clientLogger } from "@/util/client-logger";
import { useHookstate } from "@hookstate/core";
import { Alert, Box, Flex, Loader, ScrollArea, Stack, Text, TextInput } from "@mantine/core";
import { useLocalStorage, useShallowEffect } from "@mantine/hooks";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState, useRef, useMemo } from "react";
import { AiFillFolder } from "react-icons/ai";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
import { libClient } from "@/lib/lib_client";
import { debounce } from "lodash";

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

  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const [initialLoad, setInitialLoad] = useState(true);

  async function loadTree() {
    try {
      if (loadingRef.current) return;
      loadingRef.current = true;

      setError(null);

      if (!Token.value) {
        throw new Error("Token tidak valid. Silakan login kembali.");
      }

      const res = await fetch(apies["/api/dir/[id]/tree"]({ id: "root" }), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${Token.value}`
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gagal memuat struktur folder: ${errorText}`);
      }

      const dataJson = await res.json();
      
      if (!Array.isArray(dataJson.data)) {
        throw new Error("Format data tidak valid");
      }

      setListDir(dataJson.data);

    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan saat memuat struktur folder";
      setError(message);
      clientLogger.error("Error loading tree:", error);
    } finally {
      loadingRef.current = false;
      setInitialLoad(false);
    }
  }

  const debouncedLoadTree = useMemo(
    () => debounce(loadTree, 300),
    []
  );

  useShallowEffect(() => {
    if (initialLoad) {
      loadTree();
    } else {
      debouncedLoadTree();
    }
  }, [triggerReloadDir]);

  return (
    <ScrollArea>
      {error && (
        <Alert 
          color="red" 
          title="Error" 
          onClose={() => setError(null)}
          mb="md"
        >
          {error}
        </Alert>
      )}

      {initialLoad ? (
        <Stack align="center" p="xl">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">Memuat struktur folder...</Text>
        </Stack>
      ) : (
        <Stack gap={0}>
          {listDir.length === 0 ? (
            <Text c="dimmed" ta="center" p="md">Tidak ada folder</Text>
          ) : (
            listDir.map((item) => (
              <DirItem 
                key={item.id} 
                dirs={item} 
                depth={0} 
                dirId={dirId} 
              />
            ))
          )}
        </Stack>
      )}
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
    defaultValue: true
  });

  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isRename, setIsRename] = useState(false);
  const [renameValue, setRenameValue] = useState(dirs.name);
  const { set: reloadDir } = useHookstate(gState.reloadDirState);

  // Handler untuk keyboard events
  const handleKeyDown = async (e: KeyboardEvent) => {
    try {
      if (dirId !== dirs.id) return;

      if (e.key === 'Enter' && !isRename) {
        e.preventDefault();
        setIsRename(true);
      } else if (e.key === 'Escape' && isRename) {
        setIsRename(false);
        setRenameValue(dirs.name);
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
  }, [dirId, isRename, dirs.name]);

  const handleToggle = (e: React.MouseEvent) => {
    try {
      e.stopPropagation();
      if (!isRename) {
        setIsOpen(!isOpen);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengubah status folder";
      setError(message);
      clientLogger.error("Error toggling folder:", error);
    }
  };

  const handleRename = async () => {
    try {
      if (!renameValue.trim()) {
        throw new Error("Nama folder tidak boleh kosong");
      }

      await libClient.dirRename(renameValue, dirs.id, () => {
        setIsRename(false);
        reloadDir(Math.random());
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengubah nama folder";
      setError(message);
      clientLogger.error("Error renaming folder:", error);
    }
  };

  return (
    <Box>
      {error && (
        <Alert 
          color="red" 
          title="Error" 
          onClose={() => setError(null)}
          mb="xs"
        >
          {error}
        </Alert>
      )}

      <Flex
        align="center"
        px="xs"
        py={2}
        style={{ 
          cursor: 'pointer',
          backgroundColor: dirId === dirs.id ? 'var(--mantine-color-blue-7)' : 
                          isHovered ? 'var(--mantine-color-dark-5)' : 'transparent',
          opacity: error ? 0.7 : 1,
          transition: 'background-color 150ms ease'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleToggle}
      >
        <Box style={{ width: depth * 20 }} />
        
        <Flex align="center" gap={4}>
          {dirs.children && dirs.children.length > 0 ? (
            <Box 
              style={{ 
                color: 'var(--mantine-color-gray-5)',
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isOpen ? (
                <MdKeyboardArrowDown size={18} />
              ) : (
                <MdKeyboardArrowRight size={18} />
              )}
            </Box>
          ) : (
            <Box style={{ width: 18 }} />
          )}

          <AiFillFolder 
            size={16}
            style={{
              color: dirId === dirs.id ? '#fff' : error ? '#666' : '#E3A400',
              marginRight: 4
            }}
          />

          {isRename && dirId === dirs.id ? (
            <TextInput
              size="xs"
              value={renameValue}
              onChange={(e) => setRenameValue(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleRename();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setIsRename(false);
                  setRenameValue(dirs.name);
                }
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
              onBlur={() => {
                setIsRename(false);
                setRenameValue(dirs.name);
              }}
              autoFocus
              styles={{
                input: {
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: dirId === dirs.id ? '#fff' : 'inherit',
                  padding: 0,
                  height: 'auto',
                  minHeight: 0,
                  '&:focus': {
                    border: 'none',
                    outline: 'none'
                  }
                }
              }}
            />
          ) : (
            <Text
              component={Link}
              href={pages["/user/dir/[id]"]({ id: dirs.id })}
              style={{ 
                color: dirId === dirs.id ? '#fff' : 'inherit',
                textDecoration: 'none',
                fontSize: '0.875rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                opacity: error ? 0.7 : 1
              }}
              title={dirs.name}
            >
              {dirs.name}
            </Text>
          )}
        </Flex>
      </Flex>

      {isOpen && dirs.children && dirs.children.length > 0 && (
        <Box>
          {dirs.children.map((child) => (
            <DirItem
              dirId={dirId}
              key={child.id}
              dirs={child}
              depth={depth + 1}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
