# API Documentation

## Getting Started

### Steps

1. **Create User/Login**: Sign in or register a new user.
2. **Copy API Key**: After logging in, copy the existing API key or create a new one.

In your `.env` file, add:

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
    "image/png", "image/jpeg", "image/gif", "text/csv", "application/pdf", 
    "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
    "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/plain"
  ];

  if (!allowedMimeTypes.includes(file.type)) {
    return ntf.set({
      type: "error",
      msg: `File type not allowed. Allowed types: ${allowedMimeTypes.join(", ")}`
    });
  }

  if (file.size > 100 * 1024 * 1024) { // 100 MB
    return ntf.set({ type: "error", msg: "File size too large. Max size: 100 MB" });
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("dirId", dirId);

  try {
    const res = await fetch(apis["/api/upload"], {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${Token.value}` }
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

```tsx
import { ntf } from "@/state/use_notification";
import { Token } from "../token";
import { apis } from "../routes";

export async function fileUploadMultiple(files: FileList, dirId: string, onDone: () => void) {
  if (!files || files.length === 0) {
    return ntf.set({ type: "error", msg: "No files selected" });
  }

  const allowedMimeTypes = [
    "image/png", "image/jpeg", "image/gif", "text/csv", "application/pdf", 
    "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
    "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/plain"
  ];

  const maxFileSize = 100 * 1024 * 1024; // 100 MB

  for (const file of files) {
    if (!allowedMimeTypes.includes(file.type)) {
      return ntf.set({
        type: "error",
        msg: `File type not allowed. Allowed types: ${allowedMimeTypes.join(", ")}`
      });
    }

    if (file.size > maxFileSize) {
      return ntf.set({ type: "error", msg: "File size too large. Max size: 100 MB" });
    }
  }

  const formData = new FormData();
  Array.from(files).forEach(file => formData.append("files", file));
  formData.append("dirId", dirId);

  try {
    const res = await fetch(apis["/api/upload-multiple"], {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${Token.value}` }
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

To retrieve an image with a specific size, use the following format:

```
http://localhost:3000/api/files/<file-id>-size-300
```

---

# Directory API

### **POST /api/dir/{id}/create**

Create a new directory under a parent directory or in the root directory if `{id}` is "root". The directory name will be adjusted if it already exists.

- **URL Parameters**:
  - `id`: Parent directory ID. Use "root" for the root directory.
  
- **Headers**:
  - `Authorization`: JWT for authentication.
  - `Content-Type`: `application/json`
  
- **Body**:
  - `name` (string): Name of the new directory.

#### **Example Request**:
```json
{
  "name": "My Directory"
}
```

#### **Response**:
- **201 Created**: Directory created successfully.
  ```json
  {
    "data": {
      "id": "new_directory_id",
      "name": "My Directory",
      "parentId": "parent_directory_id",
      "userId": "user_id"
    }
  }
  ```

---

### **DELETE /api/dir/{id}/delete**

Delete a directory and all its contents (subdirectories and files).

- **URL Parameters**:
  - `id`: Directory ID to delete.

- **Headers**:
  - `Authorization`: JWT for authentication.

#### **Response**:
- **200 OK**: Directory deleted successfully.
  ```json
  {
    "success": true,
    "message": "Directory deleted successfully",
    "data": null
  }
  ```

---

### **GET /api/dir/{id}/find/dir**

Retrieve information about a directory by its ID.

- **URL Parameters**:
  - `id`: Directory ID.

- **Headers**:
  - `Authorization`: JWT for authentication.

#### **Response**:
- **200 OK**: Directory information retrieved.
  ```json
  {
    "data": {
      "id": "directory_id",
      "name": "Directory Name",
      "parentId": "parent_directory_id"
    }
  }
  ```

---

### **GET /api/dir/{id}/find/file/{name}**

Retrieve information about a file based on its directory ID and name.

- **URL Parameters**:
  - `id`: Directory ID.
  - `name`: File name.

- **Headers**:
  - `Authorization`: JWT for authentication.

#### **Response**:
- **200 OK**: File information retrieved.
  ```json
  {
    "data": {
      "id": "file_id",
      "name": "file_name",
      "dirId": "directory_id",
      "path": "file_path",
      "mime": "mime_type",
      "size": file_size_in_bytes
    }
  }
  ```

---

### **GET /api/dir/{id}/list**

Retrieve a list of directories and files in a specific directory. Use "root" to list contents at the root level.

- **URL Parameters**:
  - `id`: Directory ID.

- **Headers**:
  - `Authorization`: JWT for authentication.

#### **Response**:
- **200 OK**: List retrieved.
  ```json
  {
    "dirs": [
      { "id": "directory_id", "name": "Directory Name", "parentId": "parent_directory_id", "userId": "user_id" }
    ],
    "files": [
      { "id": "file_id", "name": "File Name", "dirId": "directory_id", "userId": "user_id" }
    ]
  }
  ```

---

### **PUT /api/dir/{id}/rename**

Update directory information based on its ID.

- **URL Parameters**:
  - `id`: Directory ID.

- **Body**:
  - `name`: New directory name.
  - `parentId`: New parent directory ID (optional).

#### **Response**:
- **200 OK**: Directory updated successfully.
  ```json
  {
    "id": "directory_id",
    "name": "Updated Directory Name",
    "parentId": "new_parent_id",
    "userId": "user_id"
  }
  ```

---

## File API

### **DELETE /api/files/{id}/delete**

Delete a file by its ID.

- **Path Parameters**:
  - `id`: File ID.

- **Headers**:
  - `Authorization`: JWT for authentication.

#### **Response**:
- **200 OK**: File deleted successfully.
  ```json
  {
    "id": "file_id",
    "name": "file_name",
    "path": "file_path",
    "mime": "file_mime_type",
    "size": file_size
  }
  ```

### **APIs:**

#### **Directory APIs:**
1. `/api/dir/[id]/tree`:  
   Generates API endpoint for fetching the directory tree.
   
2. `/api/dir/[id]/search/[q]`:  
   Generates API endpoint for searching inside a directory by `id` and `q` (query).

3. `/api/dir/[id]/rename`:  
   Generates API endpoint for renaming a directory by `id`.

4. `/api/dir/[id]/list`:  
   Generates API endpoint for listing contents of a directory by `id`.

5. `/api/dir/[id]/find/file/[name]`:  
   Generates API endpoint for finding a specific file by directory `id` and file `name`.

6. `/api/dir/[id]/find/dir`:  
   Generates API endpoint for finding a specific directory by `id`.

7. `/api/dir/[id]/delete`:  
   Generates API endpoint for deleting a directory by `id`.

8. `/api/dir/[id]/create`:  
   Generates API endpoint for creating a directory under the given `id`.

#### **File APIs:**
1. `/api/files/view/[dirId]/[name]`:  
   Generates API endpoint for viewing a file by directory `dirId` and file `name`.

2. `/api/files/delete/[dirId]/[name]`:  
   Generates API endpoint for deleting a file by directory `dirId` and file `name`.

3. `/api/files/copy/[from]/[to]`:  
   Generates API endpoint for copying a file from one directory to another.

4. `/api/files/[id]`:  
   Generates API endpoint for file operations by `id`.

5. `/api/files/[id]/rename`:  
   Generates API endpoint for renaming a file by `id`.

6. `/api/files/[id]/delete`:  
   Generates API endpoint for deleting a file by `id`.

7. `/api/upload`:  
   API for uploading a single file.

8. `/api/upload-multiple`:  
   API for uploading multiple files.
