class AppError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.name = "AppError";
        this.details = details;
        this.statusCode = statusCode;
    }
}

module.exports = AppError;
