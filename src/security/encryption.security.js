import { ENCRYPTION_KEY } from "../../config/config.service.js";
import CryptoJS from "cryptojs";

export const encrypted = (text) => {
  CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};
export const dncrypted = (cipherText) => {
  CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
};
