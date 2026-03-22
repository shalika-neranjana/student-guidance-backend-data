const Module = require("../models/moduleModel");

async function listModules(_req, res) {
    const modules = await Module.find()
        .select("module_name module_code")
        .sort({ module_name: 1, module_code: 1 })
        .lean();

    res.json(modules);
}

module.exports = {
    listModules
};
