import { ntf } from "@/state/use_notification";
import { apis } from "../routes";
import { Token } from "../token";

export async function dirDelete(dirId: string, onSuccess: () => void) {
  const res = await fetch(apis["/api/dir/[id]/delete"]({ id: dirId }), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Token.value}`,
    },
  });

  if (res.ok) {
    return onSuccess();
  }
  ntf.set({ type: "error", msg: "failed to delete dir" });
}
