# 🚀 Zozzona.js — Quick Start Guide

Welcome to **@zozzona/js**, the reversible JavaScript/TypeScript source-protection toolkit.

This guide gives you **everything you need to secure your project in minutes**.

For full documentation, see the main README:  
👉 `../README.md`

---

# ⚙️ 1. Install

\`\`\`bash
npm install @zozzona/js
\`\`\`

Use the CLI via:

\`\`\`bash
npx zozzona
\`\`\`

---

# 🧰 2. Initialize Protection

\`\`\`bash
npx zozzona init
\`\`\`

This automatically:

- Creates `.env` with your AES `MAP_KEY`
- Prints `.env` so you can back it up
- Creates `pack.config.json`
- Injects required npm scripts
- Installs Husky Git hooks (pre-commit + post-commit)

After initializing, run:

\`\`\`bash
npm install
\`\`\`

(This activates Husky.)

---

# 🔒 3. Protect Your Code

\`\`\`bash
npx zozzona pack
\`\`\`

This performs:

- Identifier obfuscation  
- Code minification  
- AES-256-GCM encryption of all mapping data  
- Removal of unencrypted `.map` files  

Your project directory now contains **fully protected code**.

---

# 🔓 4. Restore Original Source

\`\`\`bash
npx zozzona unpack
\`\`\`

Perfect reversible restore — your project returns to its original readable state.

---

# 📁 Optional: Edit pack.config.json

Example:

\`\`\`json
{
  "folders": ["src", "server"],
  "files": ["server/package.json"],
  "ignore": ["dist", "node_modules"]
}
\`\`\`

This allows you to protect:

- Client code  
- Server code  
- Templates  
- Shared utilities  
- Multi-folder apps  

---

# 🔄 Git Automation (Husky)

After `zozzona init` + `npm install`, you have:

### **pre-commit**
\`\`\`bash
zozzona pack
git add -A
\`\`\`

### **post-commit**
\`\`\`bash
zozzona unpack
\`\`\`

This ensures:

- Commits contain **protected code**
- Your working directory keeps **original code**

---

# 🔐 MAP_KEY Rules

- Stored in `.env`  
- Never commit `.env`  
- Losing `MAP_KEY` means you cannot unpack  
- Back it up securely  

---

# 🧨 Notes

- Not DRM — runtime environments can still inspect JS  
- Protects files, not execution  
- Ideal for CI/CD pipelines  
- JSX/TSX fully supported  

---

# 🆘 Full Documentation

See: `../README.md`
