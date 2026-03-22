const mongoose = require("mongoose");

const AppError = require("../utils/appError");

function validateObjectIdParam(paramName) {
    return (req, _res, next) => {
        if (!mongoose.isValidObjectId(req.params[paramName])) {
            next(new AppError(400, `Invalid ${paramName}.`));
            return;
        }

        next();
    };
}

module.exports = {
    validateObjectIdParam
};
