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
<!--
# 🎥 Demo (GIF Placeholder)

> Replace this with your real GIF later.  
> Recommended size: **900×500**, 12–20 sec screen capture.

![Demo GIF Placeholder](https://via.placeholder.com/900x500?text=Zozzona+Demo+GIF+Here)

--- -->

# 🚀 Overview

\@zozzona/js is a reversible, multi-layer source protection pipeline engineered for modern JavaScript projects.

It provides:

- **AST-based identifier obfuscation** (Babel)  
- **JS/JSX/TS/TSX minification** (Terser)  
- **AES-256-GCM encryption** of all maps  
- **Perfect restoration** back to original source  
- **Git-safe automated workflows** with Husky  

Your **real editable source code never leaves your machine**—only protected output is committed or deployed.

Designed for:

- Protecting proprietary libraries  
- Shipping “compiled-only” Node, React, Vue, Svelte  
- Hardening server-side and client-side source  
- Sanitizing CI/CD pipelines  
- Teams with sensitive intellectual property  
- Closed-source commercial products  

---

# 🎯 Why Zozzona?

## **Built for real development workflows**

Most obfuscation tools:

- Permanently alter the project  
- Break source maps  
- Are not reversible  
- Do not support modern JSX/TS  
- Cannot run safely in Git hooks  
- Do not protect mapping metadata  
- Cannot be used reliably in CI/CD

Zozzona solves all of these.

---

# 🔥 Key Features

### ✔ **Reversible Protection**  
Unpack restores your exact original source—byte for byte.

### ✔ **Modern Syntax Support**  
JS, JSX, TS, TSX, decorators, class fields, optional chaining, etc.

### ✔ **Zero Workflow Disruption**  
You keep editing your real code; commits contain only protected code.

### ✔ **AES-256-GCM Encrypted Maps**  
All transformation metadata is encrypted and removed from disk.

### ✔ **Secure CI/CD Ready**  
Deploy protected builds—no source leaks in pipelines.

### ✔ **Husky Git Automation (pre/post commit)**  
Commits stay protected; your working directory stays original.

### ✔ **Highly Configurable**  
Choose which folders/files to protect via pack.config.json.

### ✔ **Filesystem Stable**  
File paths, extensions, and project structure remain intact.

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
| CI/CD safe | ✔ | ⚠️ | ✔ | ✔ | ✔ |
| Protects mapping metadata | ✔ | ❌ | ❌ | ❌ | ❌ |
| Supports multiple folders | ✔ | ⚠️ | ✔ | ✔ | ✔ |

\* depends on configuration / plugins.

Zozzona is uniquely designed for **real project protection with easy reversibility**.

---

# 📥 Install

\`\`\`bash
npm install @zozzona/js
\`\`\`

CLI access:

\`\`\`bash
npx zozzona
\`\`\`

---

# 🧰 Commands

| Command | Description |
|--------|-------------|
| \`zozzona init\` | Sets up .env + MAP_KEY, creates pack.config.json, adds npm scripts, installs Husky |
| \`zozzona pack\` | Obfuscate → Minify → Encrypt |
| \`zozzona unpack\` | Decrypt → Restore → Deobfuscate |
| \`zozzona version\` | Display installed version |

---

# ⚙️ Quick Start

## **1. Initialize**

\`\`\`bash
npx zozzona init
\`\`\`

Creates and displays:

- \`.env\` with \`MAP_KEY\`
- \`pack.config.json\`
- Husky hooks
- Required scripts in package.json

---

## **2. Protect your code**

\`\`\`bash
npx zozzona pack
\`\`\`

Output includes encrypted:

- \`obfuscation-map.json.enc\`
- \`minify-map.json.enc\`
- \`terser-name-cache.json.enc\`
- All \`*.map.enc\`

---

## **3. Restore original source**

\`\`\```bash
npx zozzona unpack
\`\`\`

Perfectly restores original project state.

---

# 🔐 MAP_KEY & .env

Zozzona generates a 32-byte AES-256-GCM key:

\`\`\`
MAP_KEY=BASE64_ENCODED_KEY
\`\`\`

⚠️ **Critical Notes**

- NEVER commit \`.env\`
- Losing \`MAP_KEY\` = losing ability to unpack  
- Back it up securely  
- Zozzona prints .env contents clearly after init  

---

# 📁 pack.config.json

Example:

\`\`\`json
{
  "folders": ["src"],
  "files": [],
  "ignore": ["node_modules", "dist"]
}
\`\`\`

Supports multi-folder protection:

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

### **pre-commit**
\`\`\`bash
zozzona pack
\`\`\`

### **post-commit**
\`\`\`bash
zozzona unpack
\`\`\`

This workflow ensures:

- **committed code = protected**
- **working directory = original**
- **no accidental commit of real source**

---

# 🧪 Example Real Workflow

1. You edit original code  
2. You commit  
3. Husky runs:

\`\`\`bash
zozzona pack
git add -A
\`\`\`

4. Protected code gets committed  
5. Husky unpacks back to original so you continue working normally  

---

# 🧨 Limitations (Intentional)

Zozzona **does not**:

- Prevent browser devtools inspection  
- Act as commercial licensing / DRM  
- Replace real binary compilation  
- Protect against memory/runtime dumps  

It *does* give you **the strongest reversible source protection available for JS ecosystems**.

---

# 🛠 Advanced Usage

Generate a fresh MAP_KEY:

\`\`\`bash
openssl rand -base64 32
\`\`\`

Replace key, then:

\`\`\`bash
zozzona unpack
zozzona pack
\`\`\`

---

# 🚢 Publishing Your Own Fork to npm

\`\`\```bash
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

**MIT License © 2025 – Zozzona.js (Roger Tremblay)**  
