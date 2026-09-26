import fs from "fs";
import path from "path";

const src = path.resolve("public/icon.png");
if (!fs.existsSync(src)) {
  console.error("Missing public/icon.png");
  process.exit(1);
}

const res = path.resolve("android/app/src/main/res");
if (!fs.existsSync(res)) {
  console.error("Android res folder not found. Run npx cap add android first.");
  process.exit(1);
}

let count = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(p);
      continue;
    }
    if (/ic_launcher.*\.(png|webp)$/i.test(entry.name)) {
      fs.copyFileSync(src, p);
      count += 1;
      console.log("icon ->", path.relative(process.cwd(), p));
    }
  }
}
walk(res);

if (count === 0) {
  console.warn("No launcher icon files found to replace.");
} else {
  console.log(`Applied soldier logo to ${count} Android launcher files.`);
}
