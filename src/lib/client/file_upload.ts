import { ntf } from "@/state/use_notification";
import { Token } from "../token";
import { apis } from "../routes";

export async function fileUpload(
  file: File,
  dirId: string,
  onDone: () => void
) {
  if (!file) {
    return ntf.set({ type: "error", msg: "No file selected" });
  }

  const allowedMimeTypes = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "text/csv",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];

  // const file = form[0];

  if (!allowedMimeTypes.includes(file.type)) {
    return ntf.set({
      type: "error",
      msg: `File type not allowed. Allowed types: ${allowedMimeTypes.join(
        ", "
      )}`,
    });
  }

  if (file.size > 100 * 1024 * 1024) {
    // 100 MB
    return ntf.set({
      type: "error",
      msg: "File size too large. Max size: 100 MB",
    });
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("dirId", dirId);

  try {
    const res = await fetch(apis["/api/upload"], {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${Token.value}`,
      },
    });

    if (res.ok) {
      console.log("File uploaded successfully");
    } else {
      const errorText = await res.text();
      ntf.set({ type: "error", msg: errorText });
    }
  } catch (error) {
    ntf.set({ type: "error", msg: "Failed to upload file" });
    console.error("Upload error:", error);
  } finally {
    onDone();
  }
}
