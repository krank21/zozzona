# 📦 @zozzona/js  
## **Secure JavaScript & TypeScript Source Protection Toolkit**

**Obfuscate → Minify → Encrypt → Reversible.**  
Protect your real source code while keeping your workflow completely seamless.

---

# 🏷️ Badges

![npm](https://img.shields.io/npm/v/%40zozzona%2Fjs?color=blue)
![downloads](https://img.shields.io/npm/dm/%40zozzona%2Fjs)
![license](https://img.shields.io/github/license/krank21/zozzona)
![issues](https://img.shields.io/github/issues/krank21/zozzona)
![PRs](https://img.shields.io/badge/PRs-welcome-green)

---

# 📚 Documentation

| Guide | Description |
|-------|-------------|
| 👉 [QUICKSTART](./docs/QUICKSTART.md) | Fastest way to begin using Zozzona |
| 👉 [CONFIG](./docs/CONFIG.md) | How `pack.config.json` works |
| 👉 [WORKFLOW](./docs/WORKFLOW.md) | How commits, packing & unpacking integrate |
| 👉 [FAQ](./docs/FAQ.md) | Common answers and troubleshooting |
| 👉 [HOOKS](./docs/HOOKS.md) | Details on Husky automation and custom workflows |
| 👉 [CICD](./docs/CICD.md) | How to integrate Zozzona into CI/CD pipelines |
| 👉 [INTEGRATIONS](./docs/INTEGRATIONS.md) | Using Zozzona with React, Node, monorepos, build tools, etc. |
| 👉 [SECURITY](./docs/SECURITY.md) | Encryption model, `MAP_KEY` handling, threat considerations |
| 👉 [SECURE_PUBLISHING](./docs/SECURE_PUBLISHING.md) | How to publish obfuscated packages safely |
| 👉 [INTERNALS](./docs/INTERNALS.md) | Deep dive into maps, transforms, encryption layers |
| 👉 [ROADMAP](./docs/ROADMAP.md) | Planned features and future development |
| 👉 [CONTRIBUTIONS](./docs/CONTRIBUTIONS.md) | How to contribute, PR guidelines, development setup |

---

# 🚀 Overview

`@zozzona/js` is a **reversible multi-layer source protection pipeline** engineered for modern JavaScript and TypeScript projects.

It provides:

- **AST-based identifier obfuscation** (Babel)
- **JS/JSX/TS/TSX minification** (Terser)
- **AES-256-GCM encryption** of transformation metadata
- **Perfect restoration** back to original source
- **Automatic Husky Git workflow integration**
- **Fully CI/CD-safe builds**
- **Zero workflow disruption**
- **Optional irreversible production build hardening (`pack:dist`)**

Your **real editable source code never leaves your machine**—only the protected version is committed or deployed.

Built for:

- Closed-source SaaS platforms  
- Proprietary Node/React/Vue/Svelte apps  
- Server + client protection  
- Companies needing IP-safe CI/CD  
- Reversible but strong JS protection  
- Shipping “compiled-only” code safely  

---

# 🎯 Why Zozzona?

## **Most obfuscators break your workflow — Zozzona fixes it.**

Typical JS protection tools:

❌ Permanently mutate your project  
❌ Are NOT reversible  
❌ Break JSX/TS pipelines  
❌ Do not encrypt source maps  
❌ Cannot run safely in Git hooks  
❌ Do not support CI/CD pipelines  
❌ Expose mapping metadata  
❌ Fail on multi-folder projects  

Zozzona solves *all* of these.

---

# 🔥 Key Features

### ✔ **Reversible Protection**  
Unpack returns your project to the *exact* original code.

### ✔ **Modern Syntax Support**  
JS, JSX, TS, TSX, decorators, class fields, optional chaining, and more.

### ✔ **Zero Disruption**  
You always edit your real code; Git commits only the protected version.

### ✔ **Encrypted Metadata**  
All maps (`*.json`, `*.map`) are encrypted using AES-256-GCM.

### ✔ **CI/CD Safe**  
Deploy protected code to servers without exposing your source.

### ✔ **Auto Husky Git Workflow**  
Pre-commit → pack  
Post-commit → unpack  
Instant protection on every commit.

### ✔ **Highly Configurable**  
Select protected folders, files, ignore patterns, and build order.

### ✔ **Filesystem Stable**  
Paths and structure remain unchanged—only content is transformed.

### ✔ **Dist Build Protection (`pack:dist`)**  
Harden production builds by obfuscating, minifying, and encrypting maps inside `dist/`.

---

# 🆚 Comparison With Other Tools

| Feature / Tool        | Zozzona | JS-Obfuscator | Terser | SWC | Babel Minify |
|-----------------------|:------:|:-------------:|:------:|:---:|:-------------:|
| Obfuscates identifiers | ✔ | ✔ | ❌ | ❌ | ❌ |
| Minifies code | ✔ | ✔* | ✔ | ✔ | ✔ |
| JSX/TSX support | ✔ | ❌ | ❌ | ✔* | ❌ |
| Reversible | ✔ | ❌ | ❌ | ❌ | ❌ |
| Encrypts maps | ✔ | ❌ | ❌ | ❌ | ❌ |
| Git workflow automation | ✔ | ❌ | ❌ | ❌ | ❌ |
| CI/CD-safe | ✔ | ⚠️ | ✔ | ✔ | ✔ |
| Protects mapping metadata | ✔ | ❌ | ❌ | ❌ | ❌ |
| Multi-folder support | ✔ | ⚠️ | ✔ | ✔ | ✔ |

\* depends on configuration.

Zozzona is the only tool designed specifically to be **secure, reversible, modern, and Git-friendly**.

---

# 📥 Install

\`\`\`bash
npm install @zozzona/js
\`\`\`

Use the CLI:

\`\`\`bash
npx zozzona
\`\`\`

---

# 🧰 Commands

| Command | Description |
|--------|-------------|
| `zozzona init` | Sets up `.env`, creates `MAP_KEY`, configures Husky git hooks, creates `pack.config.json`, injects npm scripts |
| `zozzona pack` | Obfuscate → Minify → Encrypt |
| `zozzona unpack` | Decrypt → Restore → Deobfuscate |
| `zozzona pack:dist` | Protect files inside `dist/` (obfuscate/minify/encrypt `*.map`) |
| `zozzona version` | Show installed version |

---

# ⚙️ Quick Start

## **1. Initialize**

\`\`\`bash
npx zozzona init
\`\`\`

This will:

- Create or update `.env` with `MAP_KEY`
- Print the full `.env` for verification  
- Create `pack.config.json`
- Add required npm scripts (`obfuscate`, `minify`, etc.)
- **Auto-install Husky**
- **Auto-run `husky install`**
- Install Git hooks

You do **not** need to install Husky manually.

---

## **2. Protect your code**

\`\`\`bash
npx zozzona pack
\`\`\`

This produces encrypted:

- `obfuscation-map.json.enc`
- `minify-map.json.enc`
- `terser-name-cache.json.enc`
- All `*.map.enc` files

And fully secured obfuscated + minified source.

---

## **3. Restore your original source**

\`\`\`bash
npx zozzona unpack
\`\`\`

Fully reversible.

Your project returns exactly to its original state.

---

## **4. Protect your production build (`pack:dist`)**

\`\`\`bash
npx zozzona pack:dist
\`\`\`

This will:

- Obfuscate JavaScript inside `dist/`
- Minify JS using Terser
- Minify JSON
- Encrypt and delete all `*.map` files
- Show a live spinner during obfuscation
- Apply irreversible build hardening for deployment

Example integration:

\`\`\`json
{
  "scripts": {
    "build": "vite build && zozzona pack:dist"
  }
}
\`\`\`

---

# 🔐 MAP_KEY & .env

Zozzona generates a secure AES-256-GCM key:

\`\`\`
MAP_KEY=BASE64_ENCODED_KEY
\`\`\`

### ⚠️ Required practices:

- Add `.env` to `.gitignore`
- Do **not** commit `.env`
- Back up your `MAP_KEY` securely

If you lose your key, you cannot decrypt and restore your files.

---

# 📁 pack.config.json

Example minimal config:

\`\`\`json
{
  "folders": ["src"],
  "files": [],
  "ignore": ["node_modules", "dist"]
}
\`\`\`

Multi-folder example:

\`\`\`json
{
  "folders": ["src", "server", "templates"],
  "files": ["server/package.json"],
  "ignore": ["dist", "public"]
}
\`\`\`

---

# 🔄 Husky Git Automation

Zozzona installs:

### `.husky/pre-commit`
\`\`\`bash
npx zozzona pack
\`\`\`

### `.husky/post-commit`
\`\`\`bash
npx zozzona unpack
\`\`\`

### Resulting workflow:

#### You edit real source →  
#### You commit →  
Zozzona packs → Git commits protected code → Zozzona restores your workspace.

Your repo stays protected.  
Your working directory stays original.  
You stay productive.

---

# 🧪 Example Workflow

1. You write real readable code  
2. Commit:
   \`\`\`bash
   git commit -m "update"
   \`\`\`
3. Husky triggers:
   - `zozzona pack`
   - `git add -A`
   - commit succeeds with protected code
4. Husky restores your files via:
   \`\`\`bash
   zozzona unpack
   \`\`\`

You continue editing real code.

---

# 🧨 Limitations (Intentional)

Zozzona does **not**:

- Replace real native compilation  
- Prevent runtime introspection  
- Provide DRM or licensing  
- Protect against devtools / memory dumps  

It *does* provide the strongest reversible JS/TS source protection available.

---

# 🛠 Advanced Usage

Generate a new `MAP_KEY`:

\`\`\`bash
openssl rand -base64 32
\`\`\`

Then:

\`\`\`bash
zozzona unpack
zozzona pack
\`\`\`

---

# 🚢 Publishing Your Own Fork

\`\`\`bash
npm login
npm version patch
npm publish --access public
\`\`\`

---

# 🧑‍💻 Contributing

PRs and issues welcome!  
https://github.com/krank21/zozzona

---

# 📄 License

**MIT License © 2025 – Zozzona.js**
