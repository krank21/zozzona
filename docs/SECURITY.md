# 🔐 Zozzona.js — Security Model & Best Practices

This document explains Zozzona’s security intentions, guarantees, limitations, and recommended usage patterns.

Zozzona protects your **source code**, not your **runtime environment**.

---

# 🛡️ What Zozzona Protects

Zozzona provides strong reversible protection for:

- **JavaScript/TypeScript source files**
- **JSX/TSX components**
- **Backend JS (Node/Express/Koa/etc.)**
- **Front-end frameworks (React/Vue/Svelte/etc.)**
- **Build templates**
- **Shared utilities**
- **Any `.js`, `.jsx`, `.ts`, `.tsx` file you include**

Zozzona applies three layers:

1. **Obfuscation (AST renaming)**  
2. **Minification (Terser)**  
3. **Encrypted mapping files (AES-256-GCM)**  

All mapping data is deleted and preserved only in encrypted form.

---

# 🚫 What Zozzona Does NOT Protect

Zozzona is **not DRM**.

It does **not** defend against:

- Browser devtools inspection  
- Runtime memory dumps  
- Reverse-engineering of deployed bundles  
- Node.js runtime instrumentation  
- Server compromise  
- Credential theft  
- Network-level snooping  

Zozzona protects **source**, not **execution**.

---

# 🧠 Threat Model

Zozzona protects against:

### ✔ Accidental source leakage  
(e.g., commits, deployments, CI logs, artifact downloads)

### ✔ Source exposure in public CI/CD systems  
(Zozzona ensures builds do not contain readable code)

### ✔ Reverse-engineering of shipped libraries  
(Obfuscation + minification + encrypted maps)

### ✔ Code theft by inexperienced or casual attackers  
(Protected code is far harder to reconstruct)

### ✔ Internal workflow leaks  
(unpacked code stays local; packed code gets committed)

---

# ⚠️ Known Limitations

### ❌ Runtime JavaScript can always be inspected  
If it runs in the browser or Node, an attacker can introspect memory or execution.

### ❌ Does not hide API keys or secrets  
Use `.env`, vaults, or environment-specific configuration.

### ❌ Not a replacement for build security  
Use Docker, artifact signing, and network-layer controls.

---

# 🔒 MAP_KEY & Secrets

Zozzona encrypts all mapping data with:

- **AES-256-GCM**
- 32-byte random `MAP_KEY`
- Stored in `.env`

### ⚠️ If MAP_KEY is lost, you cannot unpack.

**Back up `.env` securely.**

---

# ✔ Recommended Security Practices

- Add `.env` to `.gitignore`  
- Store MAP_KEY in a secrets manager  
- Use Zozzona in CI/CD to prevent source leaks  
- Always unpack before editing  
- Run `git diff` before commit to ensure protected output  
- Never regenerate MAP_KEY while packed  

---

# 🧪 Vulnerability Disclosure

If you discover a security issue, open a **private** GitHub security advisory or contact the maintainer directly.
