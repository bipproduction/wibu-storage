import { ntf } from "@/state/use_notification";
import { apis } from "../routes";
import { Token } from "../token";

export async function fileRename(
  newName: string,
  fileId: string,
  onSuccess: () => void
) {
  if (newName === "") return ntf.set({ type: "error", msg: "name cannot be empty" });
  const res = await fetch(apis["/api/files/[id]/rename"]({ id: fileId }), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Token.value}`,
    },
    body: JSON.stringify({ name: newName }),
  });

  if (res.ok) {
    return onSuccess();
  }
  const text = await res.text();
  return ntf.set({ type: "error", msg: text });
}
