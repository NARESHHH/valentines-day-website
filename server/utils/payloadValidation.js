function validatePayload(payload) {
    if (!payload || typeof payload !== "object") return "Invalid payload";

    const fromName = typeof payload.fromName === "string" ? payload.fromName.trim() : "";
    const toName = typeof payload.toName === "string" ? payload.toName.trim() : "";
    const quote = typeof payload.quote === "string" ? payload.quote.trim() : "";
    const imageDataUrl = typeof payload.imageDataUrl === "string" ? payload.imageDataUrl : "";

    if (!fromName || !toName) return "Both names are required";
    if (fromName.length > 80 || toName.length > 80) return "Name is too long";
    if (quote.length > 1000) return "Quote is too long";
    if (imageDataUrl && !imageDataUrl.startsWith("data:image/")) return "Invalid image format";
    if (imageDataUrl.length > 8_000_000) return "Image is too large";

    return null;
}

module.exports = { validatePayload };
