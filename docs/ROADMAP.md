# 🛣️ Zozzona.js — Roadmap & Future Features

This document outlines planned improvements and long-term goals for Zozzona.

---

# 🚀 High-Priority (2025 Q1–Q2)

### **1. Plugin System**
Allow custom transformers (Babel plugins, AST hooks).

### **2. Partial Obfuscation Modes**
Selective protection for:

- Only identifiers  
- Only functions  
- Only specific folders  
- Public API preservation  

### **3. Improved JSX/TSX Handling**
Better formatting on restore.

### **4. File-Type Expansion**
Support for:

- `.html`
- `.css` (basic transformation)
- `.vue`
- `.svelte`

---

# 🧭 Medium Priority (2025 Q3)

### **5. Obfuscation Profiles**
\`\`\`json
"mode": "aggressive" | "safe" | "public"
\`\`\`

### **6. Inline comment preservation**
\`\`\`js
// TODO: keep this
\`\`\`

### **7. Multi-threaded worker pool**
Massively improve speed on large monorepos.

### **8. Zozzona Dashboard (Web UI)**
Visual map viewer + encrypted archive inspector.

---

# 🧱 Low Priority / Research

### **9. WASM-accelerated transforms**
Move heavy AST operations to Rust.

### **10. Differential packing**
Repack only changed files.

### **11. Binary output mode**
Generate a binary artifact instead of JS.

---

# 🧑‍🤝‍🧑 Community Goals

- Accept PRs for language presets  
- Expand testing matrix  
- Improve documentation  
- Add more CI examples  

---

# 🚧 Contribution

If you’d like to help build any planned features:

Create an issue or PR:  
https://github.com/krank21/zozzona
