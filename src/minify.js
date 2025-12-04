#!/usr/bin/env node
/**
 * Zozzona reversible JS minifier (BOM-safe)
 * - PACK: minify JS and store original code in minify-map.json
 * - UNPACK: restore original JS files using minify-map.json
 */

import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

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
   Utility: Remove UTF-8 BOM if present
---------------------------------------------------------- */
function stripBOM(str) {
  if (!str) return str;
  // Remove BOM at start of string (EF BB BF)
  return str.replace(/^\uFEFF/, "");
}

/* ----------------------------------------------------------
   GLOB: Collect JS/TS/JSX/TSX files
---------------------------------------------------------- */
async function getJsFiles() {
  if (INCLUDE.length === 0) return [];

  const patterns = INCLUDE.length === 1 ? INCLUDE[0] : `{${INCLUDE.join(",")}}`;

  const files = await glob(patterns, {
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
   MINIFICATION (Terser)
---------------------------------------------------------- */
const terser = require("terser");

async function minifyFile(file, map) {
  let original = await fs.readFile(file, "utf8");

  // ALWAYS strip BOM before use
  original = stripBOM(original);

  // Save original for reversal
  map[file] = original;

  try {
    const result = await terser.minify(original, {
      compress: true,
      mangle: true,
      ecma: 2020
    });

    if (!result.code) {
      console.warn(`⚠ Minifier returned empty output for ${file}`);
      return;
    }

    await fs.writeFile(file, result.code, "utf8");
    console.log(`Minified ${file}`);
  } catch (err) {
    console.warn(`⚠ Minification failed for ${file}: ${err.message}`);
  }
}

/* ----------------------------------------------------------
   DEMINIFY (restore original)
---------------------------------------------------------- */
async function deminifyFile(file, map) {
  if (!map[file]) {
    console.warn(`⚠ No original source stored for ${file}`);
    return;
  }

  // Restore exactly as saved (without BOM)
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

  if (cmd === "deminify") {
    if (!await fs.pathExists(MAP_FILE)) {
      console.error("❌ No minify-map.json found — cannot deminify.");
      process.exit(1);
    }

    const map = await fs.readJson(MAP_FILE);

    for (const file of files) {
      await deminifyFile(file, map);
    }

    return;
  }

  console.log("Usage: minify.js [minify|deminify]");
}

main();
