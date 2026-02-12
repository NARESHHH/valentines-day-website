const crypto = require("crypto");

function createLinkService({ databaseService, cryptoDataService }) {
    function buildToken() {
        return crypto.randomBytes(12).toString("base64url");
    }

    async function saveLink({ payload, userId }) {
        const encryptedPayload = cryptoDataService.encryptText(JSON.stringify(payload));
        const maxAttempts = 5;

        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            const token = buildToken();
            try {
                await databaseService.saveLink({
                    token,
                    userId,
                    encryptedPayload,
                });
                return token;
            } catch (error) {
                if (error?.errorType === "uniqueViolated" && attempt < maxAttempts) {
                    continue;
                }
                throw error;
            }
        }

        throw new Error("Unable to generate unique link token");
    }

    async function getLink(token) {
        const doc = await databaseService.getLink(token);
        if (!doc) return null;

        const payload = JSON.parse(cryptoDataService.decryptText(doc.encryptedPayload));

        return {
            userId: doc.userId,
            createdAt: doc.createdAt,
            payload,
        };
    }

    async function listLinksByUser(userId, limit = 50) {
        const docs = await databaseService.listLinksByUser(userId, limit);
        return docs.map((doc) => ({
            token: doc.token,
            createdAt: doc.createdAt,
            payload: JSON.parse(cryptoDataService.decryptText(doc.encryptedPayload)),
        }));
    }

    return {
        saveLink,
        getLink,
        listLinksByUser,
    };
}

module.exports = { createLinkService };
