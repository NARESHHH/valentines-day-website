const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const config = require("./config");
const { getBaseUrl } = require("./utils/baseUrl");
const { createCryptoDataService } = require("./utils/cryptoData");
const { createLinkService } = require("./services/linkService");
const { createDatabaseService } = require("./services/databaseService");
const { createImageStorageService } = require("./services/imageStorageService");
const { buildApiRouter } = require("./routes/api");

function buildCorsOptions() {
    function normalizeOrigin(value) {
        return (value || "")
            .trim()
            .replace(/^['"]+|['"]+$/g, "")
            .toLowerCase()
            .replace(/\/+$/, "");
    }

    const allowedOrigins = new Set(
        [...config.allowedOrigins, config.appBaseUrl]
            .map(normalizeOrigin)
            .filter(Boolean)
    );

    if (config.allowedOrigins.length === 0) {
        return { origin: true, credentials: false };
    }

    return {
        origin(origin, callback) {
            if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
                callback(null, true);
                return;
            }
            callback(new Error("Not allowed by CORS"));
        },
        credentials: false,
    };
}

function buildApp() {
    const app = express();

    const databaseService = createDatabaseService({
        dbFile: config.dbFile,
    });

    const cryptoDataService = createCryptoDataService(config.dataEncryptionKey);

    const imageStorageService = createImageStorageService({
        provider: config.imageStorageProvider,
        uploadDir: config.uploadDir,
        cloudinaryCloudName: config.cloudinaryCloudName,
        cloudinaryApiKey: config.cloudinaryApiKey,
        cloudinaryApiSecret: config.cloudinaryApiSecret,
    });
    if (config.isProduction && imageStorageService.provider === "local") {
        // eslint-disable-next-line no-console
        console.warn(
            "[WARN] IMAGE_STORAGE_PROVIDER=local in production. Use persistent disk or switch to cloudinary."
        );
    }

    const linkService = createLinkService({ databaseService, cryptoDataService });

    const resolveBaseUrl = (req) => getBaseUrl(req, config.isProduction ? config.appBaseUrl : undefined);

    app.disable("x-powered-by");
    app.set("trust proxy", 1);

    app.use(
        helmet({
            crossOriginResourcePolicy: { policy: "cross-origin" },
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'"],
                    scriptSrcAttr: ["'none'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "blob:", "https:"],
                    connectSrc: ["'self'"],
                    fontSrc: ["'self'", "data:"],
                    objectSrc: ["'none'"],
                    baseUri: ["'self'"],
                    frameAncestors: ["'none'"],
                },
            },
        })
    );
    app.use(compression());
    if (!config.isProduction) app.use(morgan("dev"));

    app.use(express.json({ limit: config.requestSizeLimit }));

    const apiLimiter = rateLimit({
        windowMs: config.apiRateLimitWindowMs,
        max: config.apiRateLimitMax,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: "Too many requests, please try again later." },
    });

    app.get("/healthz", (req, res) => {
        res.status(200).json({ ok: true, uptime: process.uptime() });
    });

    app.get("/readyz", (req, res) => {
        res.status(200).json({ ok: true });
    });

    app.use(express.static(config.staticDir, { maxAge: config.isProduction ? "1h" : 0 }));
    app.use("/uploads", express.static(config.uploadDir, { maxAge: config.isProduction ? "7d" : 0 }));

    app.use("/api", cors(buildCorsOptions()));
    app.use("/api", apiLimiter);
    app.use(
        "/api",
        buildApiRouter({
            getBaseUrl: resolveBaseUrl,
            linkService,
            imageStorageService,
        })
    );

    app.get("*", (req, res) => {
        res.sendFile(path.join(config.staticDir, "index.html"));
    });

    app.use((err, req, res, next) => {
        if (!err) return next();

        if (err.message === "Not allowed by CORS") {
            return res.status(403).json({ error: "Origin not allowed" });
        }

        // eslint-disable-next-line no-console
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    });

    return app;
}

module.exports = { buildApp };
