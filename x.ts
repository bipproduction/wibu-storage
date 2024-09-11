import { libServer } from "@/lib/lib_server";
import moment from "moment";
import path from "path";

(async () => {
console.log(path.basename("/Users/bip/Documents/projects/wibu/wibu-storage/uploads/123/2024/09/11/k5yotgf6ovt/test.pdf"))

})();

function filePathGenerate(userId: string, name: string) {
  const root = path.join(process.cwd(), "uploads");
  const createdAt = moment().format("YYYY-MM-DD");
  const ext = path.extname(name);
  const baseFileName = path.basename(name, ext);
  let fileName = baseFileName + ext;

  let filePath = path.join(
    root,
    userId,
    createdAt.replace(/-/g, "/"),
    Math.random().toString(36).substring(2),
    fileName
  );

  return {
    path: filePath,
    name: fileName,
    ext: ext
  };
}
