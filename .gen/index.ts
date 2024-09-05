import yargs from "yargs";
import readdirp from "readdirp";
import path from "path";
import fs from "fs/promises";
import _ from "lodash";

const root = path.resolve("src/lib");
const extractTextWithinBrackets = (str: string): string => {
  const regex = /\[([^\]]+)\]/g;
  const matches = str.match(regex) || [];

  const param = _.map(matches, (match) => {
    const replace = _.trim(match, "[]");
    return `${replace}`;
  });

  const parameters = _.map(matches, (match) => {
    const replace = _.trim(match, "[]");
    return `${replace}: string`;
  });

  const pathResult = _.reduce(
    matches,
    (result, match) => {
      const replace = _.trim(match, "[]");
      return _.replace(result, match, `\${${replace}}`);
    },
    str
  );

  return _.isEmpty(parameters)
    ? `"${pathResult}"`
    : `({${param.join(", ")}}:{${parameters.join(", ")}}) => \`${pathResult}\``;
};

const generateRoutes = async (fileName: string): Promise<string[]> => {
  const items: string[] = [];

  for await (const { path: entryPath } of readdirp("src/app", {
    fileFilter: fileName,
    directoryFilter: ["*"],
    type: "files",
  })) {
    const base = `/${_.replace(
      entryPath,
      new RegExp(`/${fileName}$`),
      ""
    )}`.replace("/" + fileName, "/");
    // console.log(base);
    const detection = extractTextWithinBrackets(base);
    const name = `"${base}"`;

    items.push(`${name}: ${detection}`);
  }

  return items;
};

// async function schema() {
//   const schemaPath = path.join("prisma/schema.prisma");
//   const schema = await fs.readFile(schemaPath, "utf-8");

//   // Fungsi untuk mengonversi schema ke JSON
//   const prismaSchemaToJson = (schema: string) => {
//     const models: Record<string, Record<string, string>> = {};
//     let currentModel: string | null = null;

//     _(schema)
//       .split("\n")
//       .map(_.trim)
//       .forEach((line) => {
//         if (_.startsWith(line, "model ")) {
//           currentModel = _.split(line, " ")[1];
//           models[currentModel] = {};
//         } else if (
//           currentModel &&
//           line &&
//           !_.startsWith(line, "//") &&
//           !_.startsWith(line, "model ") &&
//           line !== "}"
//         ) {
//           const [field, type] = _.split(line, /\s+/);
//           models[currentModel][field] = type;
//         } else if (line === "}") {
//           currentModel = null;
//         }
//       });

//     return models;
//   };

//   // Konversi schema ke JSON
//   const schemaJson = prismaSchemaToJson(schema);

//   // Buat tipe Table
//   const tp = `type Table = ${_.keys(schemaJson)
//     .map((key) => `"${key}"`)
//     .join(" | ")};`;

//   // Buat tipe dan fungsi form untuk setiap model
//   const data = _.map(schemaJson, (fields, key) => {
//     const tipe = `type ${key} = ${_.keys(fields)
//       .map((field) => `"${field}"`)
//       .join(" | ")}`;
//     const form = `export function Form${key}({listItem, onchange}: {listItem: ${key}[], onchange: (val: any) => void }) {
//       const [form, setForm] = useState<Record<string, string>>({});
//       useShallowEffect(() => {
//         form && onchange(form);
//       }, [form]);
//       return (
//         <Stack gap={0}>
//           {listItem.map((item, k) => (
//             <Stack key={k}>
//               <TextInput label={item} placeholder={item} onChange={e => setForm({ ...form, [item]: e.target.value })} />
//             </Stack>
//           ))}
//         </Stack>
//       );
//     }`;
//     return `${tipe}\n${form}`;
//   });

//   // Hasilkan dan tulis output ke file
//   const output = `
//   import { useShallowEffect } from "@mantine/hooks";
//   import { Stack, TextInput } from "@mantine/core";
//   import { useState } from "react";
//   ${data.join("\n")}`;

//   await fs.writeFile(path.join(root, "forms.tsx"), output);
//   console.log("Forms generated successfully");
// }

yargs()
  .command("now", "Generate directory structure path", async () => {
    const [pages, apis] = await Promise.all([
      generateRoutes("page.tsx"),
      generateRoutes("route.ts"),
    ]);

    const output = `export const pages = {${pages.join(
      ", "
    )}};\nexport const apis = {${apis.join(", ")}};`;
    await fs.writeFile(path.join(root, "routes.ts"), output);
    console.log("gen route success");
    await lib();
  })
  // .command("schema", "Generate schema", async () => {
  //   await schema();
  // })
  .command("lib", "Generate lib", async () => {
    await lib();
  })
  .demandCommand(1)
  .parse(process.argv.splice(2));

async function generateImports(
  basePath: string,
  outputFileName: string,
  exportName: string
) {
  const listItem: string[] = [];
  const listImport: string[] = [];

  for await (const { path: entryPath } of readdirp(basePath, {
    fileFilter: "*.ts",
    directoryFilter: ["*"],
    type: "files",
  })) {
    const fileName = path.basename(entryPath).replace(".ts", "");
    const camelCasedName = _.camelCase(fileName);
    listItem.push(camelCasedName);
    listImport.push(
      `import {${camelCasedName}} from "./${path.basename(
        basePath
      )}/${fileName}";`
    );
  }

  const output = `${listImport.join("\n")}
    export const ${exportName} = {${listItem.join(", ")}};`;

  await fs.writeFile(path.join(root, outputFileName), output);
  
}

async function lib() {
  await generateImports("src/lib/client", "lib_client.ts", "libClient");
  await generateImports("src/lib/server", "lib_server.ts", "libServer");
  console.log("gen lib success");
}
