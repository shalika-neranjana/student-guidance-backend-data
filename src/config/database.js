const dns = require("node:dns");
const mongoose = require("mongoose");

const env = require("./env");

const CONNECTION_OPTIONS = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000
};

async function connectToDatabase() {
    if (!env.mongodbUri) {
        throw new Error("MONGODB_URI is not configured. Create a .env file or set the environment variable.");
    }

    try {
        await mongoose.connect(env.mongodbUri, CONNECTION_OPTIONS);
        console.log("MongoDB Connected");
    } catch (error) {
        const isSrvDnsRefusal =
            error?.code === "ECONNREFUSED" &&
            error?.syscall === "querySrv";

        if (!isSrvDnsRefusal || env.mongodbDnsServers.length === 0) {
            throw error;
        }

        console.warn(
            `Primary DNS rejected the MongoDB SRV lookup. Retrying with ${env.mongodbDnsServers.join(", ")}`
        );

        await mongoose.disconnect().catch(() => undefined);
        dns.setServers(env.mongodbDnsServers);
        await mongoose.connect(env.mongodbUri, CONNECTION_OPTIONS);
        console.log("MongoDB Connected");
    }
}

async function disconnectFromDatabase() {
    if (mongoose.connection.readyState === 0) {
        return;
    }

    await mongoose.disconnect();
}

module.exports = {
    connectToDatabase,
    disconnectFromDatabase
};
