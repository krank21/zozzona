#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sync as globSync } from "glob";
import * as babel from "@babel/core";
import { minify } from "terser";

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
      const content = fs.readFileSync(MAP_FILE, "utf8");
      restoreMap = JSON.parse(content);
      console.log(`📖 Loaded restore map with ${Object.keys(restoreMap).length} files`);
    } catch (err) {
      console.error(`❌ Failed to read minify-map.json: ${err.message}`);
      process.exit(1);
    }
  } else {
    console.warn(`⚠ ${MAP_FILE} does not exist`);
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
      filename: file,
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
    const minified = await minify(babelCode, {
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
  if (!fs.existsSync(file)) {
    console.warn(`⚠ File no longer exists: ${file}`);
    return;
  }
  fs.writeFileSync(file, original, "utf8");
  console.log(`Restored ${file}`);
}

// ------------------------------------------------------------
// MAIN EXECUTION
// ------------------------------------------------------------
(async function main() {
  if (MODE === "restore") {
    loadRestoreMap();

    const fileCount = Object.keys(restoreMap).length;

    if (fileCount === 0) {
      console.warn("⚠ No files to restore (map is empty)");
      return;
    }

    console.log(`🔄 Restoring ${fileCount} files...`);

    for (const [file, original] of Object.entries(restoreMap)) {
      restoreOriginal(file, original);
    }

    console.log("✔ Restore complete");
    return;
  }

  // MODE === "minify"
  const files = getSourceFiles();

  console.log(`📁 Found ${files.length} files to minify`);

  for (const file of files) {
    await transformAndMinify(file);
  }

  const mapSize = Object.keys(restoreMap).length;
  console.log(`📝 Saving restore map with ${mapSize} files...`);

  // Write map so UNPACK can restore originals
  fs.writeFileSync(MAP_FILE, JSON.stringify(restoreMap, null, 2), "utf8");

  console.log(`✔ Saved reversible map → ${MAP_FILE}`);
})();
