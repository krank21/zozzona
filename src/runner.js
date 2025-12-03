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
import { encryptFileSync } from "./zozzonaUtils.js";
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
// DIST PIPELINE CONFIG
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

// ===============================================================
// OBFUSCATE JS (dist)
// ===============================================================
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

// ===============================================================
// MINIFY JS (dist)
// ===============================================================
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

// ===============================================================
// MINIFY JSON (dist)
// ===============================================================
function minifyJSONFiles(jsonFiles) {
  for (const file of jsonFiles) {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    fs.writeFileSync(file, JSON.stringify(data));
    console.log("Minified JSON (dist):", file);
  }
}

// ===============================================================
// ENCRYPT MAP FILES (dist)
// ===============================================================
function encryptDistMaps(mapFiles) {
  for (const f of mapFiles) {
    encryptFileSync(f);
    fs.removeSync(f);
    console.log("Encrypted map (dist):", f);
  }
}

// ===============================================================
// Helper: run external commands (npm scripts)
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
// SOURCE PACK (old behavior, working)
// ===============================================================
async function runPackPipeline() {
  console.log("🔒 Running PACK (source)…");

  const { PACK_INCLUDE, PACK_IGNORE } = (() => {
    const include = [];
    const ignore = [
      "**/*.json",
      "**/package.json",
      "**/node_modules/**"
    ];

    for (const folder of PACK_CONFIG.folders)
      include.push(`${folder}/**/*.{js,jsx,ts,tsx}`);

    for (const file of PACK_CONFIG.files)
      if (/\.(js|jsx|ts|tsx)$/.test(file)) include.push(file);

    for (const ig of PACK_CONFIG.ignore) ignore.push(ig, `${ig}/**`);

    return {
      PACK_INCLUDE: include.join(","),
      PACK_IGNORE: ignore.join(",")
    };
  })();

  const env = { PACK_INCLUDE, PACK_IGNORE };

  await run("npm", ["run", "obfuscate"], env);
  await run("npm", ["run", "minify"], env);

  console.log("✔ Pack complete");
}

// ===============================================================
// SOURCE UNPACK (old behavior, working)
// ===============================================================
async function runUnpackPipeline() {
  console.log("🔓 Running UNPACK (source)…");

  await run("npm", ["run", "deminify"]);
  await run("npm", ["run", "deobfuscate"]);

  console.log("✔ Unpack complete");
}

// ===============================================================
// DIST PACK PIPELINE
// ===============================================================
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

  if (cmd === "pack:dist") return await runDistPipeline();
  if (cmd === "pack") return await runPackPipeline();
  if (cmd === "unpack") return await runUnpackPipeline();

  console.error("Unknown runner command:", cmd);
  process.exit(1);
})();
