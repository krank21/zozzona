#!/usr/bin/env node
/**
 * Reversible JS Minifier for Zozzona
 * - Respects PACK_INCLUDE / PACK_IGNORE from runner.js
 * - Parses TS/JSX with Babel
 * - Minifies via Terser
 */

import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

/* ------------------------------------------------------------------
   Load PACK_INCLUDE and PACK_IGNORE from environment
------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------
   Babel Parser (same config as obfuscation)
------------------------------------------------------------------ */
const parser = require("@babel/parser");
const traversePkg = require("@babel/traverse");
const traverse = traversePkg.default || traversePkg;

function parse(code, filename) {
  const isTS = filename.endsWith(".ts") || filename.endsWith(".tsx");

  return parser.parse(code, {
    sourceType: "unambiguous",
    plugins: [
      "jsx",
      isTS ? "typescript" : null,
      "classProperties",
      "optionalChaining",
      "nullishCoalescingOperator",
      "objectRestSpread",
      "decorators-legacy"
    ].filter(Boolean)
  });
}

/* ------------------------------------------------------------------
   Resolve all JS files eligible for minification
------------------------------------------------------------------ */
async function getJsFiles() {
  if (INCLUDE.length === 0) return [];

  const files = await glob(INCLUDE.length === 1 ? INCLUDE[0] : `{${INCLUDE.join(",")}}`, {
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

/* ------------------------------------------------------------------
   MINIFICATION (Terser)
------------------------------------------------------------------ */
const terser = require("terser");

async function minifyFile(file) {
  const code = await fs.readFile(file, "utf8");

  try {
    const result = await terser.minify(code, {
      compress: true,
      mangle: true,
      sourceMap: false,
      ecma: 2020
    });

    if (!result.code) {
      console.warn(`⚠ Terser produced empty output for ${file}`);
      return;
    }

    await fs.writeFile(file, result.code, "utf8");
    console.log(`Minified ${file}`);
  } catch (err) {
    console.warn(`⚠ Minification failed for ${file}: ${err.message}`);
  }
}

/* ------------------------------------------------------------------
   MAIN
------------------------------------------------------------------ */
async function main() {
  const files = await getJsFiles();

  if (files.length === 0) {
    console.log("ℹ No JS/TS files matched for minification.");
    return;
  }

  for (const file of files) {
    await minifyFile(file);
  }
}

main();
