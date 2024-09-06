import { ntf } from "@/state/use_notification";
import { apis } from "../routes";
import { Token } from "../token";

export async function dirRename(
  newName: string,
  dirId: string,
  onSuccess: () => void
) {
  if (newName === "") return ntf.set({ type: "error", msg: "name cannot be empty" });
  const res = await fetch(apis["/api/dir/[id]/rename"]({ id: dirId }), {
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
  return ntf.set({ type: "error", msg: "failed to rename dir" });
}
