import { TextInput } from "@mantine/core";
import { useState } from "react";
import { apis } from "@/lib/routes";
import { libClient } from "@/lib/lib_client";
import { useHookstate } from "@hookstate/core";
import { gState } from "@/lib/gatate";

export function Rename({
    dirId, name, setIsRename
}: {
    dirId: string;
    name: string;
    setIsRename: (v: boolean) => void;

}) {
    const [renameForm, setRenameForm] = useState(name);
    // const disrState = useHookstate(gState.dirState);
    const {set: reloadDir} = useHookstate(gState.reloadDirState);
    const onRename = async () => {
        libClient.dirRename(renameForm, dirId, () => {
            setIsRename(false);
            // disrState.set(gState.random());
            reloadDir(Math.random());
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

