import { apies } from "../routes";
import { Token } from "../token";
import { clientLogger } from "@/util/client-logger";

export async function dirDelete(dirId: string, onSuccess: () => void) {
  const res = await fetch(apies["/api/dir/[id]/delete"]({ id: dirId }), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Token.value}`
    }
  });

  if (res.ok) {
    clientLogger.info("dir delete success");
    return onSuccess();
  }
  const error = await res.text();
  clientLogger.error(error);
  alert(error);
}
