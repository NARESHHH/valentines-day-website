export function cleanName(value) {
    return value.trim().replace(/\s+/g, " ");
}

export function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

export function quoteToHtml(value) {
    return escapeHtml(value).replace(/\n/g, "<br />");
}
