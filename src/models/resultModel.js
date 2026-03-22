const mongoose = require("mongoose");

const {
    ALLOWED_GRADES,
    MAX_CA_MARKS,
    MIN_CA_MARKS
} = require("../constants/resultConstants");

const resultSchema = new mongoose.Schema(
    {
        caMarks: {
            max: MAX_CA_MARKS,
            min: MIN_CA_MARKS,
            required: true,
            type: Number
        },
        grade: {
            enum: ALLOWED_GRADES,
            required: true,
            trim: true,
            type: String
        },
        module: {
            index: true,
            ref: "Module",
            required: true,
            type: mongoose.Schema.Types.ObjectId
        },
        student: {
            index: true,
            ref: "Student",
            required: true,
            type: mongoose.Schema.Types.ObjectId
        }
    },
    {
        collection: "results",
        versionKey: false
    }
);

module.exports = mongoose.model("Result", resultSchema);
