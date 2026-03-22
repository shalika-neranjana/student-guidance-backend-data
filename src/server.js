const createApp = require("./app");
const { connectToDatabase, disconnectFromDatabase } = require("./config/database");
const env = require("./config/env");

function registerShutdownHandlers(server) {
    let isShuttingDown = false;

    const shutdown = (signal) => {
        if (isShuttingDown) {
            return;
        }

        isShuttingDown = true;
        console.log(`${signal} received. Closing server...`);

        server.close(async (serverError) => {
            if (serverError) {
                console.error("Failed to close the HTTP server cleanly", serverError);
                process.exit(1);
                return;
            }

            try {
                await disconnectFromDatabase();
                process.exit(0);
            } catch (databaseError) {
                console.error("Failed to disconnect from MongoDB cleanly", databaseError);
                process.exit(1);
            }
        });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
}

async function startServer() {
    const app = createApp();

    await connectToDatabase();

    const server = app.listen(env.port, () => {
        console.log(`Server running on \x1b[4m\x1b[34mhttp://localhost:${env.port}/\x1b[0m`);
    });

    registerShutdownHandlers(server);

    return server;
}

module.exports = {
    startServer
};
