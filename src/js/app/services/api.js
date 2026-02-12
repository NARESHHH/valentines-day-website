async function parseJson(response) {
    return response.json().catch(() => ({}));
}

export async function createShareLink(payload) {
    const response = await fetch("/api/create-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
    });

    const data = await parseJson(response);
    if (!response.ok || !data.shareUrl || !data.payload) {
        throw new Error(data.error || "Unable to create share link");
    }

    return data;
}

export async function loadByToken(token) {
    const response = await fetch(`/api/valentine/${encodeURIComponent(token)}`);
    const data = await parseJson(response);

    if (!response.ok || !data.payload) {
        throw new Error(data.error || "Invalid or expired share link");
    }

    return data.payload;
}
