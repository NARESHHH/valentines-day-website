const crypto = require("crypto");

function createUserService({ databaseService, cryptoDataService }) {
    function buildUserId() {
        return crypto.randomBytes(10).toString("base64url");
    }

    function emailHash(email) {
        return crypto.createHash("sha256").update(email).digest("hex");
    }

    async function findOrCreateUserByEmail(email) {
        const hash = emailHash(email);
        const existing = await databaseService.findUserByEmailHash(hash);
        if (existing) {
            return {
                id: existing.accountId || existing.userId,
                email,
                createdAt: existing.createdAt,
            };
        }

        const encryptedEmail = cryptoDataService.encryptText(email);
        const userId = buildUserId();

        await databaseService.insertUser({
            userId,
            emailHash: hash,
            encryptedEmail,
        });

        return {
            id: userId,
            email,
        };
    }

    async function getUserById(userId) {
        const user = await databaseService.findUserById(userId);
        if (!user) return null;

        const email = cryptoDataService.decryptText(user.encryptedEmail);

        return {
            id: user.accountId || user.userId,
            email,
            createdAt: user.createdAt,
        };
    }

    return {
        findOrCreateUserByEmail,
        getUserById,
    };
}

module.exports = { createUserService };
