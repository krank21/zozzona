#!/usr/bin/env node
import { spawn } from "child_process";
import fs from "fs-extra";
import path from "path";
import { sync as globSync } from "glob";
import dotenv from "dotenv";
import { encryptFileSync, decryptFileSync } from "./zozzonaUtils.js";
import { loadPackConfig } from "./config.js";

// Load config
const PACK_CONFIG = loadPackConfig();

function buildGlobs() {
  const includeGlobs = [];
  const ignoreGlobs = [];

  for (const folder of PACK_CONFIG.folders) {
    includeGlobs.push(`${folder}/**/*.js`);
  }

  for (const file of PACK_CONFIG.files) {
    includeGlobs.push(file);
  }

  for (const ig of PACK_CONFIG.ignore) {
    ignoreGlobs.push(ig, `${ig}/**`);
  }

  return {
    include: includeGlobs.join(","),
    ignore: ignoreGlobs.join(","),
  };
}

// Load .env
dotenv.config();
if (!process.env.MAP_KEY) {
  console.error("❌ Missing MAP_KEY in .env");
  process.exit(1);
}

// Important map files
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

  for (const f of globSync("src/**/*.map"))      await remove(f);
  for (const f of globSync("src/**/*.map.enc"))  await remove(f);
}

function encryptMaps() {
  for (const f of MAP_FILES) {
    if (fs.existsSync(f)) {
      encryptFileSync(f);
      fs.removeSync(f);
    }
  }

  for (const f of globSync("src/**/*.map")) {
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

  for (const f of globSync("src/**/*.map.enc")) {
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
  const globs = buildGlobs();

  const ENV = {
    PACK_INCLUDE: globs.include,
    PACK_IGNORE: globs.ignore
  };

  if (task === "pack") {
    await clearMaps();
    await run("npm", ["run", "obfuscate"], ENV);
    await run("npm", ["run", "minify"], ENV);
    encryptMaps();
    console.log("✔ Pack complete");
    return;
  }

  if (task === "unpack") {
    decryptMaps();
    await run("npm", ["run", "deminify"], ENV);
    await run("npm", ["run", "deobfuscate"], ENV);
    await clearMaps();
    console.log("✔ Unpack complete");
    return;
  }

  console.log("Usage: runner.js [pack|unpack]");
})();
