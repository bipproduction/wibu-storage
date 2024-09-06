# Documentation

### TAHAPAN

1. create user/ login
2. copy apikey atau buat baru

.env

`WS_APIKEY="........."`

### example

SINGLE UPLOAD

```tsx
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
```

MULTIPLE UPLOAD

```ts
import { ntf } from "@/state/use_notification";
import { Token } from "../token";
import { apis } from "../routes";

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
    const res = await fetch(apis["/api/upload-multiple"], {
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
```

### API

POST "/api/upload":

POST "/api/upload-multiple":

GET "/api/files/[id]":

PUT "/api/files/[id]/rename":

DELETE "/api/files/[id]/delete":

PUT "/api/dir/[id]/update":

PUT "/api/dir/[id]/rename":

GET "/api/dir/[id]/list":

GET "/api/dir/[id]/find":

GET "/api/dir/[id]/file":

DELETE "/api/dir/[id]/delete":

POST "/api/dir/[id]/create":
