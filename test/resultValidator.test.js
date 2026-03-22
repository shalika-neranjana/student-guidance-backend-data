const test = require("node:test");
const assert = require("node:assert/strict");

const { validateResultPayload } = require("../src/validators/resultValidator");

const VALID_OBJECT_ID = "507f1f77bcf86cd799439011";

test("validateResultPayload sanitizes a valid result payload", () => {
    const { errors, sanitized } = validateResultPayload({
        caMarks: "78",
        grade: " a+ ",
        module: VALID_OBJECT_ID,
        student: VALID_OBJECT_ID
    });

    assert.deepEqual(errors, []);
    assert.deepEqual(sanitized, {
        caMarks: 78,
        grade: "A+",
        module: VALID_OBJECT_ID,
        student: VALID_OBJECT_ID
    });
});

test("validateResultPayload returns field errors for invalid input", () => {
    const { errors } = validateResultPayload({
        caMarks: 120,
        grade: "Z",
        module: "invalid-module-id",
        student: ""
    });

    assert.deepEqual(
        errors.map((error) => error.field).sort(),
        ["caMarks", "grade", "module", "student"]
    );
});
