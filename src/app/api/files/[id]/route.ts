import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // Cari file berdasarkan ID
  const fileData = await prisma.files.findUnique({
    where: {
      id: params.id
    }
  });

  // Jika file tidak ditemukan
  if (!fileData) {
    return new Response("File not found", { status: 404 });
  }

  // Cek apakah path file valid dan baca file dari sistem
  const filePath = path.join(process.cwd(), "uploads", fileData.path as string);

  try {
    const file = await fs.readFile(filePath);
    const mimeType = fileData.mime || "application/octet-stream"; // Default MIME type

    return new Response(file, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${fileData.name}"`
      }
    });
  } catch (error) {
    console.error("Error reading file:", error);
    return new Response("Error reading file", { status: 500 });
  }
}
