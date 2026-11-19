import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { resolve } from "node:path";

const res = resolve(process.cwd(), "android/app/src/main/res");
const foreground = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp"
    android:viewportWidth="108" android:viewportHeight="108">
    <path android:fillColor="#173A3B" android:pathData="M17,46 Q17,40 23,40 H70 Q76,40 76,46 V80 Q76,86 70,86 H23 Q17,86 17,80 Z" android:strokeColor="#55D6A3" android:strokeWidth="2"/>
    <path android:fillColor="#1C4B46" android:pathData="M23,39 Q23,33 29,33 H76 Q82,33 82,39 V73 Q82,79 76,79 H29 Q23,79 23,73 Z" android:strokeColor="#68E6B2" android:strokeWidth="2"/>
    <path android:fillColor="#55D6A3" android:pathData="M29,32 Q29,26 35,26 H82 Q88,26 88,32 V66 Q88,72 82,72 H35 Q29,72 29,66 Z" android:strokeColor="#B0FFE0" android:strokeWidth="2"/>
    <path android:fillColor="#103B34" android:pathData="M38,39h38v4h-38z M38,49h26v4h-26z M38,59h17v4h-17z"/>
    <path android:fillColor="#F3D98A" android:pathData="M79,28l11,-12 11,12h-6v17h-10v-17z"/>
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
    <path android:fillColor="#173A3B" android:pathData="M17,46 Q17,40 23,40 H70 Q76,40 76,46 V80 Q76,86 70,86 H23 Q17,86 17,80 Z" android:strokeColor="#55D6A3" android:strokeWidth="2"/>
    <path android:fillColor="#1C4B46" android:pathData="M23,39 Q23,33 29,33 H76 Q82,33 82,39 V73 Q82,79 76,79 H29 Q23,79 23,73 Z" android:strokeColor="#68E6B2" android:strokeWidth="2"/>
    <path android:fillColor="#55D6A3" android:pathData="M29,32 Q29,26 35,26 H82 Q88,26 88,32 V66 Q88,72 82,72 H35 Q29,72 29,66 Z" android:strokeColor="#B0FFE0" android:strokeWidth="2"/>
    <path android:fillColor="#103B34" android:pathData="M38,39h38v4h-38z M38,49h26v4h-26z M38,59h17v4h-17z"/>
    <path android:fillColor="#F3D98A" android:pathData="M79,28l11,-12 11,12h-6v17h-10v-17z"/>
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
console.log("Applied stacked-lots Android launcher icons for adaptive and legacy Android launchers.");
