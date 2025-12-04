#!/usr/bin/env node

// ---------------------------------------------------------------
// FORCE TTY MODE (spinner support under npm / husky)
// ---------------------------------------------------------------
if (!process.stdout.isTTY) process.stdout.isTTY = true;

import { spawn } from "child_process";
import fs from "fs-extra";
import path from "path";
import { sync as globSync } from "glob";
import dotenv from "dotenv";
import { encryptFileSync, decryptFileSync } from "./zozzonaUtils.js";
import { loadPackConfig } from "./config.js";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------
// Resolve THIS package root
// ---------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OBFUSCATE_PLUGIN = path.join(__dirname, "babel-obfuscate-plugin.cjs");

dotenv.config();
if (!process.env.MAP_KEY) {
  console.error("❌ Missing MAP_KEY in .env");
  process.exit(1);
}

const PACK_CONFIG = loadPackConfig();

// ===============================================================
// SHARED HELPER: run external commands (npm scripts)
// ===============================================================
async function run(cmd, args = [], env = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {
      stdio: "inherit",
      shell: true,
      env: { ...process.env, ...env }
    });
    p.on("close", code => (code === 0 ? resolve() : reject(code)));
  });
}

// ===============================================================
// ORIGINAL REVERSIBLE SOURCE PIPELINE (pack / unpack, JS only)
// ===============================================================

// Build **only JS-related** include patterns
function buildIncludePatterns() {
  const patterns = [];

  for (const folder of PACK_CONFIG.folders) {
    patterns.push(`${folder}/**/*.{js,jsx,ts,tsx}`);
  }

  for (const file of PACK_CONFIG.files) {
    if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      patterns.push(file);
    } else {
      console.warn(`⚠ Skipping non-JS file in pack.config.json files[]: ${file}`);
    }
  }

  return patterns;
}

// Build ignore list (JSON gets ignored automatically by JS pipeline)
function buildIgnorePatterns() {
  const ignore = [
    "**/*.json",
    "**/package.json",
    "**/package-lock.json",
    "**/yarn.lock",
    "**/pnpm-lock.yaml",
    "**/node_modules/**"
  ];

  for (const ig of PACK_CONFIG.ignore) {
    ignore.push(ig, `${ig}/**`);
  }

  return ignore;
}

function buildGlobEnv() {
  const includePatterns = buildIncludePatterns();
  const ignorePatterns = buildIgnorePatterns();

  return {
    PACK_INCLUDE: includePatterns.join(","),
    PACK_IGNORE: ignorePatterns.join(",")
  };
}

// ===============================================================
// MAP FILES (JS + JSON + CSS)
// ===============================================================
const MAP_FILES = [
  "minify-map.json",
  "terser-name-cache.json",
  "obfuscation-map.json",
  "json-minify-map.json",
  "css-minify-map.json"
];

async function remove(file) {
  if (await fs.pathExists(file)) await fs.remove(file);
}

async function clearMaps() {
  for (const f of MAP_FILES) {
    await remove(f);
    await remove(f + ".enc");
  }

  for (const f of globSync("**/*.map")) await remove(f);
  for (const f of globSync("**/*.map.enc")) await remove(f);
}

function encryptMaps() {
  for (const f of MAP_FILES) {
    if (fs.existsSync(f)) {
      encryptFileSync(f);
      fs.removeSync(f);
    }
  }

  for (const f of globSync("**/*.map")) {
    encryptFileSync(f);
    fs.removeSync(f);
  }
}

function decryptMaps() {
  let error = false;

  for (const f of MAP_FILES) {
    const enc = f + ".enc";
    if (fs.existsSync(enc)) {
      try {
        decryptFileSync(enc, f);
      } catch {
        error = true;
      }
    }
  }

  for (const f of globSync("**/*.map.enc")) {
    try {
      decryptFileSync(f, f.replace(".enc", ""));
    } catch {
      error = true;
    }
  }

  if (error) {
    console.error("❌ Decryption failed. Bad MAP_KEY?");
    process.exit(1);
  }
}

// ===============================================================
// REVERSIBLE JSON + CSS MINIFY (SOURCE)
// ===============================================================

