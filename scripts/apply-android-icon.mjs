import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { resolve } from "node:path";

const res = resolve(process.cwd(), "android/app/src/main/res");
const foreground = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp"
    android:viewportWidth="108" android:viewportHeight="108">
    <path android:fillColor="#55D6A3" android:pathData="M18,22h55v7h-55z M18,36h55v7h-55z"/>
    <path android:fillColor="#55D6A3" android:pathData="M32,29c18,0 29,8 29,21 0,12 -10,20 -26,20h-7l29,25h-15L13,68v-7h23c10,0 16,-4 16,-11 0,-8 -6,-13 -17,-13h-17v-8z"/>
    <path android:fillColor="#F6C65B" android:pathData="M62,66c0,-5 9,-9 20,-9s20,4 20,9v5c0,5 -9,9 -20,9s-20,-4 -20,-9z"/>
    <path android:fillColor="#D99528" android:pathData="M62,72c0,5 9,9 20,9s20,-4 20,-9v5c0,5 -9,9 -20,9s-20,-4 -20,-9z"/>
    <path android:fillColor="#FFE18B" android:pathData="M62,66c0,-5 9,-9 20,-9s20,4 20,9 -9,9 -20,9 -20,-4 -20,-9z"/>
    <path android:fillColor="#55D6A3" android:pathData="M10,91l27,-13 19,-12 17,-15 -10,0 0,-7 25,0 0,24 -7,0 0,-11 -20,18 -20,13 -27,12z"/>
</vector>`;
const background = `<?xml version="1.0" encoding="utf-8"?>
<resources><color name="ic_launcher_background">#0B1220</color></resources>`;
const adaptive = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>`;
const fallback = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp"
    android:viewportWidth="108" android:viewportHeight="108">
    <path android:fillColor="#0B1220" android:pathData="M0,0h108v108h-108z"/>
    <path android:fillColor="#55D6A3" android:pathData="M18,22h55v7h-55z M18,36h55v7h-55z"/>
    <path android:fillColor="#55D6A3" android:pathData="M32,29c18,0 29,8 29,21 0,12 -10,20 -26,20h-7l29,25h-15L13,68v-7h23c10,0 16,-4 16,-11 0,-8 -6,-13 -17,-13h-17v-8z"/>
    <path android:fillColor="#F6C65B" android:pathData="M62,66c0,-5 9,-9 20,-9s20,4 20,9v5c0,5 -9,9 -20,9s-20,-4 -20,-9z"/>
    <path android:fillColor="#D99528" android:pathData="M62,72c0,5 9,9 20,9s20,-4 20,-9v5c0,5 -9,9 -20,9s-20,-4 -20,-9z"/>
    <path android:fillColor="#FFE18B" android:pathData="M62,66c0,-5 9,-9 20,-9s20,4 20,9 -9,9 -20,9 -20,-4 -20,-9z"/>
    <path android:fillColor="#55D6A3" android:pathData="M10,91l27,-13 19,-12 17,-15 -10,0 0,-7 25,0 0,24 -7,0 0,-11 -20,18 -20,13 -27,12z"/>
</vector>`;

await mkdir(resolve(res, "drawable"), { recursive: true });
await mkdir(resolve(res, "values"), { recursive: true });
await mkdir(resolve(res, "mipmap-anydpi"), { recursive: true });
await mkdir(resolve(res, "mipmap-anydpi-v26"), { recursive: true });
await writeFile(resolve(res, "drawable/ic_launcher_foreground.xml"), foreground);
await writeFile(resolve(res, "values/ic_launcher_background.xml"), background);
await writeFile(resolve(res, "mipmap-anydpi-v26/ic_launcher.xml"), adaptive);
await writeFile(resolve(res, "mipmap-anydpi-v26/ic_launcher_round.xml"), adaptive);
await writeFile(resolve(res, "mipmap-anydpi/ic_launcher.xml"), fallback);
await writeFile(resolve(res, "mipmap-anydpi/ic_launcher_round.xml"), fallback);

const manifestPath = resolve(process.cwd(), "android/app/src/main/AndroidManifest.xml");
let manifest = await readFile(manifestPath, "utf8");
if (!manifest.includes('android:roundIcon=')) {
  manifest = manifest.replace('android:icon="@mipmap/ic_launcher"', 'android:icon="@mipmap/ic_launcher" android:roundIcon="@mipmap/ic_launcher_round"');
  await writeFile(manifestPath, manifest);
}
const svgPath = resolve(process.cwd(), "assets/app-icon.svg");
const svgBytes = await readFile(svgPath);
const densitySizes = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
for (const [density, size] of Object.entries(densitySizes)) {
  const folder = resolve(res, `mipmap-${density}`);
  await mkdir(folder, { recursive: true });
  const png = await sharp(svgBytes).resize(size, size, { fit: "contain" }).png().toBuffer();
  await writeFile(resolve(folder, "ic_launcher.png"), png);
  await writeFile(resolve(folder, "ic_launcher_round.png"), png);
}
console.log("Applied rupee-and-coins Android launcher icons for adaptive and legacy Android launchers.");
