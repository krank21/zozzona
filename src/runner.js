#!/usr/bin/env node
import { spawn } from "child_process";
import fs from "fs-extra";
import path from "path";
import { sync as globSync } from "glob";
import dotenv from "dotenv";
import { encryptFileSync, decryptFileSync } from "./zozzonaUtils.js";
import { loadPackConfig } from "./config.js";

dotenv.config();
if (!process.env.MAP_KEY) {
  console.error("❌ Missing MAP_KEY in .env");
  process.exit(1);
}

const PACK_CONFIG = loadPackConfig();

// Build **only JS-related** include patterns
function buildIncludePatterns() {
  const patterns = [];

  for (const folder of PACK_CONFIG.folders) {
    patterns.push(`${folder}/**/*.{js,jsx,ts,tsx}`);
  }

  // Only allow JS files in files[] (skip JSON)
  for (const file of PACK_CONFIG.files) {
    if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      patterns.push(file);
    } else {
      console.warn(`⚠ Skipping non-JS file in pack.config.json files[]: ${file}`);
    }
  }

  return patterns;
}

// Build ignore list (JSON gets ignored automatically)
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

const MAP_FILES = [
  "minify-map.json",
  "terser-name-cache.json",
  "obfuscation-map.json"
];

async function run(cmd, args = [], env = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {
      stdio: "inherit",
      shell: true,
      env: { ...process.env, ...env }
    });
    p.on("close", code => code === 0 ? resolve() : reject(code));
  });
}

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

// MAIN
(async () => {
  const task = process.argv[2];
  const env = buildGlobEnv();

  if (task === "pack") {
    await clearMaps();
    await run("npm", ["run", "obfuscate"], env);
    await run("npm", ["run", "minify"], env);
    encryptMaps();
    console.log("✔ Pack complete");
    return;
  }

  if (task === "unpack") {
    decryptMaps();
    await run("npm", ["run", "deminify"], env);
    await run("npm", ["run", "deobfuscate"], env);
    await clearMaps();
    console.log("✔ Unpack complete");
    return;
  }

  console.log("Usage: runner.js [pack|unpack]");
})();
