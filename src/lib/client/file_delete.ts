import { Token } from "../token";
import { clientLogger } from "@/util/client-logger";

export async function fileDelete(fileId: string, onSuccess: () => void) {
  const res = await fetch(`/api/files/${fileId}/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Token.value}`,
    },
  });
  if (res.ok) {
    clientLogger.info("file delete success");
    return onSuccess();
  }
  const text = await res.text();
  clientLogger.error(text);
  alert(text);
}
