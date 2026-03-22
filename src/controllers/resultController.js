const resultService = require("../services/resultService");

async function createResult(req, res) {
    const result = await resultService.createResult(req.validatedBody);

    res.status(201).json({
        message: "Saved successfully",
        result
    });
}

async function deleteResult(req, res) {
    await resultService.deleteResultById(req.params.id);

    res.json({ message: "Deleted successfully" });
}

async function listResults(_req, res) {
    const results = await resultService.getResults();
    res.json(results);
}

async function updateResult(req, res) {
    const result = await resultService.updateResultById(req.params.id, req.validatedBody);

    res.json({
        message: "Updated successfully",
        result
    });
}

module.exports = {
    createResult,
    deleteResult,
    listResults,
    updateResult
};
