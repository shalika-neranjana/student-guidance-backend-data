const express = require("express");

const {
    createResult,
    deleteResult,
    listResults,
    updateResult
} = require("../controllers/resultController");
const { validateObjectIdParam } = require("../validators/objectIdValidator");
const { validateResultRequest } = require("../validators/resultValidator");

const router = express.Router();

router.get("/results", listResults);
router.post("/results", validateResultRequest, createResult);
router.put("/results/:id", validateObjectIdParam("id"), validateResultRequest, updateResult);
router.post("/results/:id/update", validateObjectIdParam("id"), validateResultRequest, updateResult);
router.delete("/results/:id", validateObjectIdParam("id"), deleteResult);
router.post("/results/:id/delete", validateObjectIdParam("id"), deleteResult);

module.exports = router;
