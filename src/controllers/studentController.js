const Student = require("../models/studentModel");

async function listStudents(_req, res) {
    const students = await Student.find()
        .select("studentId firstName lastName")
        .sort({ firstName: 1, lastName: 1, studentId: 1 })
        .lean();

    res.json(students);
}

module.exports = {
    listStudents
};
