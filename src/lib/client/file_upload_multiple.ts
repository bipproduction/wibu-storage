import { ntf } from "@/state/use_notification";
import { Token } from "../token";
import { apies } from "../routes";

export async function fileUploadMultiple(
  files: FileList,
  dirId: string,
  onDone: () => void
) {
  if (!files || files.length === 0) {
    return ntf.set({ type: "error", msg: "No files selected" });
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

  const maxFileSize = 100 * 1024 * 1024; // 100 MB

  // Validate each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (!allowedMimeTypes.includes(file.type)) {
      return ntf.set({
        type: "error",
        msg: `File type not allowed. Allowed types: ${allowedMimeTypes.join(
          ", "
        )}`,
      });
    }

    if (file.size > maxFileSize) {
      return ntf.set({
        type: "error",
        msg: "File size too large. Max size: 100 MB",
      });
    }
  }

  const formData = new FormData();

  // Append each file to formData
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }
  formData.append("dirId", dirId);

  try {
    const res = await fetch(apies["/api/upload-multiple"], {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${Token.value}`,
      },
    });

    if (res.ok) {
      console.log("Files uploaded successfully");
    } else {
      const errorText = await res.text();
      ntf.set({ type: "error", msg: errorText });
    }
  } catch (error) {
    ntf.set({ type: "error", msg: "Failed to upload files" });
    console.error("Upload error:", error);
  } finally {
    onDone();
  }
}
