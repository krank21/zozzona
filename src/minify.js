#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sync as globSync } from "glob";
import * as babel from "@babel/core";
import terser from "terser";

// JSX + TS support
import presetReact from "@babel/preset-react";
import presetTypescript from "@babel/preset-typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------------------------------------
// CLI
// ------------------------------------------------------------
const MODE = process.argv[2]; // "minify" | "restore"
if (!["minify", "restore"].includes(MODE)) {
  console.error("Usage: minify.js [minify|restore]");
  process.exit(1);
}

// Map to restore original sources
const MAP_FILE = "minify-map.json";
let restoreMap = {};

function loadRestoreMap() {
  if (fs.existsSync(MAP_FILE)) {
    try {
      restoreMap = JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));
    } catch {
      console.error("❌ Failed to read minify-map.json");
      process.exit(1);
    }
  }
}

// ------------------------------------------------------------
// Find source files (only JS/TS/JSX/TSX)
// ------------------------------------------------------------
function getSourceFiles() {
  return globSync("**/*.{js,jsx,ts,tsx}", {
    ignore: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/*.enc",
      "**/*.map"
    ]
  });
}

// ------------------------------------------------------------
// Babel → Terser pipeline
// ------------------------------------------------------------
async function transformAndMinify(file) {
  const original = fs.readFileSync(file, "utf8");

  try {
    // ---------------------------
    // BABEL TRANSFORM
    // ---------------------------
    const babelOut = await babel.transformAsync(original, {
      filename: file,                         // ← REQUIRED FIX
      presets: [
        [presetReact, {}],
        [presetTypescript, {}]
      ],
      sourceMaps: false,
      ast: false
    });

    const babelCode = babelOut.code || original;

    // ---------------------------
    // TERSER MINIFY
    // ---------------------------
    const minified = await terser.minify(babelCode, {
      compress: true,
      mangle: true
    });

    if (!minified.code) {
      console.warn(`⚠ Terser failed for ${file}`);
      return;
    }

    // Save original for reversible restore
    restoreMap[file] = original;

    // Write minified code
    fs.writeFileSync(file, minified.code, "utf8");
    console.log(`Minified ${file}`);

  } catch (err) {
    console.warn(`⚠ Minification failed for ${file}: ${err.message}`);
  }
}

// ------------------------------------------------------------
// RESTORE ORIGINAL SOURCES
// ------------------------------------------------------------
function restoreOriginal(file, original) {
  if (!fs.existsSync(file)) return;
  fs.writeFileSync(file, original, "utf8");
  console.log(`Restored ${file}`);
}

// ------------------------------------------------------------
// MAIN EXECUTION
// ------------------------------------------------------------
(async function main() {
  if (MODE === "restore") {
    loadRestoreMap();

    for (const [file, original] of Object.entries(restoreMap)) {
      restoreOriginal(file, original);
    }

    console.log("✔ Restore complete");
    return;
  }

  // MODE === "minify"
  const files = getSourceFiles();

  const outMap = {};

  for (const file of files) {
    await transformAndMinify(file);
  }

  // Write map so UNPACK can restore originals
  fs.writeFileSync(MAP_FILE, JSON.stringify(restoreMap), "utf8");

  console.log(`Saved reversible map → ${MAP_FILE}`);
})();
