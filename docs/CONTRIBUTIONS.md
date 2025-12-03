# 🤝 Contributing to Zozzona.js

Thanks for your interest in contributing!  
Zozzona.js is a growing reversible source-protection toolkit — and community contributions are essential.

---

# 📦 Project Philosophy

Zozzona follows these principles:

- **Reversibility first** — nothing destructive  
- **Real-world workflows** — Git, CI, teams, automation  
- **Security-conscious** — encrypted metadata  
- **Developer-friendly** — easy to install, easy to remove  

If a feature violates those principles, it will not be merged.

---

# 🏁 Getting Started

## 1. Fork the Repository

https://github.com/krank21/zozzona

## 2. Clone Your Fork

\`\`\`bash
git clone https://github.com/YOURNAME/zozzona
cd zozzona
\`\`\`

## 3. Install Dependencies

\`\`\`bash
npm install
\`\`\`

## 4. Build Locally (optional)

Zozzona is pure JS — no compile step.  
But you *can* bundle it using your own toolchain.

---

# 🧪 Running Tests

(Zozzona’s test suite is early-stage; contributions welcome!)

\`\`\`bash
npm test
\`\`\`

---

# 🛠 Development Workflow

Zozzona uses:

- Pure Node.js
- ESM modules
- Babel parser/traverse/generator
- Terser
- Crypto primitives (AES-256-GCM)
- Husky for Git hooks

You can debug the CLI by running:

\`\`\`bash
node src/config.js init
node src/config.js pack
node src/config.js unpack
\`\`\`

---

# 🔥 Submitting a Pull Request

## PR Checklist

- [ ] Code is clearly written  
- [ ] Breaks no existing behavior  
- [ ] Reversible workflow still works  
- [ ] Works without `.git` (CI/CD mode)  
- [ ] Usage explained if needed  
- [ ] Examples updated if relevant  

## Steps

1. Create a branch  
2. Make your changes  
3. Add/update documentation  
4. Submit PR against `main`

---

# 🛡️ Security Contributions

If you find a vulnerability:

⚠️ **DO NOT open a public issue.**

Instead:

1. Open a **private GitHub security advisory**, or  
2. Email the maintainer (found in package.json)

---

# 🧩 Feature Requests

Create an issue titled:

\`\`\`
[Feature] Your idea here
\`\`\`

Include:

- What problem it solves  
- Why Zozzona should support it  
- Alternative approaches  
- Proposed API  
- Example config  

---

# ❤️ Thank You

Your time and contributions make this project stronger.
