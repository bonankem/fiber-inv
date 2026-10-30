import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const schemaDist = fileURLToPath(
  new URL("../../packages/schema/dist/", import.meta.url),
).replaceAll("\\", "/");

const schemaDistAliases: Plugin = {
  name: "schema-dist-aliases",
  enforce: "pre",
  async resolveId(source, importer) {
    const normalizedImporter = importer?.replaceAll("\\", "/").split("?")[0];
    if (
      !normalizedImporter?.startsWith(schemaDist) ||
      !source.startsWith("#/")
    ) {
      return null;
    }

    return this.resolve(resolve(schemaDist, source.slice(2)), importer, {
      skipSelf: true,
    });
  },
};

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    conditions: ["development"],
  },
  plugins: [
    schemaDistAliases,
    devtools(),
    tailwindcss(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    viteReact(),
  ],
});
