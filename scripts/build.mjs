import { execSync, spawnSync } from "node:child_process";
import { glob } from "node:fs/promises";

execSync("tsc && tsc-alias", {
  env: process.env,
  stdio: "inherit",
});

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
