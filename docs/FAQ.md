# ❓ Zozzona.js — Frequently Asked Questions

A collection of common questions and practical developer answers.

---

# 🧩 General

## **What does Zozzona actually do?**

It:

- Obfuscates identifiers  
- Minifies code  
- Encrypts transformation maps  
- Deletes unencrypted mapping files  
- Restores the project perfectly with `zozzona unpack`

---

## **Is Zozzona a build tool?**

No.  
Zozzona runs **after** your build process to protect actual source files (JS/JSX/TS/TSX).

---

## **Which syntaxes are supported?**

- JavaScript  
- TypeScript  
- JSX  
- TSX  
- Decorators  
- Class fields  
- Optional chaining  
- Nullish coalescing  

---

## **Can I use Zozzona in production pipelines?**

Yes — it is designed for **CI/CD safety** and for shipping protected builds.

---

## **Is Zozzona reversible?**

Yes — fully.  
`zozzona unpack` restores the original code **byte for byte**.

---

# 🔐 MAP_KEY & Security

## **What is MAP_KEY?**

A 32-byte AES-256-GCM key stored in `.env`.

## **What if I lose MAP_KEY?**

You lose the ability to unpack.  
Back up `.env` securely.

## **How do I regenerate MAP_KEY properly?**

\`\`\`bash
zozzona unpack
# edit .env with a new MAP_KEY
zozzona pack
\`\`\`

Never regenerate while the project is packed.

---

# ⚙️ Using Zozzona

## **Should I commit packed or unpacked code?**

- Commit: **packed**  
- Work locally: **unpacked**

Husky handles this automatically.

---

## **Can I protect multiple project folders?**

Yes — define them in `pack.config.json`:

\`\`\`json
{
  "folders": ["src", "server", "templates"]
}
\`\`\`

---

## **Does Zozzona protect build output?**

Only if you include build folders in `pack.config.json`.

---

# 🧨 Troubleshooting

## **Husky is not running**

Make sure:

- `.husky/` exists  
- Hooks are executable (`chmod +x .husky/*`)  
- You ran:

\`\`\`bash
npm install
\`\`\`

## **Minify crashes on JSX**

Zozzona bundles `@babel/preset-react`, but ensure your file extensions are correct (`.jsx`, `.tsx`).

## **Files are not being protected**

Check:

- `folders` paths  
- `ignore` patterns  
- File extensions  

---

# 🆘 Need More Help?

Open an issue:  
https://github.com/krank21/zozzona/issues
