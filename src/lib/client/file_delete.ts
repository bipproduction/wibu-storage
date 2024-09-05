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
  alert(await res.text());
}
