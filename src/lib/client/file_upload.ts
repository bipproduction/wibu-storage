import { Token } from "../token";

export async function fileUpload(
  file: File,
  dirId: string,
  onDone: () => void
) {
  if (!file) {
    return alert("No file selected");
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
    return alert("Unsupported file type");
  }

  if (file.size > 100 * 1024 * 1024) {
    // 100 MB
    return alert("File size exceeds 100 MB");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("dirId", dirId);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${Token.value}`,
      },
    });

    if (res.ok) {
      alert("File uploaded successfully");
    } else {
      const errorText = await res.text();
      alert(`Upload failed: ${errorText}`);
    }
  } catch (error) {
    alert("Error uploading file");
    console.error("Upload error:", error);
  } finally {
    onDone();
  }
}
