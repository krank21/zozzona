# 📦 @zozzona/js
## Secure JavaScript Source Protection Toolkit

Obfuscate → Minify → Encrypt — and restore it all with a single command.

---

## 🚀 Overview

@zozzona/js is a drop-in protection layer for JavaScript/TypeScript projects.

It performs a full reversible transformation:

- Obfuscate names (Babel transform)
- Minify code (Terser + Map Capture)
- Encrypt all map files (AES-256-GCM)
- Restore everything perfectly on unpack

Your real source code is never committed, only the protected version is.

Perfect for:

- Protecting proprietary code
- Shipping “compiled only” Node projects
- Git-safe reversible obfuscation workflows
- CI/CD pipelines that require source sanitization

---

## 📥 Install

\`\`\`bash
npm install @zozzona/js
\`\`\`

To access the CLI:

\`\`\`bash
npx zozzona
\`\`\`

---

## 🧰 Commands

| Command        | Description |
|----------------|-------------|
| zozzona init   | Creates .env, injects MAP_KEY, installs Husky hooks, creates pack.config.json, adds npm scripts |
| zozzona pack   | Obfuscate → Minify → Encrypt (.enc) |
| zozzona unpack | Decrypt → Restore → Deobfuscate |
| zozzona version| Show installed package version |

---

## ⚙️ Quick Start

### 1. Initialize your project

\`\`\`bash
npx zozzona init
\`\`\`

This will:

- Create .env (or add MAP_KEY if missing)
- Show you the full contents of your .env
- Warn you not to commit .env
- Create pack.config.json
- Add required npm scripts
- Install Husky Git hooks

---

### 2. Protect your project

\`\`\`bash
npx zozzona pack
\`\`\`

This runs:

- npm run obfuscate  
- npm run minify  
- Encrypts all map files + internal metadata  

Your source files are now protected.

---

### 3. Restore original source

\`\`\`bash
npx zozzona unpack
\`\`\`

This performs:

- AES-GCM decryption of all map files  
- Minify reversal  
- Deobfuscation  
- Cleanup of encrypted artifacts  

Everything goes back to the exact original code.

---

## 🛡️ Why this works

Zozzona creates and uses three reversible mapping layers:

| Layer              | File                     | Purpose                         |
|--------------------|--------------------------|---------------------------------|
| Obfuscation Map    | obfuscation-map.json     | Tracks renamed identifiers      |
| Minify Map         | minify-map.json          | Stores original unminified code |
| Terser Name Cache  | terser-name-cache.json   | Ensures consistent mangling     |

Before pack completes:

- All three are encrypted using AES-256-GCM  
- Original maps are destroyed  

On unpack:

- Maps are decrypted  
- Rehydrated  
- Piped back into the reverse transforms  

---

## 🔐 .env and MAP_KEY

Zozzona uses a randomly generated 32-byte AES-256 key, stored in:

\`\`\`
.env
MAP_KEY=BASE64_ENCODED_KEY
\`\`\`

⚠️ You MUST protect your .env

- Do not commit .env  
- Add it to .gitignore  
- If you lose MAP_KEY, you cannot unpack your code  
- Back it up somewhere secure  

Zozzona clearly prints your full .env contents during init.

---

## 🧩 pack.config.json

Example (auto-generated):

\`\`\`json
{
  "folders": ["src"],
  "files": [],
  "ignore": ["node_modules", "dist"]
}
\`\`\`

You may customize:

- Which folders to protect  
- Which files to include  
- Which patterns to exclude  

---

## 🔄 Git Automation (Husky)

Zozzona installs:

- .husky/pre-commit  
- .husky/post-commit  

Pre-Commit:

\`\`\`bash
npx zozzona pack
\`\`\`

Post-Commit:

\`\`\`bash
npx zozzona unpack
\`\`\`

This means:

- Your committed state is ALWAYS protected  
- Your working directory remains original and editable  
- A perfect reversible Git workflow  

---

## 🧪 Example Workflow

Before Commit  
Edit your real source.

Commit  
Husky automatically runs:

\`\`\`bash
zozzona pack
git add .
\`\`\`

Protected code is committed.

After Commit  
Husky restores your original source so you can continue editing.

---

## 🛠 Advanced Usage

Regenerate MAP_KEY manually:

\`\`\`bash
openssl rand -base64 32
\`\`\`

Update .env:

\`\`\`
MAP_KEY=NEW_KEY_HERE
\`\`\`

Then:

\`\`\`bash
zozzona unpack   # restore state using old key
zozzona pack     # repack using new key
\`\`\`

---

## 🧨 What Zozzona does NOT do

- It does not permanently destroy source  
- It does not provide license enforcement  
- It does not prevent runtime inspection  
- It does not replace real binary compilation  

It *does* provide a strong reversible protection workflow.

---

## 🧑‍💻 Contributing

Feedback and contributions welcome!  
Open an issue or submit a pull request.

---

## 📄 License

MIT License © 2025 Zozzona.js
