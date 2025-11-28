# 🚢 Zozzona.js — Secure Publishing Guide

This guide explains how to safely publish **libraries** or **applications**  
using Zozzona-protected code.

---

# 🧩 Publishing Use Cases

Zozzona supports:

- Publishing packed NPM libraries  
- Publishing protected browser bundles  
- Publishing protected server builds  
- Delivering commercial closed-source JS packages  
- Distributing Node CLIs securely  

---

# 🟦 Publishing a Protected NPM Package

## 1. Pack your source

\`\`\`bash
zozzona pack
\`\`\`

## 2. Publish the packed output

\`\`\`bash
npm publish --access public
\`\`\`

## 3. Unpack for continued development

\`\`\`bash
zozzona unpack
\`\`\`

---

# 🟩 Private NPM Publishing

\`\`\`bash
npm publish --access restricted
\`\`\`

Works the same — just secure your MAP_KEY and `.env`.

---

# 🟥 DO NOT publish while unpacked

Always verify:

\`\`\`bash
git diff
\`\`\`

Only packed code should be staged.

---

# 🧪 Optional: Validate Package Contents

\`\`\`bash
npm pack
tar -tzf *.tgz
\`\`\`

Ensure:

- No `.map` files  
- No `.enc` files unless intended  
- No original source present  
- No `.env` included  

---

# 🔐 Shipping Commercial Packages

Zozzona protects:

- Module structure  
- Build chain  
- Business logic  
- Identifiers  
- Algorithms  

Not protected:

- Runtime values  
- Secrets inside code  
- Server responses  

For API keys, always use:

- Environment variables  
- Vaults  
- Parameter stores  

---

# 🧱 License Keys / DRMs

Zozzona is **not** license enforcement.  
If you need DRM:

- Add your own license checks  
- Validate activation keys server-side  
- Use hashed machine identifiers  

Zozzona only protects **source code**, not **execution rights**.

---

# 🏭 Secure Deployment Pipelines

Recommended pipeline:

\`\`\`bash
npm ci
npm run build
zozzona pack
deploy packed build
\`\`\`

Never unpack in CI.  
Never commit `.env`.

---

# 🧩 Good Publishing Checklist

- [ ] Only packed code committed  
- [ ] No `.env` included  
- [ ] MAP_KEY stored in secrets manager  
- [ ] Verified with `npm pack`  
- [ ] Unpacked locally after publish  
- [ ] Tags updated with `npm version patch`  

---

# 🙌 Questions?

Open an issue:  
https://github.com/krank21/zozzona/issues