function getJsonAndCssSourceFiles() {
  const ignore = [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.git/**"
  ];

  for (const ig of PACK_CONFIG.ignore) {
    ignore.push(ig, `${ig}/**`);
  }

  const jsonFiles = [];
  const cssFiles = [];

  for (const folder of PACK_CONFIG.folders) {
    const base = folder.replace(/\/+$/, "");
    jsonFiles.push(
      ...globSync(`${base}/**/*.json`, { ignore })
    );
    cssFiles.push(
      ...globSync(`${base}/**/*.css`, { ignore })
    );
  }

  return { jsonFiles, cssFiles };
}

function minifyCssString(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;}/g, "}");
}

async function reversibleMinifyJsonAndCss() {
  const { jsonFiles, cssFiles } = getJsonAndCssSourceFiles();

  const jsonMap = {};
  const cssMap = {};

  for (const file of jsonFiles) {
    try {
      const original = fs.readFileSync(file, "utf8");
      jsonMap[file] = original;
      const data = JSON.parse(original);
      fs.writeFileSync(file, JSON.stringify(data), "utf8");
      console.log("Minified JSON (source):", file);
    } catch (err) {
      console.warn(`⚠ Skipping JSON (invalid?) ${file}:`, err.message);
    }
  }

  for (const file of cssFiles) {
    try {
      const original = fs.readFileSync(file, "utf8");
      cssMap[file] = original;
      const minified = minifyCssString(original);
      fs.writeFileSync(file, minified, "utf8");
      console.log("Minified CSS (source):", file);
    } catch (err) {
      console.warn(`⚠ Skipping CSS ${file}:`, err.message);
    }
  }

  if (Object.keys(jsonMap).length > 0)
    fs.writeFileSync("json-minify-map.json", JSON.stringify(jsonMap), "utf8");

  if (Object.keys(cssMap).length > 0)
    fs.writeFileSync("css-minify-map.json", JSON.stringify(cssMap), "utf8");
}

function restoreJsonAndCssFromMaps() {
  if (fs.existsSync("json-minify-map.json")) {
    try {
      const jsonMap = JSON.parse(fs.readFileSync("json-minify-map.json", "utf8"));
      for (const [file, original] of Object.entries(jsonMap)) {
        if (fs.existsSync(file)) {
          fs.writeFileSync(file, original, "utf8");
          console.log("Restored JSON (source):", file);
        }
      }
    } catch (err) {
      console.warn("⚠ Failed to restore JSON:", err.message);
    }
  }

  if (fs.existsSync("css-minify-map.json")) {
    try {
      const cssMap = JSON.parse(fs.readFileSync("css-minify-map.json", "utf8"));
      for (const [file, original] of Object.entries(cssMap)) {
        if (fs.existsSync(file)) {
          fs.writeFileSync(file, original, "utf8");
          console.log("Restored CSS (source):", file);
        }
      }
    } catch (err) {
      console.warn("⚠ Failed to restore CSS:", err.message);
    }
  }
}

// ===============================================================
// Full reversible PACK pipeline (source)
// ===============================================================
async function runPackPipeline() {
  console.log("🔒 Running PACK (source)…");
  const env = buildGlobEnv();

  await clearMaps();
  await run("npm", ["run", "obfuscate"], env);
  await run("npm", ["run", "minify"], env);

  await reversibleMinifyJsonAndCss();
  encryptMaps();

  console.log("✔ Pack complete");
}

// ===============================================================
// Full reversible UNPACK pipeline (source)
// ===============================================================
async function runUnpackPipeline() {
  console.log("🔓 Running UNPACK (source)…");
  const env = buildGlobEnv();

  decryptMaps();
  restoreJsonAndCssFromMaps();

  await run("npm", ["run", "deminify"], env);
  await run("npm", ["run", "deobfuscate"], env);

  await clearMaps();

  console.log("✔ Unpack complete");
}

// ===============================================================
// DIST PIPELINE
// ===============================================================
const DIST_ROOT = "server/client/dist";

function getDistJSFiles() {
  return globSync(`${DIST_ROOT}/**/*.js`).filter(f => !f.endsWith(".enc"));
}

function getDistJSONFiles() {
  return globSync(`${DIST_ROOT}/**/*.json`).filter(f => !f.endsWith(".enc"));
}

function getDistMapFiles() {
  return globSync(`${DIST_ROOT}/**/*.map`).filter(f => !f.endsWith(".enc"));
}

async function obfuscateDist(jsFiles) {
  const babel = (await import("@babel/core")).default;

  for (const file of jsFiles) {
    const start = Date.now();
    console.log(`\n⚙️  Obfuscating (dist): ${file}`);

    const frames = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];
    let i = 0;
    let spinning = true;

    const spinner = setInterval(() => {
      if (!spinning) return;
      process.stdout.write(`\r${frames[i++ % frames.length]} Working...   `);
    }, 80);

    try {
      const source = fs.readFileSync(file, "utf8");
      const { code } = await babel.transformAsync(source, {
        presets: [],
        plugins: [[OBFUSCATE_PLUGIN, {}]],
        sourceMaps: false
      });

      fs.writeFileSync(file, code, "utf8");
    } finally {
      spinning = false;
      clearInterval(spinner);
      process.stdout.write("\r                           \r");

      const secs = ((Date.now() - start) / 1000).toFixed(2);
      console.log(`✔ Obfuscated in ${secs}s`);
    }
  }
}

async function minifyDist(jsFiles) {
  const terser = await import("terser");

  for (const file of jsFiles) {
    const code = fs.readFileSync(file, "utf8");
    const result = await terser.minify(code, {
      compress: true,
      mangle: true
    });

    fs.writeFileSync(file, result.code, "utf8");
    console.log("Minified (dist):", file);
  }
}

function minifyJSONFiles(jsonFiles) {
  for (const file of jsonFiles) {
    try {
      const data = JSON.parse(fs.readFileSync(file, "utf8"));
      fs.writeFileSync(file, JSON.stringify(data), "utf8");
      console.log("Minified JSON (dist):", file);
    } catch (err) {
      console.warn(`⚠ Skipping dist JSON (invalid?) ${file}:`, err.message);
    }
  }
}

function encryptDistMaps(mapFiles) {
  for (const f of mapFiles) {
    encryptFileSync(f);
    fs.removeSync(f);
    console.log("Encrypted map (dist):", f);
  }
}

async function runDistPipeline() {
  console.log("📦 Running dist packing pipeline…");

  const js = getDistJSFiles();
  const json = getDistJSONFiles();
  const maps = getDistMapFiles();

  if (js.length === 0 && json.length === 0) {
    console.log("ℹ No dist files found.");
    return;
  }

  await obfuscateDist(js);
  await minifyDist(js);
  minifyJSONFiles(json);
  encryptDistMaps(maps);

  console.log("✔ dist pack complete");
}

// ===============================================================
// MAIN
// ===============================================================
(async () => {
  const cmd = process.argv[2];

  if (cmd === "pack:dist") {
    await runDistPipeline();
    return;
  }

  if (cmd === "pack") {
    await runPackPipeline();
    return;
  }

  if (cmd === "unpack") {
    await runUnpackPipeline();
    return;
  }

  console.log("Usage: runner.js [pack|unpack|pack:dist]");
})();
