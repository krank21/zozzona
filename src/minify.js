#!/usr/bin/env node
/**
 * Zozzona reversible JS minifier with JSX+TS support.
 *
 * PACK:
 *   - Babel transform (JSX → JS)
 *   - Minify with Terser
 *   - Save originals to minify-map.json
 *
 * UNPACK:
 *   - Restore original source files
 */

import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const babel = require("@babel/core");
const terser = require("terser");

const MAP_FILE = "minify-map.json";

/* ----------------------------------------------------------
   ENV patterns from runner (PACK_INCLUDE / PACK_IGNORE)
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
   Collect JS/JSX/TS/TSX files
---------------------------------------------------------- */
async function getJsFiles() {
  if (!INCLUDE.length) return [];

  const pattern =
    INCLUDE.length === 1 ? INCLUDE[0] : `{${INCLUDE.join(",")}}`;

  const files = await glob(pattern, {
    nodir: true,
    ignore: [
      ...IGNORE,
      "**/*.json",
      "**/*.css",
      "**/node_modules/**"
    ]
  });

  return files.filter(f => /\.(js|jsx|ts|tsx)$/.test(f));
