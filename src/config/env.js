const dotenv = require("dotenv");

dotenv.config({ quiet: true });

function parseCsvList(value) {
    return String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function parsePort(value) {
    const parsedValue = Number.parseInt(value, 10);

    if (Number.isInteger(parsedValue) && parsedValue > 0) {
        return parsedValue;
    }

    return 5000;
}

module.exports = Object.freeze({
    corsOrigins: parseCsvList(process.env.CORS_ORIGIN),
    mongodbDnsServers: parseCsvList(process.env.MONGODB_DNS_SERVERS || "8.8.8.8,1.1.1.1"),
    mongodbUri: process.env.MONGODB_URI || "",
    nodeEnv: process.env.NODE_ENV || "development",
    port: parsePort(process.env.PORT || "5000")
});
