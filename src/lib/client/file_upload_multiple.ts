import { Token } from "../token";
import { apies } from "../routes";
import { clientLogger } from "@/util/client-logger";

export async function fileUploadMultiple(
  files: FileList,
  dirId: string,
  onDone: () => void
) {
  if (!files || files.length === 0) {
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
    "text/plain",
  ];

  const maxFileSize = 100 * 1024 * 1024; // 100 MB

  // Validate each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (!allowedMimeTypes.includes(file.type)) {
      alert(
        `File type not allowed. Allowed types: ${allowedMimeTypes.join(", ")}`
      )
      clientLogger.error(`File type not allowed. Allowed types: ${allowedMimeTypes.join(", ")}`);
      return;
    }

    if (file.size > maxFileSize) {
      alert(
        `File ${file.name} is too large. Maximum file size is ${maxFileSize / 1024 / 1024} MB`
      )
      clientLogger.error(`File ${file.name} is too large. Maximum file size is ${maxFileSize / 1024 / 1024} MB`);
      return;
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
      clientLogger.info("File uploaded successfully");
    } else {
      const errorText = await res.text();
      alert("Failed to upload files: " + errorText);
      clientLogger.error("Failed to upload files: " + errorText);
    }
  } catch (error) {
    alert("Error uploading files:"+ error);
    clientLogger.error("Error uploading files:", error);
  } finally {
    onDone();
  }
}
