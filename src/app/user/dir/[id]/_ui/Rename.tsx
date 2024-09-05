import { TextInput } from "@mantine/core";
import { useState } from "react";
import { apis } from "@/lib/routes";
import { libClient } from "@/lib/lib_client";

export function Rename({
    dirId, name, setIsRename, reload
}: {
    dirId: string;
    name: string;
    setIsRename: (v: boolean) => void;
    reload: () => void;
}) {
    const [renameForm, setRenameForm] = useState(name);
    const onRename = async () => {
        libClient.dirRename(renameForm, dirId, () => {
            reload();
            setIsRename(false);
        })
    };

    return (
        <TextInput
            onKeyDown={(e) => e.key === "Enter" && onRename()}
            size="xs"
            defaultValue={name}
            onChange={(e) => setRenameForm(e.currentTarget.value)}
        />
    );
}

