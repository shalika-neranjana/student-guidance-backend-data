const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ================= DATABASE ================= */

mongoose.connect("mongodb+srv://dbuser:User123@itpm.mj3w7rm.mongodb.net/InternConnect")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

/* ================= MODELS ================= */

// Student
const Student = mongoose.model("students", new mongoose.Schema({
    studentId: String,
    firstName: String,
    lastName: String
}));

// Module
const Module = mongoose.model("modules", new mongoose.Schema({
    module_name: String,
    module_code: String
}));

// Result (IMPORTANT)
const Result = mongoose.model("results", new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "students"
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "modules"
    },
    caMarks: Number,
    grade: String
}));

async function updateResult(req, res) {
    const { id } = req.params;
    const { student, module, caMarks, grade } = req.body;

    const updated = await Result.findByIdAndUpdate(
        id,
        { student, module, caMarks, grade },
        { new: true }
    ).populate("student").populate("module");

    if (!updated) {
        return res.status(404).json({ message: "Result not found" });
    }

    res.json({ message: "Updated successfully", result: updated });
}

async function deleteResult(req, res) {
    const { id } = req.params;
    const deleted = await Result.findByIdAndDelete(id);

    if (!deleted) {
        return res.status(404).json({ message: "Result not found" });
    }

    res.json({ message: "Deleted successfully" });
}

/* ================= ROUTES ================= */

// Get Students
app.get("/students", async (req, res) => {
    res.json(await Student.find());
});

// Get Modules
app.get("/modules", async (req, res) => {
    try {
        const modules = await Module.find().sort({ module_name: 1, module_code: 1 });
        res.json(modules);
    } catch (error) {
        res.status(500).json({ message: "Failed to load modules" });
    }
});

// Save Result
app.post("/results", async (req, res) => {
    const { student, module, caMarks, grade } = req.body;

    const result = new Result({ student, module, caMarks, grade });
    await result.save();

    res.json({ message: "Saved successfully" });
});

// Update Result
app.put("/results/:id", updateResult);
app.post("/results/:id/update", updateResult);

// Delete Result
app.delete("/results/:id", deleteResult);
app.post("/results/:id/delete", deleteResult);

// Get Results (JOIN 🔥)
app.get("/results", async (req, res) => {
    const results = await Result.find()
        .populate("student")
        .populate("module");

    res.json(results);
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(5000, () => console.log("Server running on \x1b[4m\x1b[34mhttp://localhost:5000/\x1b[0m"));
