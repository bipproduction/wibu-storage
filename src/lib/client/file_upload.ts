import { Token } from "../token";
import { apies } from "../routes";
import { clientLogger } from "@/util/client-logger";

export async function fileUpload(
  file: File,
  dirId: string,
  onDone: () => void
) {
  if (!file) {
    alert("tidak ada file yang dipilih");
    clientLogger.error("tidak ada file yang dipilih");
    return;
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
    "text/plain"
  ];

  // const file = form[0];

  if (!allowedMimeTypes.includes(file.type)) {
    alert("File type not allowed");
    clientLogger.error("File type not allowed");
    return;
  }

  if (file.size > 100 * 1024 * 1024) {
    alert("File size too large");
    clientLogger.error("File size too large");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("dirId", dirId);

  try {
    const res = await fetch(apies["/api/upload"], {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${Token.value}`
      }
    });

    if (res.ok) {
      clientLogger.info("File uploaded successfully");
    } else {
      const errorText = await res.text();
      alert("Failed to upload file: " + errorText);
      clientLogger.error(errorText);
    }
  } catch (error) {
    alert("Failed to upload file" + error);
    clientLogger.error("Failed to upload file", error);
  } finally {
    onDone();
  }
}
