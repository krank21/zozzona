#!/usr/bin/env node
/**
 * Zozzona reversible JS minifier with JSX/TS support.
 * PACK:
 *   - Babel transform (JSX → JS)
 *   - Minify with Terser
 *   - Save ORIGINAL source in minify-map.json
 *
 * UNPACK:
 *   - Restore original source files
 */

import fs from "fs-extra";
import { glob } from "glob";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const babel = require("@babel/core");
const terser = require("terser");

const MAP_FILE = "minify-map.json";

/* ----------------------------------------------------------
   Resolve PACK_INCLUDE / PACK_IGNORE
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
   Get JS/JSX/TS/TSX files
---------------------------------------------------------- */
async function getJsFiles() {
  if (!INCLUDE.length) return [];

  const pattern =
    INCLUDE.length === 1 ? INCLUDE[0] : `{${INCLUDE.join(",")}}`;

  const files = await glob(pattern, {
    nodir: true,
    ignore: [
      ...IGNORE,
      "**/*.json",
      "**/*.css",
      "**/node_modules/**"
    ]
  });

  return files.filter(f => /\.(js|jsx|ts|tsx)$/.test(f));
}

/* ----------------------------------------------------------
   TRANSPILE + MINIFY
---------------------------------------------------------- */
async function transformAndMinify(file, map) {
  const original = await fs.readFile(file, "utf8");
  map[file] = original;

  try {
    // 1. Babel → turn JSX into JS
    const babelOut = await babel.transformAsync(original, {
      presets: [
        require("@babel/preset-react"),
        require("@babel/preset-typescript")
      ],
      sourceMaps: false,
      ast: false
    });

    if (!babelOut || !babelOut.code) {
      console.warn(`⚠ Babel returned empty output for ${file}`);
      return;
    }

    // 2. Terser minify
    const minOut = await terser.minify(babelOut.code, {
      compress: true,
      mangle: true
    });

    if (!minOut.code) {
      console.warn(`⚠ Terser returned empty output for ${file}`);
      return;
    }

    await fs.writeFile(file, minOut.code, "utf8");
    console.log(`Minified ${file}`);

  } catch (err) {
    console.warn(`⚠ Minification failed for ${file}: ${err.message}`);
  }
}

/* ----------------------------------------------------------
   RESTORE original JS files
---------------------------------------------------------- */
async function restoreFiles(files, map) {
  for (const file of files) {
    if (!map[file]) {
      console.warn(`⚠ No original stored for ${file}`);
      continue;
    }

    await fs.writeFile(file, map[file], "utf8");
    console.log(`Restored ${file}`);
  }
}

/* ----------------------------------------------------------
   MAIN
---------------------------------------------------------- */
async function main() {
  const cmd = process.argv[2] || "minify";
  const files = await getJsFiles();

  if (!files.length) {
    console.log("ℹ No JS files to process.");
    return;
  }

  if (cmd === "minify") {
    let map = {};
    if (await fs.pathExists(MAP_FILE)) {
      map = await fs.readJson(MAP_FILE);
    }

    for (const file of files) {
      await transformAndMinify(file, map);
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
    await restoreFiles(files, map);
    return;
  }

  console.log("Usage: minify.js [minify|restore]");
}

main();
