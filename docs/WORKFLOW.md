# 🔄 Zozzona.js — Workflow Guide

How Zozzona integrates with your development flow.

---

# 🧩 How It Works

Zozzona creates a **dual-state workflow**:

| State | Description |
|-------|-------------|
| **Committed** | Protected (obfuscated, minified, encrypted) |
| **Working Directory** | Original readable code |

This is handled automatically using Husky hooks.

---

# 🟢 1. Edit Normally

Write code as usual in:

- `src/`  
- `server/`  
- `templates/`

Your local files remain **original**.

---

# 🟡 2. Commit Changes

\`\`\`bash
git commit -m "Update feature"
\`\`\`

Husky automatically:

### 1. Runs pack  
\`\`\`bash
zozzona pack
\`\`\`

### 2. Re-stages the protected files  
\`\`\`bash
git add -A
\`\`\`

Your commit now contains **protected code**.

---

# 🔵 3. After Commit: Auto-Unpack

Husky runs:

\`\`\`bash
zozzona unpack
\`\`\`

Your working directory returns to **original readable source**.

---

# 🔁 What This Gives You

- Commits always contain protected code  
- Working directory always contains original code  
- Zero disruption to day-to-day workflow  
- Full CI/CD safety  
- Perfect reversibility  

---

# 📦 Deploying

Typical CI/CD uses:

\`\`\`bash
zozzona pack
\`\`\`

This ensures:

- No raw source in artifacts  
- Only protected JS is deployed  

---

# 🔧 Regenerating MAP_KEY

\`\`\```bash
zozzona unpack
# update MAP_KEY in .env
zozzona pack
\`\`\`

Never regenerate while packed.

---

# 🧨 Common Mistakes

| Mistake | Fix |
|--------|-----|
| Committing unpacked source | Ensure Husky is active (`npm install`) |
| Editing protected code | Always edit after unpack |
| Missing MAP_KEY | Cannot recover — back up `.env` |

---

# 📚 More Docs

- Quick Start → `QUICKSTART.md`  
- Config Guide → `CONFIG.md`  
- FAQ → `FAQ.md`  
- Full README → `../README.md`
