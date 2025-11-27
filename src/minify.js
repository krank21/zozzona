#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const terser = require("terser");

const NAME_CACHE_FILE = "terser-name-cache.json";
const MINIFY_MAP_FILE = "minify-map.json";

// Build include/ignore
function buildPattern() {
  const inc = process.env.PACK_INCLUDE?.split(",") || [];
  const ign = process.env.PACK_IGNORE?.split(",") || [];

  process.env.MIN_IGNORE = ign.join(",");

  if (inc.length === 1) return inc[0];
  if (inc.length > 1) return `{${inc.join(",")}}`;

  return "src/**/*.{js,jsx,ts,tsx}";
}

const PATTERN = buildPattern();

async function readFiles() {
  const ignore = [
    "**/node_modules/**",
    "**/*.min.js",
    MINIFY_MAP_FILE
  ];

  if (process.env.MIN_IGNORE) {
    ignore.push(...process.env.MIN_IGNORE.split(","));
  }

  return await glob(PATTERN, {
    nodir: true,
    ignore
  });
}

function encode(text) { return Buffer.from(text, "utf8").toString("base64"); }
function decode(b64) { return Buffer.from(b64, "base64").toString("utf8"); }

async function minify() {
  const files = await readFiles();
  if (!files.length) return;

  const map = (await fs.pathExists(MINIFY_MAP_FILE))
    ? await fs.readJson(MINIFY_MAP_FILE)
    : {};

  const nameCache = (await fs.pathExists(NAME_CACHE_FILE))
    ? await fs.readJson(NAME_CACHE_FILE)
    : { vars: { props: {} } };

  for (const file of files) {
    const abs = path.resolve(file);
    const original = await fs.readFile(abs, "utf8");

    const origHash = encode(original).slice(0, 16);
    if (map[file]?.origHash === origHash) continue;

    const res = await terser.minify(
      { [path.basename(file)]: original },
      {
        compress: true,
        mangle: { toplevel: false },
        sourceMap: {
          filename: path.basename(file),
          url: path.basename(file) + ".map"
        },
        nameCache
      }
    );

    if (!res.code) continue;

    map[file] = {
      original_b64: encode(original),
      origHash,
      minified_at: new Date().toISOString()
    };

    const clean = res.code.replace(/\/\/# sourceMappingURL=.*\n?/g, "");
    await fs.writeFile(abs, clean);

    if (res.map) {
      await fs.writeFile(abs + ".map", typeof res.map === "string" ? res.map : JSON.stringify(res.map));
    }

    console.log("Minified", file);
  }

  await fs.writeJson(MINIFY_MAP_FILE, map, { spaces: 2 });
  await fs.writeJson(NAME_CACHE_FILE, nameCache, { spaces: 2 });
}

async function restore() {
  if (!await fs.pathExists(MINIFY_MAP_FILE)) return;

  const map = await fs.readJson(MINIFY_MAP_FILE);

  for (const file of Object.keys(map)) {
    const abs = path.resolve(file);
    const original = decode(map[file].original_b64);
    await fs.mkdirp(path.dirname(abs));
    await fs.writeFile(abs, original);

    const m = abs + ".map";
    if (await fs.pathExists(m)) await fs.remove(m);

    console.log("Restored", file);
  }
}

(async () => {
  const cmd = process.argv[2];

  if (cmd === "minify") await minify();
  else if (cmd === "deminify" || cmd === "restore") await restore();
  else console.log("Usage: minify.js [minify|restore]");
})();
