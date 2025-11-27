#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/* NEW: PACK_INCLUDE / PACK_IGNORE support */
function buildPatternFromEnv() {
  const inc = process.env.PACK_INCLUDE ? process.env.PACK_INCLUDE.split(',') : [];
  const ign = process.env.PACK_IGNORE ? process.env.PACK_IGNORE.split(',') : [];

  let pattern;
  if (inc.length === 1) pattern = inc[0];
  else if (inc.length > 1) pattern = `{${inc.join(',')}}`;

  process.env.OBF_IGNORE = ign.join(',');
  return pattern;
}
const CONFIG_PATTERN = buildPatternFromEnv();
/* -------------------------------------------------------- */

const parser = require('@babel/parser');
const traversePkg = require('@babel/traverse');
const generatePkg = require('@babel/generator');
const traverse = traversePkg.default || traversePkg;
const generate = generatePkg.default || generatePkg;

const DEFAULT_GLOB = 'src/**/*.{js,jsx,ts,tsx}';
const MAP_FILE = 'obfuscation-map.json';

// UPDATED readAllFiles()
async function readAllFiles(globPattern) {
  const ignoreList = ['**/node_modules/**'];

  if (process.env.OBF_IGNORE) {
    ignoreList.push(...process.env.OBF_IGNORE.split(','));
  }

  return await glob(globPattern, { nodir: true, ignore: ignoreList });
}

// (REST OF YOUR ORIGINAL obfuscation code — unchanged)

function parseCode(code, filename) {
  const isTS = filename.endsWith('.ts') || filename.endsWith('.tsx');
  return parser.parse(code, {
    sourceType: 'unambiguous',
    plugins: [
      'jsx',
      isTS ? 'typescript' : null,
      'classProperties',
      'optionalChaining',
      'nullishCoalescingOperator',
      'objectRestSpread',
      'decorators-legacy'
    ].filter(Boolean)
  });
}

const BLACKLIST = new Set([
  'require','module','exports','console','window','document','global',
  '__dirname','__filename','process','Buffer','setTimeout','setInterval',
  'clearTimeout','clearInterval','Promise'
]);

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
function toBase62(num){if(num===0)return'0';let s='';while(num>0){s=BASE62[num%62]+s;num=Math.floor(num/62);}return s;}
function makeObfName(counter,prefix='_r'){return`${prefix}${toBase62(counter)}`;}

async function obfuscate(globPattern = DEFAULT_GLOB, mapFile = MAP_FILE) {
  const files = await readAllFiles(globPattern);
  if (!files.length) { console.log(`No files matched: ${globPattern}`); return; }

  const mapping = (await fs.pathExists(mapFile)) ? await fs.readJson(mapFile) : {};
  let counter = Object.keys(mapping).length + 1;

  function genName(original) {
    if (mapping[original]) return mapping[original];
    const n = makeObfName(counter++);
    mapping[original] = n;
    return n;
  }

  for (const file of files) {
    const abs = path.resolve(file);
    const code = await fs.readFile(abs, 'utf8');
    let ast;
    try { ast = parseCode(code, file); }
    catch (e) { console.warn(`Parse error in ${file}: ${e.message}`); continue; }

    traverse(ast, {
      enter(path) {
        const bindings = path.scope?.bindings || {};
        for (const name of Object.keys(bindings)) {
          if (BLACKLIST.has(name)) continue;
          if (name.startsWith('_r')) continue;
          const newName = genName(name);
          try { path.scope.rename(name, newName); }
          catch (e) { console.warn(`Rename failed ${name} in ${file}`); }
        }
      },
      ImportSpecifier(p){renameImportLike(p, genName);},
      ImportDefaultSpecifier(p){renameImportLike(p, genName);},
      ExportSpecifier(p){renameImportLike(p, genName);}
    });

    const out = generate(ast, { comments: true }, code).code;
    await fs.writeFile(abs, out, 'utf8');
    console.log(`Obfuscated ${file}`);
  }

  await fs.writeJson(mapFile, mapping, { spaces: 2 });
}

function renameImportLike(path, genName){
  const local = path.node.local?.name;
  if (local && !BLACKLIST.has(local) && !local.startsWith('_r')) {
    path.node.local.name = genName(local);
  }
}

async function deobfuscate(globPattern = DEFAULT_GLOB, mapFile = MAP_FILE) {
  if (!await fs.pathExists(mapFile)) throw new Error(`${mapFile} missing`);
  const mapping = await fs.readJson(mapFile);
  const inv = Object.fromEntries(Object.entries(mapping).map(([a,b])=>[b,a]));

  const files = await readAllFiles(globPattern);
  if (!files.length) return;

  for (const file of files) {
    const abs = path.resolve(file);
    const code = await fs.readFile(abs,'utf8');
    let ast;
    try { ast = parseCode(code,file); }
    catch (e){ console.warn(`Parse error ${file}`); continue; }

    traverse(ast, {
      enter(path){
        const bindings = path.scope?.bindings || {};
        for (const name of Object.keys(bindings)) {
          if (!inv[name]) continue;
          try { path.scope.rename(name, inv[name]); }
          catch (e){ console.warn(`Failed rename ${name}`); }
        }
      },
      ImportSpecifier(p){unrenameImportLike(p,inv);},
      ImportDefaultSpecifier(p){unrenameImportLike(p,inv);},
      ExportSpecifier(p){unrenameImportLike(p,inv);}
    });

    const out = generate(ast,{comments:true},code).code;
    await fs.writeFile(abs,out,'utf8');
    console.log(`Deobfuscated ${file}`);
  }
}

function unrenameImportLike(path, inv){
  const local = path.node.local?.name;
  if (local && inv[local]) path.node.local.name = inv[local];
}

async function main() {
  const cmd = process.argv[2] || 'obfuscate';

  /* NEW final pattern: */
  const pattern =
    CONFIG_PATTERN ||
    process.env.OBF_GLOB ||
    DEFAULT_GLOB;

  if (cmd === 'obfuscate') await obfuscate(pattern, MAP_FILE);
  else if (cmd === 'deobfuscate') await deobfuscate(pattern, MAP_FILE);
  else console.log('Use obfuscate|deobfuscate');
}

main();
