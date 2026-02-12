require("dotenv").config();

const config = require("./config");
const { validateConfig } = require("./utils/validateConfig");
const { buildApp } = require("./app");

try {
    validateConfig(config);
} catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[CONFIG] ${error.message}`);
    process.exit(1);
}

const app = buildApp();
const server = app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${config.port}`);
});

function shutdown(signal) {
    // eslint-disable-next-line no-console
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
        // eslint-disable-next-line no-console
        console.log("HTTP server closed.");
        process.exit(0);
    });

    setTimeout(() => {
        // eslint-disable-next-line no-console
        console.error("Forced shutdown after timeout.");
        process.exit(1);
    }, 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
