# ⚙️ Zozzona.js — Configuration Guide

`pack.config.json` controls how your project is protected.

---

# 📁 Structure

\`\`\`json
{
  "folders": ["src"],
  "files": [],
  "ignore": ["node_modules", "dist"]
}
\`\`\`

---

# 🔍 Fields

### **folders**

Directories to protect.

Examples:

\`\`\`json
["src"]
\`\`\`

\`\`\`json
["src", "server", "templates"]
\`\`\`

---

### **files**

Specific individual files to include.

\`\`\`json
["server/package.json"]
\`\`\`

---

### **ignore**

Paths or globs to skip.

\`\`\`json
["dist", "public", "**/*.css"]
\`\`\`

---

# 🧱 Advanced Examples

### Protect front-end + back-end

\`\`\`json
{
  "folders": ["src", "server"],
  "ignore": ["dist", "public"]
}
\`\`\`

### Protect templates too

\`\`\`json
{
  "folders": ["src", "templates"],
  "files": ["templates/deployer.js"]
}
\`\`\`

### Protect everything except `/build`

\`\`\`json
{
  "folders": ["."],
  "ignore": ["build", "node_modules"]
}
\`\`\`

---

# 🔒 Notes

- JSX/TSX supported
- File structure preserved
- `ignore` always wins
- Only targeted files are transformed
