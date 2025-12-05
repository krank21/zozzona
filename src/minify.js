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
// RESPECT ENV VARIABLES SET BY RUNNER (same as obfuscate.js)
// ------------------------------------------------------------
function getSourceFiles() {
  // Check if runner.js set these env vars
  const packInclude = process.env.PACK_INCLUDE;
  const packIgnore = process.env.PACK_IGNORE;

  let patterns = "**/*.{js,jsx,ts,tsx}";
  let ignore = [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/*.enc",
    "**/*.map"
  ];

  // If runner.js set patterns, use those instead
  if (packInclude) {
    const rawPatterns = packInclude.split("|");  // Split by | not comma (to preserve {js,jsx,ts,tsx})
    console.log(`📋 Raw PACK_INCLUDE patterns: ${rawPatterns.length} patterns`);
    console.log(`   Patterns: ${JSON.stringify(rawPatterns.slice(0, 5))}...`);

    // Filter to only glob patterns (not bare folder names)
    // Keep patterns that contain * or end with file extensions
    patterns = rawPatterns.filter(p =>
      p.includes('*') || /\.(js|jsx|ts|tsx)$/.test(p)
    );

    console.log(`📋 Filtered to ${patterns.length} valid glob patterns`);
    console.log(`   Using: ${JSON.stringify(patterns)}`);
  }

  if (packIgnore) {
    const additionalIgnore = packIgnore.split("|").filter(p => p.trim());
    console.log(`🚫 Raw ignore patterns: ${JSON.stringify(additionalIgnore)}`);

    // Don't add patterns that would exclude .js files
    const safeIgnore = additionalIgnore.filter(p =>
      !p.includes('*.js') &&
      !p.includes('*.jsx') &&
      !p.includes('*.ts') &&
      !p.includes('*.tsx')
    );
    ignore.push(...safeIgnore);
    console.log(`🚫 Using ${safeIgnore.length} PACK_IGNORE patterns`);
    console.log(`   Final ignore: ${JSON.stringify(ignore)}`);
  }

  console.log(`🔍 About to glob with:`);
  console.log(`   Patterns: ${JSON.stringify(patterns)}`);
  console.log(`   Ignore: ${JSON.stringify(ignore)}`);

  const files = globSync(patterns, { ignore, nodir: true });

  console.log(`🔍 Glob found ${files.length} files`);
  if (files.length > 0) {
    console.log(`   First 3 files: ${JSON.stringify(files.slice(0, 3))}`);
  }

  // Filter out non-JS files that might have snuck in
  const filtered = files.filter(f => /\.(js|jsx|ts|tsx)$/.test(f));

  console.log(`✅ Filtered to ${filtered.length} JS/TS files`);

  return filtered;
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

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    try {
      await transformAndMinify(file);
      successCount++;
    } catch (err) {
      failCount++;
      console.warn(`⚠ Unhandled error minifying ${file}: ${err.message}`);
    }
  }

  const mapSize = Object.keys(restoreMap).length;
  console.log(`\n📊 Minification complete:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📦 Map size: ${mapSize} files`);
  console.log(`📝 Saving restore map...`);

  try {
    // Write map so UNPACK can restore originals
    fs.writeFileSync(MAP_FILE, JSON.stringify(restoreMap, null, 2), "utf8");
    console.log(`✔ Saved reversible map → ${MAP_FILE}`);
  } catch (err) {
    console.error(`❌ Failed to save map: ${err.message}`);
    process.exit(1);
  }
})();
