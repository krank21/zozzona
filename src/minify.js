#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import { sync as globSync } from "glob";

// Terser is ESM; we'll import it lazily inside async functions
let terser = null;
async function getTerser() {
  if (!terser) {
    const mod = await import("terser");
    terser = mod;
  }
  return terser;
}

const MODE = process.argv[2] || "minify";

const MINIFY_MAP_FILE = "minify-map.json";
const NAME_CACHE_FILE = "terser-name-cache.json";

// ---------------------------------------------------------------------
// Utility: resolve files from PACK_INCLUDE / PACK_IGNORE
// ---------------------------------------------------------------------
function getTargetFilesFromEnv() {
  const includeEnv = process.env.PACK_INCLUDE || "";
  const ignoreEnv = process.env.PACK_IGNORE || "";

  const includePatterns = includeEnv
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const ignorePatterns = ignoreEnv
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const files = new Set();

  for (const pattern of includePatterns) {
    const matches = globSync(pattern, {
      ignore: ignorePatterns,
      nodir: true
    });

    for (const f of matches) {
      // Only JS/TS-like files here; JSON/CSS handled by runner separately
      if (/\.(js|jsx|ts|tsx)$/.test(f)) {
        files.add(f);
      }
    }
  }

  return Array.from(files);
}

// ---------------------------------------------------------------------
// MINIFY MODE: run by `npm run minify`
// ---------------------------------------------------------------------
async function runMinify() {
  const files = getTargetFilesFromEnv();
  if (files.length === 0) {
    console.log("ℹ No JS/TS files matched for minification.");
    return;
  }

  const { minify } = await getTerser();

  // Map of file → originalSource (for reversible deminify)
  const originalMap = {};

  // optional name cache for Terser
  let nameCache = {};
  if (fs.existsSync(NAME_CACHE_FILE)) {
    try {
      nameCache = JSON.parse(fs.readFileSync(NAME_CACHE_FILE, "utf8"));
    } catch {
      nameCache = {};
    }
  }

  for (const file of files) {
    const code = fs.readFileSync(file, "utf8");
    originalMap[file] = code;

    const result = await minify(code, {
      compress: true,
      mangle: {
        toplevel: true,
        properties: false
      },
      nameCache
    });

    if (!result.code) {
      console.warn(`⚠ Skipping (no minified output) ${file}`);
      continue;
    }

    // Update nameCache from Terser result
    if (result.nameCache) {
      nameCache = result.nameCache;
    }

    fs.writeFileSync(file, result.code, "utf8");
    console.log("Minified", file);
  }

  // Write reversible map
  fs.writeFileSync(MINIFY_MAP_FILE, JSON.stringify(originalMap), "utf8");

  // Persist name cache if any
  if (Object.keys(nameCache).length > 0) {
    fs.writeFileSync(NAME_CACHE_FILE, JSON.stringify(nameCache), "utf8");
  }
}

// ---------------------------------------------------------------------
// RESTORE MODE: run by `npm run deminify`
// ---------------------------------------------------------------------
async function runRestore() {
  if (!fs.existsSync(MINIFY_MAP_FILE)) {
    console.log("ℹ No minify-map.json found. Nothing to restore.");
    return;
  }

  let map;
  try {
    map = JSON.parse(fs.readFileSync(MINIFY_MAP_FILE, "utf8"));
  } catch (err) {
    console.error("❌ Failed to parse minify-map.json:", err.message);
    process.exit(1);
  }

  for (const [file, original] of Object.entries(map)) {
    if (fs.existsSync(file)) {
      fs.writeFileSync(file, original, "utf8");
      console.log("Restored", file);
    } else {
      console.warn(`⚠ Skipping restore, file missing: ${file}`);
    }
  }
}

// ---------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------
(async () => {
  if (MODE === "minify") {
    await runMinify();
  } else if (MODE === "restore") {
    await runRestore();
  } else {
    console.log("Usage: minify.js [minify|restore]");
    process.exit(1);
  }
})();
