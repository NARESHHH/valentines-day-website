function getBaseUrl(req, configuredBaseUrl) {
    return configuredBaseUrl || `${req.protocol}://${req.get("host")}`;
}

module.exports = { getBaseUrl };
