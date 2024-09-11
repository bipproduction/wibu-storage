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
    "text/plain"
  ];

  if (!allowedMimeTypes.includes(file.type)) {
    return ntf.set({
      type: "error",
      msg: `File type not allowed. Allowed types: ${allowedMimeTypes.join(
        ", "
      )}`
    });
  }

  if (file.size > 100 * 1024 * 1024) {
    // 100 MB
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
    "text/plain"
  ];

  const maxFileSize = 100 * 1024 * 1024; // 100 MB

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (!allowedMimeTypes.includes(file.type)) {
      return ntf.set({
        type: "error",
        msg: `File type not allowed. Allowed types: ${allowedMimeTypes.join(
          ", "
        )}`
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

- **GET `/api/files/view/[dirId][name]`**

  - **Get File By directory id and Name**

### Directory Endpoints

- default id `root`

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



# API DOCUMENTATION


### **POST /api/dir/{id}create/**

Endpoint ini digunakan untuk membuat direktori baru dalam direktori yang sudah ada atau di direktori root jika `{id}` adalah "root". Nama direktori akan diubah jika sudah ada direktori dengan nama yang sama.

#### **URL Parameters**:
- `id`: ID direktori induk. Gunakan "root" untuk direktori root.

#### **Headers**:
- `Authorization`: Token JWT untuk otentikasi.
- `Content-Type`: `application/json`

#### **Body**:
- `name` (string): Nama direktori yang ingin dibuat.

#### **Contoh Request**:
```json
{
  "name": "My Directory"
}
```

---

### **Response**

- **201 Created**: Direktori berhasil dibuat.
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

- **400 Bad Request**: Nama direktori tidak diberikan.
  ```json
  { "error": "name is required" }
  ```

---

### **Proses Utama**:
1. Verifikasi token pengguna.
2. Periksa apakah nama direktori sudah ada untuk pengguna tersebut di direktori induk yang ditentukan.
3. Jika nama sudah ada, buat nama baru dengan format "name (copy n)".
4. Buat direktori baru dan simpan ke database.


### **DELETE /api/dir/{id}/delete**

Endpoint ini digunakan untuk menghapus direktori dan semua isinya, termasuk subdirektori dan file yang ada di dalamnya.

#### **URL Parameters**:
- `id`: ID direktori yang ingin dihapus.

#### **Headers**:
- `Authorization`: Token JWT untuk otentikasi.

#### **Response**

- **200 OK**: Direktori dan semua isinya berhasil dihapus.
  ```json
  {
    "success": true,
    "message": "Directory deleted successfully",
    "data": null
  }
  ```

- **404 Not Found**: Direktori tidak ditemukan.
  ```json
  "Directory not found"
  ```

- **500 Internal Server Error**: Terjadi kesalahan saat memproses permintaan.
  ```json
  "Internal Server Error"
  ```

---

### **Proses Utama**:
1. **Verifikasi Token**: Memastikan pengguna telah terautentikasi.
2. **Temukan Direktori**: Ambil direktori dan semua file serta subdirektorinya dari database.
3. **Hapus dari Database**:
   - Hapus semua file di direktori.
   - Hapus semua subdirektori secara rekursif.
   - Hapus direktori itu sendiri.
4. **Hapus dari System File**: Hapus file yang terkait dari system file.



### **GET /api/dir/{id}/find/dir**

Endpoint ini digunakan untuk mendapatkan informasi tentang direktori berdasarkan ID.

#### **URL Parameters**:
- `id`: ID direktori yang ingin diambil informasinya.

#### **Headers**:
- `Authorization`: Token JWT untuk otentikasi.

#### **Response**

- **200 OK**: Informasi direktori berhasil diambil.
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

### **Proses Utama**:
1. **Verifikasi Token**: Memastikan pengguna telah terautentikasi.
2. **Ambil Data Direktori**: Ambil informasi direktori berdasarkan ID dari database.
3. **Kembalikan Data**: Kirimkan data direktori dalam response JSON.



### **GET /api/dir/{id}/find/file/{name}**

Endpoint ini digunakan untuk mendapatkan informasi tentang file berdasarkan ID direktori dan nama file.

#### **URL Parameters**:
- `id`: ID direktori tempat file berada.
- `name`: Nama file yang ingin diambil informasinya.

#### **Headers**:
- `Authorization`: Token JWT untuk otentikasi.

#### **Response**

- **200 OK**: Informasi file berhasil diambil.
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

- **400 Bad Request**: Nama file atau ID direktori tidak diberikan, atau ID adalah "root".
  ```json
  "Bad Request"
  ```

---

### **Proses Utama**:
1. **Verifikasi Token**: Memastikan pengguna telah terautentikasi.
2. **Validasi Input**: Memeriksa apakah `name` dan `id` valid, serta `id` tidak "root".
3. **Ambil Data File**: Ambil informasi file berdasarkan `id` direktori dan `name` file dari database.
4. **Kembalikan Data**: Kirimkan data file dalam respons JSON.


### **GET /api/dir/{id}/list**

Endpoint ini digunakan untuk mendapatkan daftar direktori dan file di dalam direktori tertentu. Jika `{id}` adalah "root", maka akan mengambil semua direktori dan file di level root.

#### **URL Parameters**:
- `id`: ID direktori yang isinya ingin diambil. Gunakan "root" untuk mengambil konten di level root.

#### **Headers**:
- `Authorization`: Token JWT untuk otentikasi.

#### **Response**

- **200 OK**: Daftar direktori dan file berhasil diambil.
  ```json
  {
    "dirs": [
      {
        "id": "directory_id",
        "name": "Directory Name",
        "parentId": "parent_directory_id",
        "userId": "user_id",
        "File": [ /* List of files in this directory */ ]
      }
      // ... more directories
    ],
    "files": [
      {
        "id": "file_id",
        "name": "File Name",
        "dirId": "directory_id",
        "userId": "user_id"
      }
      // ... more files
    ]
  }
  ```

- **400 Bad Request**: Terjadi kesalahan pada permintaan, biasanya karena parameter tidak valid.
  ```json
  "Bad Request"
  ```

---

### **Proses Utama**:
1. **Verifikasi Token**: Memastikan pengguna telah terautentikasi.
2. **Ambil Daftar Direktori**: Ambil semua direktori di bawah direktori yang diberikan (`parentId`) atau di level root, termasuk file-file yang ada di dalam setiap direktori.
3. **Ambil Daftar File**: Ambil semua file yang berada di dalam direktori yang diberikan (`dirId`).
4. **Kembalikan Data**: Kirimkan daftar direktori dan file dalam respons JSON.


### **PUT /api/dir/{id}/rename**

Endpoint ini digunakan untuk memperbarui informasi direktori berdasarkan ID.

#### **URL Parameters**:
- `id`: ID direktori yang ingin diperbarui.

#### **Request Body**:
- **Content-Type**: `application/json`
- **Body**: Data yang ingin diperbarui pada direktori, sesuai dengan schema `Prisma.DirUpdateInput`. Contoh data yang dapat dikirim:
  ```json
  {
    "name": "New Directory Name",
    "parentId": "new_parent_id"
  }
  ```

#### **Response**

- **200 OK**: Direktori berhasil diperbarui.
  ```json
  {
    "id": "directory_id",
    "name": "Updated Directory Name",
    "parentId": "new_parent_id",
    "userId": "user_id"
  }
  ```

- **400 Bad Request**: Terjadi kesalahan dalam data yang dikirimkan atau parameter ID tidak valid.
  ```json
  "Bad Request"
  ```

- **404 Not Found**: Direktori dengan ID yang diberikan tidak ditemukan.
  ```json
  "Directory not found"
  ```

- **500 Internal Server Error**: Terjadi kesalahan saat memproses permintaan.
  ```json
  "Internal Server Error"
  ```

---

### **Proses Utama**:
1. **Ambil Data dari Request**: Mengambil data pembaruan dari body request dalam format JSON.
2. **Perbarui Direktori**: Mengupdate direktori di database berdasarkan ID dengan data yang diberikan.
3. **Kembalikan Data**: Kirimkan data direktori yang telah diperbarui dalam respons JSON.


### **GET /api/dir/{id}/search/{q}**

Endpoint ini digunakan untuk mendapatkan daftar direktori dan file dalam direktori tertentu dengan pencarian dan paginasi.

#### **URL Parameters**:
- `id`: ID direktori yang isinya ingin diambil.
- `q`: Query pencarian untuk nama direktori atau file.
- `page`: (Opsional) Nomor halaman untuk paginasi, default ke "1".

#### **Headers**:
- `Authorization`: Token JWT untuk otentikasi.

#### **Response**

- **200 OK**: Data berhasil diambil dengan informasi paginasi.
  ```json
  {
    "data": {
      "dirs": [
        {
          "id": "directory_id",
          "name": "Directory Name",
          "parentId": "parent_directory_id",
          "userId": "user_id",
          "active": true
        }
        // ... more directories
      ],
      "files": [
        {
          "id": "file_id",
          "name": "File Name",
          "dirId": "directory_id",
          "active": true
        }
        // ... more files
      ]
    },
    "pagination": {
      "totalDirs": 100,
      "totalFiles": 50,
      "currentPage": 1,
      "limit": 10,
      "totalPagesDirs": 10,
      "totalPagesFiles": 5
    }
  }
  ```

- **400 Bad Request**: Terjadi kesalahan pada permintaan, biasanya karena parameter tidak valid.
  ```json
  "Bad Request"
  ```

- **404 Not Found**: Direktori dengan ID yang diberikan tidak ditemukan.
  ```json
  "Directory not found"
  ```

- **500 Internal Server Error**: Terjadi kesalahan saat memproses permintaan.
  ```json
  "Internal Server Error"
  ```

---

### **Proses Utama**:
1. **Verifikasi Token**: Memastikan pengguna telah terautentikasi.
2. **Hitung Offset**: Menghitung offset untuk paginasi berdasarkan nomor halaman dan limit.
3. **Ambil Daftar Direktori dan File**: Mengambil direktori dan file sesuai dengan query pencarian, dengan paginasi.
4. **Hitung Total**: Menghitung total direktori dan file yang sesuai dengan query untuk informasi paginasi.
5. **Kembalikan Data**: Kirimkan daftar direktori, file, dan informasi paginasi dalam respons JSON.



### **GET /api/dir/{id}/tree**

Endpoint ini digunakan untuk mendapatkan struktur pohon direktori yang dimiliki oleh pengguna saat ini.

#### **Headers**:
- `Authorization`: Token JWT untuk otentikasi.

#### **Response**

- **200 OK**: Daftar direktori dalam bentuk struktur pohon.
  ```json
  {
    "data": [
      {
        "id": "root_directory_id",
        "name": "Root Directory",
        "parentId": null,
        "children": [
          {
            "id": "child_directory_id",
            "name": "Child Directory",
            "parentId": "root_directory_id",
            "children": []
          }
          // ... more children directories
        ]
      }
      // ... more root directories
    ]
  }
  ```

- **401 Unauthorized**: Pengguna tidak terautentikasi atau token tidak valid.
  ```json
  "Unauthorized"
  ```

- **500 Internal Server Error**: Terjadi kesalahan saat memproses permintaan.
  ```json
  "Internal Server Error"
  ```

---

### **Proses Utama**:
1. **Verifikasi Token**: Memastikan pengguna telah terautentikasi.
2. **Ambil Daftar Direktori**: Mengambil semua direktori yang dimiliki oleh pengguna.
3. **Bangun Struktur Pohon**:
   - Membuat peta direktori berdasarkan ID.
   - Mengelompokkan direktori ke dalam struktur pohon, dengan mengidentifikasi dan menghubungkan anak-anak direktori ke direktori induknya.
4. **Kembalikan Data**: Kirimkan struktur pohon direktori dalam respons JSON.


## FILE API

### **DELETE /api/files/{id}/delete**

Endpoint ini digunakan untuk menghapus file berdasarkan ID dari sistem.

#### **Path Parameters**:
- `id` (string): ID file yang ingin dihapus.

#### **Headers**:
- `Authorization`: Token JWT untuk otentikasi.

#### **Response**

- **200 OK**: File berhasil dihapus.
  ```json
  {
    "id": "file_id",
    "name": "file_name",
    "path": "file_path",
    "mime": "file_mime_type",
    "size": file_size
  }
  ```

- **404 Not Found**: File dengan ID yang diberikan tidak ditemukan.
  ```json
  "Not found"
  ```

- **500 Internal Server Error**: Terjadi kesalahan saat menghapus file dari sistem file.
  ```json
  "Internal Server Error"
  ```

#### **Proses Utama**:
1. **Hapus dari Database**: Menghapus file dari database berdasarkan ID.
2. **Hapus dari Sistem File**: Menghapus file yang sesuai dari sistem file menggunakan path yang disimpan di database.
3. **Kembalikan Data**: Kirimkan data file yang telah dihapus dalam respons JSON jika berhasil, atau tangani kesalahan jika tidak berhasil.



### **PUT /api/files/{id}/rename**

Endpoint ini digunakan untuk memperbarui informasi file berdasarkan ID.

#### **Path Parameters**:
- `id` (string): ID file yang ingin diperbarui.

#### **Request Body**:
- **Content-Type**: `application/json`
- **Body**: JSON yang berisi data yang ingin diperbarui. Format data ini harus sesuai dengan schema `files` di Prisma.

  ```json
  {
    "name": "new_file_name",
    "path": "new_file_path",
    "mime": "new_file_mime_type",
    "size": new_file_size
  }
  ```

#### **Response**

- **200 OK**: File berhasil diperbarui.
  ```json
  {
    "id": "file_id",
    "name": "new_file_name",
    "path": "new_file_path",
    "mime": "new_file_mime_type",
    "size": new_file_size
  }
  ```

- **404 Not Found**: File dengan ID yang diberikan tidak ditemukan.
  ```json
  "Not found"
  ```

- **500 Internal Server Error**: Terjadi kesalahan saat memperbarui file di database.
  ```json
  "Internal Server Error"
  ```

#### **Proses Utama**:
1. **Ambil Data**: Mengambil data JSON dari permintaan.
2. **Perbarui Database**: Memperbarui informasi file di database berdasarkan ID dan data yang diterima.
3. **Kembalikan Data**: Mengembalikan data file yang telah diperbarui dalam respons JSON jika berhasil, atau tangani kesalahan jika tidak berhasil.

### **GET /api/files/{id}**

Endpoint ini digunakan untuk mengambil file dari sistem dan mengembalikannya sebagai respons. Jika file adalah gambar dan ukuran spesifik diminta, gambar akan diubah ukurannya.

#### **Path Parameters**:
- `id` (string): ID file diikuti dengan ukuran yang diinginkan (misalnya, `file-id-size-300`).

#### **Request**:
- **Query Parameters**:
  - `size` (string, optional): Ukuran gambar yang diinginkan dalam piksel. Jika tidak ada, gambar akan dikembalikan dengan ukuran aslinya.

#### **Response**:

- **200 OK**: File berhasil diambil dan dikembalikan.
  - **Jika file adalah gambar dan ukuran diberikan**: Gambar diubah ukurannya sesuai permintaan.
  - **Jika file bukan gambar atau ukuran tidak diberikan**: File dikembalikan dalam ukuran aslinya.
  - **Headers**:
    - `Content-Type`: MIME type file.
    - `Content-Disposition`: Nama file.
  
  ```http
  Content-Type: image/jpeg
  Content-Disposition: inline; filename="example.jpg"
  ```

  **Body**: Konten file, baik itu gambar yang diubah ukurannya atau file aslinya.

- **404 Not Found**: File dengan ID yang diberikan tidak ditemukan.
  ```json
  "File not found"
  ```

- **500 Internal Server Error**: Terjadi kesalahan saat membaca file dari sistem.
  ```json
  "Error reading file"
  ```

#### **Proses Utama**:
1. **Parse ID dan Ukuran**: Mengambil ID dan ukuran dari parameter URL.
2. **Ambil Data File**: Mengambil informasi file dari database berdasarkan ID.
3. **Baca File**: Membaca file dari sistem file.
4. **Resize Gambar**: Jika file adalah gambar dan ukuran ditentukan, mengubah ukuran gambar menggunakan `sharp`.
5. **Kembalikan File**: Mengembalikan file dengan header yang sesuai, baik dalam ukuran asli atau yang diubah ukurannya.

#### **Catatan**:
- Daftar MIME types gambar yang didukung untuk resizing mencakup PNG, JPEG, WEBP, GIF, ICO, dan SVG.
- Ukuran gambar yang valid dibatasi antara 10 hingga 2000 piksel.


### **GET /api/files/view/{dirId}/{name}**

Endpoint ini digunakan untuk mengambil file dari sistem berdasarkan ID direktori dan nama file. Jika file adalah gambar dan ukuran spesifik diminta, gambar akan diubah ukurannya.

#### **Path Parameters**:
- `dirId` (string): ID direktori tempat file berada.
- `name` (string): Nama file diikuti dengan ukuran yang diinginkan (misalnya, `image-name-size-300`).

#### **Request**:
- **Query Parameters**:
  - `size` (string, optional): Ukuran gambar yang diinginkan dalam piksel. Jika tidak ada, gambar akan dikembalikan dengan ukuran aslinya.

#### **Response**:

- **200 OK**: File berhasil diambil dan dikembalikan.
  - **Jika file adalah gambar dan ukuran diberikan**: Gambar diubah ukurannya sesuai permintaan.
  - **Jika file bukan gambar atau ukuran tidak diberikan**: File dikembalikan dalam ukuran aslinya.
  - **Headers**:
    - `Content-Type`: MIME type file.
    - `Content-Disposition`: Nama file.
  
  ```http
  Content-Type: image/jpeg
  Content-Disposition: inline; filename="example.jpg"
  ```

  **Body**: Konten file, baik itu gambar yang diubah ukurannya atau file aslinya.

- **400 Bad Request**: Parameter `name` atau `dirId` tidak disediakan.
  ```json
  "Bad Request"
  ```

- **404 Not Found**: File dengan ID direktori dan nama yang diberikan tidak ditemukan.
  ```json
  "File not found"
  ```

- **500 Internal Server Error**: Terjadi kesalahan saat membaca file dari sistem.
  ```json
  "Error reading file"
  ```

#### **Proses Utama**:
1. **Validasi Parameter**: Memastikan parameter `name` dan `dirId` disediakan.
2. **Parse Nama dan Ukuran**: Mengambil nama file dan ukuran dari parameter URL.
3. **Ambil Data File**: Mengambil informasi file dari database berdasarkan ID direktori dan nama file.
4. **Baca File**: Membaca file dari sistem file.
5. **Resize Gambar**: Jika file adalah gambar dan ukuran ditentukan, mengubah ukuran gambar menggunakan `sharp`.
6. **Kembalikan File**: Mengembalikan file dengan header yang sesuai, baik dalam ukuran asli atau yang diubah ukurannya.

#### **Catatan**:
- Daftar MIME types gambar yang didukung untuk resizing mencakup PNG, JPEG, WEBP, GIF, ICO, dan SVG.
- Ukuran gambar yang valid dibatasi antara 10 hingga 2000 piksel.

### **POST /api/files/copy/{from}/{to}**

Endpoint ini digunakan untuk menyalin file dari satu direktori ke direktori lain untuk pengguna yang telah login.

#### **URL Parameters**:
- `from`: ID direktori sumber.
- `to`: ID direktori tujuan.

#### **Headers**:
- `Authorization`: Token JWT untuk otentikasi.
- `Content-Type`: `application/json`

#### **Body**:
- `fileId` (string): ID file yang ingin disalin.

#### **Contoh Request**:
```json
{
  "fileId": "123abc"
}
```

---

### **Response**

- **200 OK**: File berhasil disalin.
  ```json
  {
    "data": {
      "id": "new_file_id",
      "name": "filename.ext",
      "dirId": "to_directory_id",
      "path": "new_file_path",
      "size": file_size,
      "userId": "user_id"
    }
  }
  ```

- **400 Bad Request**: Input tidak lengkap.
  ```json
  { "message": "Missing required fields" }
  ```

- **404 Not Found**: File atau direktori tidak ditemukan.
  ```json
  { "message": "File or directory not found" }
  ```

- **500 Internal Server Error**: Terjadi kesalahan di server.
  ```json
  { "message": "Internal Server Error" }
  ```

---

### **Proses Utama**:
1. Verifikasi token pengguna.
2. Cek `fileId`, `from`, dan `to`.
3. Cari file dan direktori di database.
4. Salin file ke direktori baru.
5. Simpan info file baru di database.