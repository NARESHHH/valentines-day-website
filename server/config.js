const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");

function toInteger(value, defaultValue) {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : defaultValue;
}

function toAllowedOrigins(value) {
    if (!value) return [];
    return value
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
}

module.exports = {
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction: (process.env.NODE_ENV || "development") === "production",

    port: toInteger(process.env.PORT, 3000),
    appBaseUrl: process.env.APP_BASE_URL,

    dataEncryptionKey: process.env.DATA_ENCRYPTION_KEY || "dev-encryption-key-change-me",

    imageStorageProvider: process.env.IMAGE_STORAGE_PROVIDER || "local",
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,

    allowedOrigins: toAllowedOrigins(process.env.ALLOWED_ORIGINS),
    requestSizeLimit: process.env.REQUEST_SIZE_LIMIT || "12mb",
    apiRateLimitWindowMs: toInteger(process.env.API_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    apiRateLimitMax: toInteger(process.env.API_RATE_LIMIT_MAX, 300),

    staticDir: path.join(rootDir, "src"),
    dataDir,
    dbFile: process.env.DB_FILE || path.join(dataDir, "app.db.json"),
    uploadDir: process.env.UPLOAD_DIR || path.join(dataDir, "uploads"),
};
