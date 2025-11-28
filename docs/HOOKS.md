# 🪝 Zozzona.js — Git Hooks & Automation

This guide explains how Husky hooks installed by Zozzona work,  
and how to customize them safely.

---

# 🧩 Overview

After:

\`\`\`bash
npx zozzona init
npm install
\`\`\`

Zozzona installs:

### `.husky/pre-commit`
Runs **before** commit:

\`\`\`bash
zozzona pack
git add -A
\`\`\`

### `.husky/post-commit`
Runs **after** commit:

\`\`\`bash
zozzona unpack
\`\`\`

---

# 🔒 Pre-Commit Hook (Packing)

Purpose:

- Protects source before commit  
- Ensures **committed state is always packed**  
- Prevents accidental leaks  

Hook installed:

\`\`\`bash
#!/usr/bin/env sh
zozzona pack
git add -A
\`\`\`

---

# 🔓 Post-Commit Hook (Unpacking)

Purpose:

- Restores back to human-readable source  
- Ensures working directory stays editable  

Hook installed:

\`\`\`bash
#!/usr/bin/env sh
zozzona unpack
\`\`\`

---

# 🧪 Example Customization

### Disable unpack after commit (not recommended)

\`\`\`bash
rm .husky/post-commit
\`\`\`

### Add linting before packing

\`\`\`bash
npx eslint .
zozzona pack
\`\`\`

### Add formatting

\`\`\`bash
npx prettier --write .
zozzona pack
\`\`\`

---

# 🛑 Do NOT modify these behaviors:

❌ Do not call unpack **before** pack  
❌ Do not run pack inside post-commit  
❌ Do not delete `.enc` files manually  
❌ Do not regenerate MAP_KEY while packed  

---

# ⚙️ Reinstall Hooks

If hooks are missing:

\`\`\`bash
npx zozzona init
npm install
\`\`\`

---

# 🧩 Troubleshooting

### Hooks not running?

Check:

- `.husky/` directory exists  
- Scripts are executable:

\`\`\`bash
chmod +x .husky/*
\`\`\`

- Repo is not in "safe.directory" mode (corporate machines)

---

# 🙌 Need More Automation?

Open a feature request:  
https://github.com/krank21/zozzona/issues
