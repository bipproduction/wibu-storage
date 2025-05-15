import moment from "moment";
import path from "path";
import fs from "fs/promises";

const uploadPath = process.env.UPLOAD_PATH!;

export async function filePathGenerate(userId: string, name: string) {
  const root = uploadPath;
  const createdAt = moment().format("YYYY/MM/DD");
  const ext = path.extname(name);
  const baseFileName = path.basename(name, ext);
  let fileName = baseFileName + ext;

  let filePath = path.join(root, userId, createdAt, fileName);
  let counter = 1;

  while (await fs.access(filePath).then(() => true).catch(() => false)) {
    fileName = `${baseFileName}-${counter++}${ext}`;
    filePath = path.join(root, userId, createdAt, fileName);
  }

  await fs.mkdir(path.dirname(filePath), { recursive: true });

  return {
    fullPath: filePath,
    filePath: path.join("/", userId, createdAt, fileName),
    name: fileName,
    ext: ext,
    dirName: path.dirname(filePath),
  };
}
