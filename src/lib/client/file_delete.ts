import { ntf } from "@/state/use_notification";
import { Token } from "../token";

export async function fileDelete(fileId: string, onSuccess: () => void) {
  const res = await fetch(`/api/files/${fileId}/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Token.value}`,
    },
  });
  if (res.ok) {
    return onSuccess();
  }
  const text = await res.text();
  ntf.set({ type: "error", msg: text });
}
