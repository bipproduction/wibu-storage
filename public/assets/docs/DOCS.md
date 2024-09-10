# API Documentation

## Getting Started

### Steps:
1. **Create User/Login**: Sign in or register a new user.
2. **Copy API Key**: After logging in, either copy the existing API key or create a new one.

In your `.env` file, add the following:
```bash
WS_APIKEY="your_api_key_here"
```

---

## Example Code

### Single File Upload

```tsx
import { ntf } from "@/state/use_notification";
import { Token } from "../token";
import { apis } from "../routes";

export async function fileUpload(file: File, dirId: string, onDone: () => void) {
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
    "text/plain"
  ];

  if (!allowedMimeTypes.includes(file.type)) {
    return ntf.set({
      type: "error",
      msg: `File type not allowed. Allowed types: ${allowedMimeTypes.join(", ")}`
    });
  }

  if (file.size > 100 * 1024 * 1024) { // 100 MB
    return ntf.set({
      type: "error",
      msg: "File size too large. Max size: 100 MB"
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
        Authorization: `Bearer ${Token.value}`
      }
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

### Multiple File Upload

```ts
import { ntf } from "@/state/use_notification";
import { Token } from "../token";
import { apis } from "../routes";

export async function fileUploadMultiple(files: FileList, dirId: string, onDone: () => void) {
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
    "text/plain"
  ];

  const maxFileSize = 100 * 1024 * 1024; // 100 MB

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (!allowedMimeTypes.includes(file.type)) {
      return ntf.set({
        type: "error",
        msg: `File type not allowed. Allowed types: ${allowedMimeTypes.join(", ")}`
      });
    }

    if (file.size > maxFileSize) {
      return ntf.set({
        type: "error",
        msg: "File size too large. Max size: 100 MB"
      });
    }
  }

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }
  formData.append("dirId", dirId);

  try {
    const res = await fetch(apis["/api/upload-multiple"], {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${Token.value}`
      }
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

---

## Image Resizing

Example:  
To retrieve an image with a specific size:
```
http://localhost:3000/api/files/<file-id>-size-300
```

---

## API Endpoints

### Upload Endpoints

- **POST `/api/upload`**  
  - **Request Parameters**: `FormData`
    - `dirId`: `string` (required)
    - `file`: `File` (required)
  - **Errors**:  
    - `dirId` is `null`

- **POST `/api/upload-multiple`**  
  - **Request Parameters**: `FormData`
    - `dirId`: `string` (required)
    - `files`: `FileList` (required)
  - **Errors**:  
    - `dirId` is `null`

### File Endpoints

- **GET `/api/files/[id]`**  
  - **Retrieve Original**:  
    - `http://localhost:3000/api/files/<file-id>`
  - **Retrieve Resized**:  
    - `http://localhost:3000/api/files/<file-id>-size-100`

- **PUT `/api/files/[id]/rename`**  
  - **Request Body**: `JSON`
    - `name`: `string` (required)

- **DELETE `/api/files/[id]/delete`**  
  - **Deletes a file**

### Directory Endpoints

- **PUT `/api/dir/[id]/rename`**  
  - **Request Body**: `JSON`
    - `name`: `string` (required)

- **GET `/api/dir/[id]/list`**  
  - **List all files in a directory**

- **GET `/api/dir/[id]/find`**  
  - **Find a directory by ID**

- **DELETE `/api/dir/[id]/delete`**  
  - **Deletes a directory**

- **POST `/api/dir/[id]/create`**  
  - **Request Body**: `JSON`
    - `name`: `string` (required)