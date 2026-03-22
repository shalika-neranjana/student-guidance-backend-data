const AppError = require("../utils/appError");

function buildDetails(error) {
    return Object.values(error.errors || {}).map(({ message, path }) => ({
        field: path,
        message
    }));
}

function normalizeError(error) {
    if (error instanceof AppError) {
        return error;
    }

    if (error?.name === "ValidationError") {
        return new AppError(400, "Validation failed.", buildDetails(error));
    }

    if (error?.name === "CastError") {
        return new AppError(400, `Invalid ${error.path}.`);
    }

    return new AppError(500, "Internal server error");
}

function errorHandler(error, _req, res, _next) {
    const normalizedError = normalizeError(error);

    if (normalizedError.statusCode >= 500) {
        console.error(error);
    }

    res.status(normalizedError.statusCode).json({
        details: normalizedError.details || undefined,
        message: normalizedError.message
    });
}

function notFoundHandler(req, _res, next) {
    next(new AppError(404, `Route ${req.method} ${req.originalUrl} was not found.`));
}

module.exports = {
    errorHandler,
    notFoundHandler
};
