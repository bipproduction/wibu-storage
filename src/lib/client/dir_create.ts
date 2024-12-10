import { apies } from "../routes";
import { Token } from "../token";
import { clientLogger } from "@/util/client-logger";

export async function dirCreate(
  parentId: string,
  name: string,
  onSuccess: () => void
) {
  if (name === "") {
    alert("Please fill all the fields");
    clientLogger.error("Please fill all the fields");
    return;
  }
 
  const res = await fetch(apies["/api/dir/[id]/create"]({ id: parentId }), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Token.value}`,
    },
    body: JSON.stringify({ name }),
  });
  if (res.ok) {
    clientLogger.info("dir create success");
    return onSuccess();
  }
  const text = await res.text();
  clientLogger.error(text);
}
