const mongoose = require("mongoose");

const {
    ALLOWED_GRADES,
    MAX_CA_MARKS,
    MIN_CA_MARKS
} = require("../constants/resultConstants");
const AppError = require("../utils/appError");

function normalizeString(value) {
    return typeof value === "string" ? value.trim() : "";
}

function validateResultPayload(payload = {}) {
    const errors = [];
    const student = normalizeString(payload.student);
    const moduleId = normalizeString(payload.module);
    const grade = normalizeString(payload.grade).toUpperCase();
    const hasCaMarksValue = payload.caMarks !== "" && payload.caMarks !== null && payload.caMarks !== undefined;
    const caMarks = hasCaMarksValue ? Number(payload.caMarks) : Number.NaN;

    if (!mongoose.isValidObjectId(student)) {
        errors.push({
            field: "student",
            message: "Select a valid student."
        });
    }

    if (!mongoose.isValidObjectId(moduleId)) {
        errors.push({
            field: "module",
            message: "Select a valid module."
        });
    }

    if (!Number.isFinite(caMarks) || caMarks < MIN_CA_MARKS || caMarks > MAX_CA_MARKS) {
        errors.push({
            field: "caMarks",
            message: `Enter CA marks between ${MIN_CA_MARKS} and ${MAX_CA_MARKS}.`
        });
    }

    if (!ALLOWED_GRADES.includes(grade)) {
        errors.push({
            field: "grade",
            message: `Grade must be one of: ${ALLOWED_GRADES.join(", ")}.`
        });
    }

    return {
        errors,
        sanitized: {
            caMarks,
            grade,
            module: moduleId,
            student
        }
    };
}

function validateResultRequest(req, _res, next) {
    const { errors, sanitized } = validateResultPayload(req.body);

    if (errors.length > 0) {
        next(new AppError(400, "Invalid result payload.", errors));
        return;
    }

    req.validatedBody = sanitized;
    next();
}

module.exports = {
    validateResultPayload,
    validateResultRequest
};
