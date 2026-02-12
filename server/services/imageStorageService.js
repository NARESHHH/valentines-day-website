const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

function parseDataUrl(dataUrl) {
    const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl || "");
    if (!match) return null;

    const mime = match[1].toLowerCase();
    const base64 = match[2];
    const extMap = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "image/avif": "avif",
    };

    return {
        mime,
        ext: extMap[mime] || "bin",
        buffer: Buffer.from(base64, "base64"),
    };
}

function createImageStorageService({
    provider,
    uploadDir,
    cloudinaryCloudName,
    cloudinaryApiKey,
    cloudinaryApiSecret,
}) {
    const useCloudinary =
        provider === "cloudinary" &&
        cloudinaryCloudName &&
        cloudinaryApiKey &&
        cloudinaryApiSecret;

    let cloudinary = null;
    if (useCloudinary) {
        cloudinary = require("cloudinary").v2;
        cloudinary.config({
            cloud_name: cloudinaryCloudName,
            api_key: cloudinaryApiKey,
            api_secret: cloudinaryApiSecret,
            secure: true,
        });
    }

    async function ensureLocalUploadDir() {
        if (!fs.existsSync(uploadDir)) {
            await fsp.mkdir(uploadDir, { recursive: true });
        }
    }

    async function storeImageFromDataUrl(dataUrl, { baseUrl }) {
        if (!dataUrl) return "";

        const parsed = parseDataUrl(dataUrl);
        if (!parsed) {
            const error = new Error("Invalid image payload");
            error.code = "INVALID_IMAGE";
            throw error;
        }

        if (useCloudinary) {
            const result = await cloudinary.uploader.upload(dataUrl, {
                folder: "valentine-links",
                resource_type: "image",
            });
            return result.secure_url;
        }

        await ensureLocalUploadDir();
        const fileName = `${Date.now()}-${crypto.randomUUID()}.${parsed.ext}`;
        const filePath = path.join(uploadDir, fileName);
        await fsp.writeFile(filePath, parsed.buffer);

        return `${baseUrl}/uploads/${fileName}`;
    }

    return {
        storeImageFromDataUrl,
        provider: useCloudinary ? "cloudinary" : "local",
    };
}

module.exports = { createImageStorageService };
