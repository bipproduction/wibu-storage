import { apies } from "../routes";
import { Token } from "../token";
import { clientLogger } from "@/util/client-logger";

export async function dirRename(
  newName: string,
  dirId: string,
  onSuccess: () => void
) {
  if (newName === "") {
    alert("Please fill all the fields");
    clientLogger.error("Please fill all the fields");
    return; 
  }
  const res = await fetch(apies["/api/dir/[id]/rename"]({ id: dirId }), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Token.value}`,
    },
    body: JSON.stringify({ name: newName }),
  });

  if (res.ok) {
    clientLogger.info("dir rename success");
    return onSuccess();
  }
  const text = await res.text();
  clientLogger.error(text);
  alert(text);
}
