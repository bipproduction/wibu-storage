import { apis } from "../routes";
import { Token } from "../token";

export async function fileRename(
  newName: string,
  fileId: string,
  onSuccess: () => void
) {
  if (newName === "") return alert("name can't be empty");
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
  return alert(await res.text());
}
