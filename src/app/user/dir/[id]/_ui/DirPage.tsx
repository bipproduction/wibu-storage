"use client";

import { libClient } from "@/lib/lib_client";
import { apis, pages } from "@/lib/routes";
import { Token } from "@/lib/token";
import { ActionIcon, Box, Button, Center, Flex, Group, Loader, Menu, Stack } from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { MdArrowBackIos, MdArrowForwardIos, MdHome } from "react-icons/md";
import { FileItem } from "./FileItem";
import { FolderItem } from "./FolderItem";
import { Prisma } from "@prisma/client";
import { ntf } from "@/state/use_notification";

type Dir = {} & Prisma.DirGetPayload<{ select: { id: true, name: true, parentId: true, ParentDir: { select: { id: true, name: true } } } }>
export default function DirPage({ params }: { params: { id: string } }) {
    const parentId = params.id;
    const [listDir, setlistDir] = useState<any[]>([]);
    const [listFile, setlistFile] = useState<any[]>([]);
    const [selectId, setSelectId] = useState<string>("");
    const [contextMenu, setContextMenu] = useState<string>("");
    const [showRootMenu, setRootMenu] = useState<{ x: number, y: number } | null>(null);
    const [dirVal, setDirVal] = useState<Dir>()
    const router = useRouter()
    const width = 100;
    const [loading, setLoading] = useState(false);

    const loadDir = async () => {
        const res = await fetch(apis["/api/dir/[id]/list"]({ id: parentId as string }), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Token.value}`
            }
        })

        if (res.ok) {

            try {
                const json = await res.json() as { dirs: any[], files: any[] }
                setlistDir(json.dirs)
                setlistFile(json.files)
            } catch (error) {
                console.log(error)
            }
        }

        const resDir = await fetch(apis["/api/dir/[id]/find"]({ id: parentId as string }), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Token.value}`
            }
        })

        if (resDir.ok) {
            try {
                const json = await resDir.json() as Dir
                setDirVal(json)
            } catch (error) {
                console.log(error)
            }
        }
    }

    useShallowEffect(() => {
        loadDir()
    }, [])


    function onContextMenu(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (showRootMenu) setRootMenu(null)
        !showRootMenu && setRootMenu({ x: e.clientX, y: e.clientY - 100 })
    }


    const rootClick = () => {
        // selectId && setSelectId("")
        contextMenu && setContextMenu("")
        showRootMenu && setRootMenu(null)
    }

    const onDropCapture = async (e: React.DragEvent) => {
        if (parentId === "root") return ntf.set({ type: "error", msg: "Cannot upload file to root" })
        setLoading(true)
        try {
            e.preventDefault();
            e.stopPropagation();

            const files = e.dataTransfer.files;
            // Jika data berupa file
            if (files.length > 0) {
                if (files.length === 1) {
                    await libClient.fileUpload(files[0], parentId, () => {
                        loadDir();
                    });
                    return;
                }

                await libClient.fileUploadMultiple(files, parentId, () => {
                    loadDir();
                });
                return
            }

            // Jika data berupa HTML gambar
            const imageHtml = e.dataTransfer.getData('text/html');

            // Gunakan DOMParser untuk mengambil elemen gambar
            const parser = new DOMParser();
            const doc = parser.parseFromString(imageHtml, 'text/html');
            const imgElement = doc.querySelector('img');

            if (imgElement) {
                const imageUrl = imgElement.src;

                // Jika URL berupa base64 data URL
                if (imageUrl.startsWith('data:image/')) {
                    const base64Data = imageUrl.split(',')[1];
                    const mimeType = imageUrl.split(';')[0].split(':')[1];

                    // Mengkonversi base64 menjadi blob
                    const byteString = atob(base64Data);
                    const arrayBuffer = new Uint8Array(byteString.length);
                    for (let i = 0; i < byteString.length; i++) {
                        arrayBuffer[i] = byteString.charCodeAt(i);
                    }

                    const blob = new Blob([arrayBuffer], { type: mimeType });
                    const defaultExtension = mimeType.split('/')[1] || 'png';
                    const file = new File([blob], `dropped-image.${defaultExtension}`, { type: mimeType });

                    // Upload file ke server
                    await libClient.fileUpload(file, parentId, () => {
                        loadDir();
                    });

                } else {
                    // Jika bukan base64, ambil file dari URL
                    const urlSegments = imageUrl.split('/');
                    let fileName = urlSegments[urlSegments.length - 1] || 'dropped-image.png';

                    // Jika nama file tidak mengandung ekstensi, tambahkan ekstensi default .png
                    if (!fileName.includes('.')) {
                        fileName += '.png';
                    }

                    const response = await fetch(imageUrl);
                    const blob = await response.blob();
                    const fileExtension = blob.type.split('/')[1] || 'png';

                    // Pastikan file memiliki ekstensi yang sesuai
                    if (!fileName.includes('.')) {
                        fileName += `.${fileExtension}`;
                    }

                    const file = new File([blob], fileName, { type: blob.type });

                    // Upload file ke server
                    await libClient.fileUpload(file, parentId, async () => {
                        await loadDir();
                    });
                }
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("drop")
    }

    const onCreateNewFolder = () => {
        libClient.dirCreate(parentId, "New Folder", () => {
            loadDir()
        })
    }

    return (
        <Stack p="md">
            <Flex gap={"md"} align={"center"} justify={"space-between"}>
                <Group>
                    <ActionIcon variant="transparent" component={Link} href={pages["/user/dir/[id]"]({ id: "root" })}>
                        <MdHome />
                    </ActionIcon>
                    <ActionIcon variant="transparent" onClick={() => router.back()}>
                        <MdArrowBackIos />
                    </ActionIcon>
                    {dirVal?.ParentDir && <Button component={Link} href={pages["/user/dir/[id]"]({ id: dirVal.ParentDir.id })} variant="transparent" size="compact-xs">{dirVal?.ParentDir?.name}<MdArrowForwardIos /></Button>}
                    {dirVal && <Button variant="transparent" size="compact-xs">{dirVal?.name}</Button>}
                </Group>
                <Group>
                    {loading && <Loader size={"xs"} variant={"dots"} />}
                </Group>
            </Flex>
            <Stack onDragOver={e => {
                e.preventDefault();
                e.stopPropagation();
                // console.log(e.dataTransfer)
            }} onDrop={onDrop} onDropCapture={onDropCapture} onClick={rootClick} pos={"relative"} onContextMenu={onContextMenu} p="md" h={"100vh"} style={{
                border: "0.5px solid gray",
                borderRadius: "4px",
            }}>
                <Flex gap="md" wrap="wrap">
                    {listDir?.map(dir => (
                        <FolderItem
                            key={dir.id}
                            dir={dir}
                            width={width}
                            selectedId={selectId}
                            setSelectedId={setSelectId}
                            contextMenu={contextMenu}
                            setContextMenu={setContextMenu}
                            reload={loadDir}
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
                            reload={loadDir}
                        />
                    ))}
                    {loading && <Center
                        bg={"gray"}
                        style={{
                            borderRadius: 8
                        }} w={width} h={66}>
                        <Loader size={"xs"} variant={"dots"} />
                    </Center>}
                </Flex>
                <Box pos={"absolute"} top={showRootMenu?.y} left={showRootMenu?.x} >
                    <Menu opened={true} position="left-start" styles={{
                        dropdown: {
                            display: showRootMenu ? "block" : "none"
                        }
                    }} >
                        <Menu.Target>
                            <div style={{
                                width: 0,
                                height: 0
                            }} />
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item onClick={onCreateNewFolder}>
                                new folder
                            </Menu.Item>
                            <Menu.Item>
                                new file
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Box>
            </Stack>
        </Stack>
    );
}
