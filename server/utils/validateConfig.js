function assert(condition, message) {
    if (!condition) {
        const error = new Error(message);
        error.code = "CONFIG_ERROR";
        throw error;
    }
}

function validateConfig(config) {
    assert(config.port > 0, "PORT must be a positive integer");
    assert(config.dataEncryptionKey && config.dataEncryptionKey.length >= 16, "DATA_ENCRYPTION_KEY must be set");

    assert(
        config.imageStorageProvider === "local" || config.imageStorageProvider === "cloudinary",
        "IMAGE_STORAGE_PROVIDER must be either 'local' or 'cloudinary'"
    );

    if (config.imageStorageProvider === "cloudinary") {
        assert(config.cloudinaryCloudName, "CLOUDINARY_CLOUD_NAME is required for cloudinary provider");
        assert(config.cloudinaryApiKey, "CLOUDINARY_API_KEY is required for cloudinary provider");
        assert(config.cloudinaryApiSecret, "CLOUDINARY_API_SECRET is required for cloudinary provider");
    }

    if (config.isProduction) {
        assert(config.appBaseUrl, "APP_BASE_URL is required in production");
        assert(config.allowedOrigins.length > 0, "ALLOWED_ORIGINS is required in production");
        assert(
            config.dataEncryptionKey !== "dev-encryption-key-change-me",
            "DATA_ENCRYPTION_KEY must not use the development default in production"
        );
    }
}

module.exports = { validateConfig };
