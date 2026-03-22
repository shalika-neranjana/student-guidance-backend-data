const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
    {
        module_code: {
            required: true,
            trim: true,
            type: String
        },
        module_name: {
            required: true,
            trim: true,
            type: String
        }
    },
    {
        collection: "modules",
        versionKey: false
    }
);

module.exports = mongoose.model("Module", moduleSchema);
