const Module = require("../models/moduleModel");
const Result = require("../models/resultModel");
const Student = require("../models/studentModel");
const AppError = require("../utils/appError");

const RESULT_POPULATION = [
    {
        path: "student",
        select: "studentId firstName lastName"
    },
    {
        path: "module",
        select: "module_name module_code"
    }
];

function buildResultQuery() {
    return Result.find()
        .select("student module caMarks grade")
        .populate(RESULT_POPULATION);
}

async function ensureReferencesExist({ module, student }) {
    const [studentExists, moduleExists] = await Promise.all([
        Student.exists({ _id: student }),
        Module.exists({ _id: module })
    ]);

    if (studentExists && moduleExists) {
        return;
    }

    const missingReferences = [];

    if (!studentExists) {
        missingReferences.push("student");
    }

    if (!moduleExists) {
        missingReferences.push("module");
    }

    throw new AppError(
        400,
        `The selected ${missingReferences.join(" and ")} does not exist.`
    );
}

async function createResult(payload) {
    await ensureReferencesExist(payload);

    const createdResult = await Result.create(payload);
    return getResultById(createdResult._id);
}

async function deleteResultById(id) {
    const deletedResult = await Result.findByIdAndDelete(id).select("_id").lean();

    if (!deletedResult) {
        throw new AppError(404, "Result not found");
    }
}

async function getResultById(id) {
    const result = await Result.findById(id)
        .select("student module caMarks grade")
        .populate(RESULT_POPULATION)
        .lean();

    if (!result) {
        throw new AppError(404, "Result not found");
    }

    return result;
}

async function getResults() {
    return buildResultQuery().lean();
}

async function updateResultById(id, payload) {
    await ensureReferencesExist(payload);

    const updatedResult = await Result.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
    })
        .select("student module caMarks grade")
        .populate(RESULT_POPULATION)
        .lean();

    if (!updatedResult) {
        throw new AppError(404, "Result not found");
    }

    return updatedResult;
}

module.exports = {
    createResult,
    deleteResultById,
    getResultById,
    getResults,
    updateResultById
};
