import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
const root = process.cwd();
const output = resolve(root, "www");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of ["index.html", "css", "js"]) {
  await cp(resolve(root, entry), resolve(output, entry), { recursive: true });
}
console.log("Prepared Capacitor web assets in ./www");
