const fs = require("fs");
const path = require("path");
const Datastore = require("nedb-promises");

function createDatabaseService({ dbFile }) {
    const dbDir = path.dirname(dbFile);
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

    const db = Datastore.create({
        filename: dbFile,
        autoload: true,
        timestampData: true,
    });

    db.ensureIndex({ fieldName: "token", unique: true, sparse: true });
    // Remove old index that incorrectly made link inserts fail for same user.
    db.removeIndex("userId").catch(() => {});
    db.ensureIndex({ fieldName: "accountId", unique: true, sparse: true });
    db.ensureIndex({ fieldName: "emailHash", unique: true, sparse: true });

    async function insertUser(userDoc) {
        await db.insert({
            type: "user",
            accountId: userDoc.userId,
            emailHash: userDoc.emailHash,
            encryptedEmail: userDoc.encryptedEmail,
            createdAt: new Date().toISOString(),
        });
    }

    async function findUserByEmailHash(emailHash) {
        return await db.findOne({ type: "user", emailHash });
    }

    async function findUserById(userId) {
        return await db.findOne({
            type: "user",
            $or: [{ accountId: userId }, { userId }],
        });
    }

    async function saveLink({ token, userId, encryptedPayload }) {
        await db.insert({
            type: "link",
            token,
            userId,
            encryptedPayload,
            createdAt: new Date().toISOString(),
        });
    }

    async function getLink(token) {
        return await db.findOne({ type: "link", token });
    }

    async function listLinksByUser(userId, limit = 50) {
        return await db.find({ type: "link", userId }).sort({ createdAt: -1 }).limit(limit);
    }

    return {
        insertUser,
        findUserByEmailHash,
        findUserById,
        saveLink,
        getLink,
        listLinksByUser,
    };
}

module.exports = { createDatabaseService };
