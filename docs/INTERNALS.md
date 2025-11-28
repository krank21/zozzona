# 🧠 Zozzona.js — Internals & Architecture

This document explains exactly how Zozzona works behind the scenes.

---

# 🏗️ Transformation Pipeline

Zozzona uses a **three-stage reversible protection pipeline**.

\`\`\`text
Original Source
   ↓
1) Obfuscation (AST transform via Babel)
   ↓
2) Minification (Terser)
   ↓
3) Encryption of maps (AES-256-GCM)
   ↓
Protected Source
\`\`\`

Unpacking reverses these exactly.

---

# 🔍 Stage 1 — Identifier Obfuscation

Zozzona loads each JS/TS/JSX/TSX file using:

- `@babel/parser`  
- `@babel/traverse`  
- `@babel/generator`

It performs:

- Variable renaming  
- Function renaming  
- Class property renaming  
- Object key renaming (safe mode)  
- Scope-aware identifier replacement  

Resulting output is stored along with an **obfuscation map**:

\`\`\`json
{
  "oldName": "getUserData",
  "newName": "_0x12b4"
}
\`\`\`

---

# ✂️ Stage 2 — Minification

Zozzona invokes **Terser** directly with:

- Constant folding  
- Dead-code elimination  
- Property mangling (safe)  
- Tree-shaking  
- JSX/TSX processed via Babel presets  

Zozzona captures:

- Original code (pre-minify)  
- Minified code  
- Minify reverse map  

---

# 🔐 Stage 3 — Encryption

All maps are combined and encrypted with:

- **AES-256-GCM**
- 32-byte random key in `.env` (MAP_KEY)
- Per-file IV (nonce)
- Authenticated tags

Encrypted files receive `.enc` extension:

Examples:

\`\`\`text
obfuscation-map.json.enc
minify-map.json.enc
terser-name-cache.json.enc
\`\`\`

All plaintext maps are then **deleted**.

---

# 🔄 Unpacking Internals

Unpacking reverses the process:

1. Decrypt `.enc` mapping files  
2. Restore name map  
3. Reverse minify  
4. Expand obfuscated identifiers  
5. Reconstruct original formatting  

Every byte is restored exactly.

---

# 🧪 Example Internal Flow

\`\`\`text
src/main.jsx
   ↓ (obfuscate)
src/main.jsx (obfuscated)
   ↓ (minify)
src/main.jsx (minified)
   ↓ (encrypt maps)
*.enc saved, plaintext maps deleted
\`\`\`

Unpack does:

\`\`\`text
*.enc (decrypt)
   ↓
restore original maps
   ↓
reverse minify
   ↓
deobfuscate
   ↓
src/main.jsx (original)
\`\`\`

---

# 🧬 File Preservation

Zozzona preserves:

- File paths  
- Directory structure  
- File extensions  
- Filenames  
- Imports/exports  
- Comments (optional support planned)  

---

# 🧩 Future Enhancements (see ROADMAP.md)

- Selective property renaming  
- Partial obfuscation modes  
- CSS/HTML transform support  
- Source-map passthrough for builds  
