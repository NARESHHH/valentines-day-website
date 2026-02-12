const crypto = require("crypto");

function deriveKey(secret) {
    return crypto.createHash("sha256").update(secret).digest();
}

function createCryptoDataService(secret) {
    const key = deriveKey(secret);

    function encryptText(plainText) {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
        const encrypted = Buffer.concat([cipher.update(String(plainText), "utf8"), cipher.final()]);
        const tag = cipher.getAuthTag();

        return {
            iv: iv.toString("base64"),
            tag: tag.toString("base64"),
            data: encrypted.toString("base64"),
        };
    }

    function decryptText(payload) {
        const iv = Buffer.from(payload.iv, "base64");
        const tag = Buffer.from(payload.tag, "base64");
        const data = Buffer.from(payload.data, "base64");

        const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
        decipher.setAuthTag(tag);

        const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
        return decrypted.toString("utf8");
    }

    return {
        encryptText,
        decryptText,
    };
}

module.exports = { createCryptoDataService };
