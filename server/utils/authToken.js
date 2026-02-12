const crypto = require("crypto");

function base64UrlEncode(value) {
    return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
    return Buffer.from(value, "base64url").toString("utf8");
}

function createAuthTokenService({ signingKey, ttlSec }) {
    function sign(payload) {
        const body = {
            ...payload,
            exp: Math.floor(Date.now() / 1000) + ttlSec,
        };

        const encodedBody = base64UrlEncode(JSON.stringify(body));
        const sig = crypto.createHmac("sha256", signingKey).update(encodedBody).digest("base64url");
        return `${encodedBody}.${sig}`;
    }

    function verify(token) {
        const [encodedBody, sig] = String(token || "").split(".");
        if (!encodedBody || !sig) return null;

        const expectedSig = crypto.createHmac("sha256", signingKey).update(encodedBody).digest("base64url");
        if (sig !== expectedSig) return null;

        try {
            const payload = JSON.parse(base64UrlDecode(encodedBody));
            if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
            return payload;
        } catch {
            return null;
        }
    }

    return {
        sign,
        verify,
    };
}

module.exports = { createAuthTokenService };
