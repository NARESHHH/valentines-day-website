const express = require("express");
const { validatePayload } = require("../utils/payloadValidation");

function buildApiRouter({ getBaseUrl, linkService, imageStorageService }) {
    const router = express.Router();

    router.post("/create-link", async (req, res) => {
        const payload = req.body?.payload;

        const payloadError = validatePayload(payload);
        if (payloadError) {
            return res.status(400).json({ error: payloadError });
        }

        try {
            const baseUrl = getBaseUrl(req);
            const imageUrl = await imageStorageService.storeImageFromDataUrl(payload.imageDataUrl || "", { baseUrl });

            const normalizedPayload = {
                fromName: payload.fromName,
                toName: payload.toName,
                quote: payload.quote || "",
                imageUrl,
            };

            const token = await linkService.saveLink({ payload: normalizedPayload, userId: "public" });
            const shareUrl = `${baseUrl}/?v=${token}`;

            return res.json({ token, shareUrl, payload: normalizedPayload });
        } catch (error) {
            if (error.code === "INVALID_IMAGE") {
                return res.status(400).json({ error: error.message });
            }

            return res.status(500).json({ error: error.message || "Failed to create share link" });
        }
    });

    router.get("/valentine/:token", async (req, res) => {
        if (!/^[A-Za-z0-9_-]{12,64}$/.test(req.params.token || "")) {
            return res.status(400).json({ error: "Invalid token format" });
        }

        try {
            const entry = await linkService.getLink(req.params.token);
            if (!entry) {
                return res.status(404).json({ error: "Share link not found" });
            }

            return res.json({ payload: entry.payload, createdAt: entry.createdAt });
        } catch (error) {
            return res.status(500).json({ error: error.message || "Failed to read share link" });
        }
    });

    return router;
}

module.exports = { buildApiRouter };
