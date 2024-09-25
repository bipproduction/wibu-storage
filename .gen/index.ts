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


yargs()
  .command("now", "Generate directory structure path", async () => {
    const [pages, apis] = await Promise.all([
      generateRoutes("page.tsx"),
      generateRoutes("route.ts"),
    ]);

    const output = `export const pages = {${pages.join(
      ", "
    )}};\nexport const apies = {${apis.join(", ")}};`;
    await fs.writeFile(path.join(root, "routes.ts"), output);
    console.log("gen route success");
    await lib();
  })
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
