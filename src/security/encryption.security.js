import { ENCRYPTION_KEY } from "../../config/config.service.js";
import CryptoJS from "cryptojs";
import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32); // 256-bit key
const iv = crypto.randomBytes(16);

export function encrypt(text, type) {
  if (type == "cryptojs")
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  else if (type == "cryptojs") {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  }
}

export function decrypt(encrypted, type) {
  if (type == "cryptojs")
    return CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY).toString(
      CryptoJS.enc.Utf8,
    );
  else if (type == "cryptojs") {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
}
