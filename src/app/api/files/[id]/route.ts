import prisma from "@/lib/prisma";
import backendLogger from "@/util/backend-logger";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const uploadPath = process.env.UPLOAD_PATH!;

console.log(uploadPath);
const listImageMimeType = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/ico",
  "image/svg+xml"
];

// Default error image sebagai SVG
const errorImageSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#f8d7da"/>
  <text x="50" y="50" font-family="Arial" font-size="12" fill="#721c24" text-anchor="middle">
    Image Error
  </text>
  <path d="M50,25 L75,65 L25,65 Z" fill="none" stroke="#721c24" stroke-width="2"/>
  <text x="50" y="55" font-family="Arial" font-size="20" fill="#721c24" text-anchor="middle">!</text>
</svg>`;

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [id, size] = params.id.split("-size-");

    if (!id) {
      throw new Error("Invalid file ID");
    }

    // Cari file berdasarkan ID
    const fileData = await prisma.files.findUnique({
      where: { id }
    }).catch(error => {
      backendLogger.error("Database error:", error);
      throw new Error("Database error");
    });

    // Jika file tidak ditemukan
    if (!fileData) {
      throw new Error("File not found");
    }

    // Validasi path file
    if (!fileData.path) {
      throw new Error("Invalid file path");
    }

    const filePath = path.join(uploadPath, fileData.path);
    const mimeType = fileData.mime || "application/octet-stream";

    // Baca file
    const file = await fs.readFile(filePath).catch(error => {
      backendLogger.error("File read error:", error);
      throw new Error("File read error");
    });

    // Handle image resizing
    if (listImageMimeType.includes(mimeType) && size) {
      try {
        let currentSize = +size;
        currentSize = Math.min(Math.max(currentSize, 10), 2000);

        const image = sharp(file);
        const resized = await image
          .rotate()
          .resize({
            width: currentSize,
            position: "center",
            withoutEnlargement: true,
            fit: "cover"
          })
          .toBuffer()
          .catch(error => {
            backendLogger.error("Image processing error:", error);
            throw new Error("Image processing failed");
          });

        return new Response(resized, {
          headers: {
            "Content-Type": mimeType,
            "Content-Disposition": `inline; filename="${fileData.name}"`,
            "Cache-Control": "public, max-age=3600",
            "X-Error-Handled": "false"
          }
        });
      } catch (error) {
        // Return error image for image processing failures
        return new Response(errorImageSvg, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "no-store",
            "X-Error-Handled": "true"
          }
        });
      }
    }

    // Return regular file
    return new Response(file, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${fileData.name}"`,
        "Cache-Control": "public, max-age=3600",
        "X-Error-Handled": "false"
      }
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    backendLogger.error("File serve error:", error);

    // Return error image for images, error response for other files
    const isImageRequest = params.id.includes("-size-");
    if (isImageRequest) {
      return new Response(errorImageSvg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-store",
          "X-Error-Handled": "true"
        }
      });
    }

    return new Response(message, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-store",
        "X-Error-Handled": "true"
      }
    });
  }
}
