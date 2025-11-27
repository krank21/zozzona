#!/usr/bin/env node
import fs from "fs-extra";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const keyB64 = process.env.MAP_KEY;
if (!keyB64) throw new Error("MAP_KEY missing in environment");

const KEY = Buffer.from(keyB64, "base64");
if (KEY.length !== 32) throw new Error("MAP_KEY must decode to 32 bytes");

const ALGO = "aes-256-gcm";

// Encrypt raw buffer
function encryptBuffer(buf) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(buf), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]);
}

// Decrypt raw buffer
function decryptBuffer(buf) {
  const iv = buf.slice(0, 12);
  const tag = buf.slice(12, 28);
  const data = buf.slice(28);

  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(data), decipher.final()]);
}

export function encryptFileSync(file) {
  const buf = fs.readFileSync(file);
  const enc = encryptBuffer(buf);
  fs.writeFileSync(file + ".enc", enc);
  console.log(`Encrypted ${file} → ${file}.enc`);
}

export function decryptFileSync(encFile, outFile) {
  const buf = fs.readFileSync(encFile);
  const dec = decryptBuffer(buf);
  fs.writeFileSync(outFile, dec);
  console.log(`Decrypted ${encFile} → ${outFile}`);
}
