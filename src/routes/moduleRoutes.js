const express = require("express");

const { listModules } = require("../controllers/moduleController");

const router = express.Router();

router.get("/modules", listModules);

module.exports = router;
