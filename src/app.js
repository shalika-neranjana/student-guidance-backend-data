const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const path = require("path");

const env = require("./config/env");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const moduleRoutes = require("./routes/moduleRoutes");
const resultRoutes = require("./routes/resultRoutes");
const studentRoutes = require("./routes/studentRoutes");

function createApp() {
    const app = express();
    const publicDirectory = path.join(__dirname, "..", "public");

    app.disable("x-powered-by");
    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(cors(env.corsOrigins.length ? { origin: env.corsOrigins } : undefined));
    app.use(express.json({ limit: "10kb" }));
    app.use(express.static(publicDirectory));

    app.use(studentRoutes);
    app.use(moduleRoutes);
    app.use(resultRoutes);

    app.get("/", (_req, res) => {
        res.sendFile(path.join(publicDirectory, "index.html"));
    });

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

module.exports = createApp;
