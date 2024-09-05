import { apis } from "../routes";
import { Token } from "../token";

export async function dirCreate(parentId: string, name: string, onSuccess: () => void) {
  if (name === "") return alert("name can't be empty");
  const res = await fetch(apis["/api/dir/[id]/create"]({ id: parentId }), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Token.value}`,
    },
    body: JSON.stringify({ name }),
  });
  if (res.ok) {
    return onSuccess();
  }
  alert(await res.text());
}
