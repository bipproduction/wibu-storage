'use client'
import { hookstate, useHookstate } from "@hookstate/core";
import { Center, Notification, Portal } from "@mantine/core";


const notifState = hookstate<{ type: "success" | "error", msg: string } | null>(null);
export function useNotification() {
    const state = useHookstate(notifState);
    return { value: state.value, set: notifState.set } as const
}

export function CustonNotification() {
    const { value, set: setValue } = useNotification();
    return <Portal style={{
        position: "fixed",
        zIndex: 9999999,
        top: 0,
        width: "100%",
    }}>
        {value && <Center>
            <Notification m={"0 auto"} onClose={() => setValue(null)} color={"orange"} title={value.type} >
                {value.msg}
            </Notification>
        </Center>}
    </Portal>
}