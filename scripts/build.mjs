import { execSync, spawnSync } from "node:child_process";
import { glob, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { prepareSingleFileReplaceTscAliasPaths } from "tsc-alias";

// This script builds a package, runs tsc-alias to fix imports for ESM,
// and removes dangling files from previous builds i.e. files in dist/
// for which the original file no longer exists in src/

execSync("tsc && tsc-alias --dir dist", {
  env: process.env,
  stdio: "inherit",
});

// tsc-alias's own file search breaks when the absolute path contains glob
// characters such as "(", so we find the files ourselves and use its
// single-file API instead
const replaceAliases = await prepareSingleFileReplaceTscAliasPaths();
for await (const file of glob("dist/**/*.{js,d.ts}")) {
  const filePath = resolve(file);
  const fileContents = await readFile(filePath, "utf8");
  const newContents = replaceAliases({ fileContents, filePath });
  if (newContents !== fileContents) await writeFile(filePath, newContents);
}

const expected = new Set();
for await (const file of glob("src/**/*.*")) {
  const name = /^src(.+)\.ts$/.exec(file)?.[1];
  if (name) {
    expected.add(`dist${name}.js`);
    expected.add(`dist${name}.d.ts`);
    expected.add(`dist${name}.js.map`);
    expected.add(`dist${name}.d.ts.map`);
  } else {
    expected.add(file.replace(/^src/, "dist"));
  }
}

const toDelete = [];
for await (const file of glob("dist/**/*.*")) {
  if (!expected.has(file)) toDelete.push(file);
}

spawnSync("rm", ["-f", ...toDelete]);
