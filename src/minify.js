#!/usr/bin/env node
/**
 * Zozzona reversible JS minifier (NOW JSX-SAFE)
 *
 * PACK:
 *   - Babel transforms JSX/TSX → pure JS
 *   - Terser minifies
 *   - Original source stored in minify-map.json
 *
 * UNPACK:
 *   - Restores original JS/JSX exactly as written
 */

import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const babel = require("@babel/core");
const terser = require("terser");

const MAP_FILE = "minify-map.json";

/* ----------------------------------------------------------
   Resolve PACK_INCLUDE and PACK_IGNORE
---------------------------------------------------------- */
function resolvePatterns() {
  const include = process.env.PACK_INCLUDE
    ? process.env.PACK_INCLUDE.split(",").filter(Boolean)
    : [];

  const ignore = process.env.PACK_IGNORE
    ? process.env.PACK_IGNORE.split(",").filter(Boolean)
    : [];

  return { include, ignore };
}

const { include: INCLUDE, ignore: IGNORE } = resolvePatterns();

/* ----------------------------------------------------------
   GLOB: Collect JS/TS/JSX/TSX files
---------------------------------------------------------- */
async function getJsFiles() {
  if (INCLUDE.length === 0) return [];

  const patterns =
    INCLUDE.length === 1 ? INCLUDE[0] : `{${INCLUDE.join(",")}}`;

  const files = await glob(patterns, {
    nodir: true,
    ignore: [
      ...IGNORE,
      "**/*.json",
      "**/*.css",
      "**/node_modules/**"
    ]
  });

  return files.filter(f =>
    /\.(js|jsx|ts|tsx)$/.test(f)
  );
}

/* ----------------------------------------------------------
   Babel Transform JSX → JS
---------------------------------------------------------- */
async function transformWithBabel(code, filename) {
  try {
    const result = await babel.transformAsync(code, {
      filename,
      presets: [
        require("@babel/preset-react"),
        require("@babel/preset-typescript")
      ],
      plugins: [],
      sourceMaps: false
    });

    return result.code;
  } catch (err) {
    console.warn(`⚠ Babel failed on ${filename}: ${err.message}`);
    return code; // fallback, allow Terser to try
  }
}

/* ----------------------------------------------------------
   MINIFY FILE (Reversible)
---------------------------------------------------------- */
async function minifyFile(file, map) {
  const original = await fs.readFile(file, "utf8");
  map[file] = original; // store original code

  try {
    // First: JSX → JS
    const jsCode = await transformWithBabel(original, file);

    // Second: Minify
    const minified = await terser.minify(jsCode, {
      compress: true,
      mangle: true,
      ecma: 2020,
      sourceMap: false
    });

    if (!minified.code) {
      console.warn(`⚠ Terser returned empty output for ${file}`);
      return;
    }

    await fs.writeFile(file, minified.code, "utf8");
    console.log(`Minified ${file}`);
  } catch (err) {
    console.warn(`⚠ Minification failed for ${file}: ${err.message}`);
  }
}

/* ----------------------------------------------------------
   RESTORE ORIGINAL FILES
---------------------------------------------------------- */
async function deminifyFile(file, map) {
  if (!map[file]) {
    console.warn(`⚠ No original source stored for ${file}`);
    return;
  }

  await fs.writeFile(file, map[file], "utf8");
  console.log(`Restored ${file}`);
}

/* ----------------------------------------------------------
   MAIN
---------------------------------------------------------- */
async function main() {
  const cmd = process.argv[2] || "minify";
  const files = await getJsFiles();

  if (files.length === 0) {
    console.log("ℹ No JS files to process.");
    return;
  }

  if (cmd === "minify") {
    const map = (await fs.pathExists(MAP_FILE))
      ? await fs.readJson(MAP_FILE)
      : {};

    for (const file of files) {
      await minifyFile(file, map);
    }

    await fs.writeJson(MAP_FILE, map, { spaces: 2 });
    console.log(`Saved reversible map → ${MAP_FILE}`);
    return;
  }

  if (cmd === "restore" || cmd === "deminify") {
    if (!await fs.pathExists(MAP_FILE)) {
      console.error("❌ No minify-map.json found — cannot restore.");
      process.exit(1);
    }

    const map = await fs.readJson(MAP_FILE);

    for (const file of files) {
      await deminifyFile(file, map);
    }

    return;
  }

  console.log("Usage: minify.js [minify|restore]");
}

main();
