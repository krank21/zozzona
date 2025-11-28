# 🔌 Zozzona.js — Integration Guide

This guide explains how Zozzona integrates with other tools, frameworks, and environments.

---

# 🧱 Supported Environments

Zozzona works with:

- Node.js  
- React  
- Vue  
- Svelte  
- SolidJS  
- Next.js  
- Express / Koa / Fastify  
- Electron  
- Vite / Webpack / Rollup / Parcel  
- Monorepos (PNPM, TurboRepo, Nx)

Zozzona does **not** replace your builder — it protects your **source**.

---

# 🟦 Integrating with React / Vite

Typical setup:

\`\`\`json
{
  "folders": ["src", "server"],
  "ignore": ["dist", "public"]
}
\`\`\`

Then:

\`\`\`bash
npm run build
npx zozzona pack
\`\`\`

Deploy the packed dist + packed server files.

---

# 🟩 Integrating with Express APIs

Protect:

\`\`\`json
{
  "folders": ["server"],
  "ignore": []
}
\`\`\`

Use Zozzona before deployment:

\`\`\`bash
npm run build
zozzona pack
\`\`\`

---

# 🟧 Integrating with Webpack or Rollup

Zozzona should run **before** the bundler if you want to protect source,  
and **after** if you want to protect output.

### Option A — Protect Source

\`\`\`bash
zozzona pack
webpack --mode production
\`\`\`

### Option B — Protect Build Output

\`\`\`json
{
  "folders": ["dist"]
}
\`\`\`

\`\`\`bash
webpack --mode production
zozzona pack
\`\`\`

---

# 🟪 Integrating with Electron

Recommended:

- Protect `main/` (Node side)
- Protect `renderer/` (browser side)

\`\`\`json
{
  "folders": ["main", "renderer"],
  "ignore": ["dist"]
}
\`\`\`

---

# 🟥 Integration with PNPM / Yarn / Bun

Zozzona works with all package managers:

### PNPM
\`\`\`bash
pnpm dlx zozzona init
\`\`\`

### Yarn
\`\`\`bash
yarn dlx zozzona init
\`\`\`

### Bun
\`\`\`bash
bunx zozzona init
\`\`\`

---

# 🛠 Advanced Integrations

### Monorepos

\`\`\`json
{
  "folders": [
    "packages/client/src",
    "packages/api/src"
  ],
  "ignore": ["dist"]
}
\`\`\`

### Protecting Libraries  
Publish packed libraries:

\`\`\`bash
zozzona pack
npm publish
zozzona unpack
\`\`\`

---

# 🧨 Not Recommended

❌ Protecting `node_modules`  
❌ Running Zozzona inside hooks that modify built artifacts  
❌ Protecting huge binary folders (images/audio/etc.)

---

# 🧩 Missing an integration?

Open an issue:

https://github.com/krank21/zozzona/issues
