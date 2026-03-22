const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        firstName: {
            required: true,
            trim: true,
            type: String
        },
        lastName: {
            default: "",
            trim: true,
            type: String
        },
        studentId: {
            default: "",
            trim: true,
            type: String
        }
    },
    {
        collection: "students",
        versionKey: false
    }
);

module.exports = mongoose.model("Student", studentSchema);
