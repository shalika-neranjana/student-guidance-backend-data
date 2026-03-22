const express = require("express");

const { listStudents } = require("../controllers/studentController");

const router = express.Router();

router.get("/students", listStudents);

module.exports = router;
