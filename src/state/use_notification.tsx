'use client'
import { hookstate, useHookstate } from "@hookstate/core";
import { Center, Notification, Portal } from "@mantine/core";
import { useEffect } from "react";
import { FaInfoCircle } from "react-icons/fa";

// export const ntf = hookstate<{ type?: "success" | "error", msg: string, autoClose?: boolean } | null>(null);
// export function useNotification() {
//     const state = useHookstate(ntf);
//     return { value: state.value, set: ntf.set } as const
// }

// export function CustonNotification() {
//     const { value, set: setValue } = useNotification();
//     useEffect(() => {
//         if (value && (value.autoClose ?? true)) {
//             const timer = setTimeout(() => {
//                 setValue(null);
//             }, 3000); // 3 seconds

//             return () => clearTimeout(timer); // Clear the timer if the component is unmounted
//         }
//     }, [value, setValue]);

//     return <Portal style={{
//         position: "fixed",
//         zIndex: 9999999,
//         top: 0,
//         width: "100%",
//     }}>
//         {value && <Center pos={"relative"} top={100}>
//             <Notification
//                 icon={<FaInfoCircle />}
//                 miw={460}
//                 m={"0 auto"}
//                 onClose={() => setValue(null)}
//                 color={"orange"}
//                 title={value.type || "success"} >
//                 {value.msg}
//             </Notification>
//         </Center>}
//     </Portal>
// }
