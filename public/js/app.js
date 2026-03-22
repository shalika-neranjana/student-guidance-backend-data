const API = window.location.protocol === "file:" ? "http://localhost:5000" : "";

const modal = document.getElementById("modal");
const studentFilter = document.getElementById("studentFilter");
const moduleSelect = document.getElementById("module");
const searchInput = document.getElementById("searchInput");
const resultsTable = document.getElementById("resultsTable");
const resultCount = document.getElementById("resultCount");
const formTitle = document.getElementById("formTitle");
const selectedStudentLabel = document.getElementById("selectedStudentLabel");
const caMarksInput = document.getElementById("caMarks");
const gradeSelect = document.getElementById("grade");
const caError = document.getElementById("caError");
const statusBanner = document.getElementById("statusBanner");
const saveBtn = document.getElementById("saveBtn");
const newResultBtn = document.getElementById("newResultBtn");
const cancelBtn = document.getElementById("cancelBtn");
const clearSearchBtn = document.getElementById("clearSearchBtn");

let editingId = null;
let allResults = [];
let students = [];
let modules = [];
let isLoading = true;
let lastFocusedElement = null;

function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}

function showStatus(message, type = "success") {
    statusBanner.textContent = message;
    statusBanner.className = `status-banner show ${type}`;

    window.clearTimeout(showStatus.timeoutId);
    showStatus.timeoutId = window.setTimeout(() => {
        statusBanner.className = "status-banner";
        statusBanner.textContent = "";
    }, 3500);
}

function getSelectedStudentName() {
    const selected = students.find((student) => student._id === studentFilter.value);
    if (!selected) {
        return "No student selected";
    }

    return `${selected.firstName} ${selected.lastName || ""}`.trim();
}

function resetForm() {
    moduleSelect.value = modules[0]?._id || "";
    caMarksInput.value = "";
    gradeSelect.value = "";
    caError.textContent = "";
}

async function openModal(preferredModuleId = "") {
    if (!studentFilter.value) {
        showStatus("Select a student before adding a result.", "error");
        studentFilter.focus();
        return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = "Loading...";

    try {
        await loadModules(preferredModuleId);
    } catch {
        showStatus("Couldn't load modules. Check that the server is running.", "error");
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Result";
        return;
    }

    saveBtn.disabled = false;
    saveBtn.textContent = "Save Result";

    if (!modules.length) {
        showStatus("No modules available. Add modules before creating results.", "error");
        return;
    }

    lastFocusedElement = document.activeElement;
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    selectedStudentLabel.textContent = `${editingId ? "Editing" : "Adding"} result for ${getSelectedStudentName()}.`;
    window.setTimeout(() => moduleSelect.focus(), 0);
}

function closeModal() {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    editingId = null;
    formTitle.textContent = "Add Result";
    resetForm();

    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
}

function loadStudents() {
    return fetch(`${API}/students`)
        .then((res) => {
            if (!res.ok) {
                throw new Error("Failed to load students");
            }

            return res.json();
        })
        .then((data) => {
            students = data;
            studentFilter.innerHTML = `
                <option value="">Select a student</option>
                ${data.map((student) => `<option value="${escapeHtml(student._id)}">${escapeHtml(`${student.firstName} ${student.lastName || ""}`.trim())}</option>`).join("")}
            `;
        })
        .catch(() => {
            showStatus("Couldn't load students. Check that the server is running.", "error");
        });
}

async function loadModules(preferredModuleId = "") {
    const previousValue = moduleSelect.value;

    const res = await fetch(`${API}/modules`);
    if (!res.ok) {
        throw new Error("Failed to load modules");
    }

    const data = await res.json();
    modules = data;

    moduleSelect.innerHTML = data.map((module) => `
        <option value="${escapeHtml(module._id)}">${escapeHtml(module.module_name)} (${escapeHtml(module.module_code)})</option>
    `).join("");

    if (!data.length) {
        moduleSelect.value = "";
        return;
    }

    const selectedValue = preferredModuleId || previousValue;
    const selectedModuleExists = data.some((module) => module._id === selectedValue);

    moduleSelect.value = selectedModuleExists ? selectedValue : data[0]._id;
}

function loadResults() {
    isLoading = true;
    renderTable();

    fetch(`${API}/results`)
        .then((res) => {
            if (!res.ok) {
                throw new Error("Failed to load results");
            }

            return res.json();
        })
        .then((data) => {
            allResults = data;
            isLoading = false;
            renderTable();
        })
        .catch(() => {
            isLoading = false;
            showStatus("Couldn't load results. Check that the API is available.", "error");
            renderTable();
        });
}

function renderTable() {
    const studentId = studentFilter.value;
    const search = searchInput.value.toLowerCase();

    if (isLoading) {
        resultsTable.innerHTML = '<tr class="loading-row"><td colspan="4">Loading results...</td></tr>';
        return;
    }

    if (!studentId) {
        resultCount.textContent = "0 results";
        resultsTable.innerHTML = `<tr><td colspan="4" class="empty-state">
            <strong>Select a student to get started</strong>
            Choose a student from the filter above to view, edit, or add results.
        </td></tr>`;
        return;
    }

    const filtered = allResults.filter((result) => {
        const matchStudent = result.student._id === studentId;
        const moduleText = `${result.module.module_name}${result.module.module_code}`.toLowerCase();
        const matchSearch = moduleText.includes(search);
        return matchStudent && matchSearch;
    });

    resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "result" : "results"}`;

    if (!filtered.length) {
        resultsTable.innerHTML = `<tr><td colspan="4" class="empty-state">
            <strong>No results found</strong>
            ${search ? "Try a different search term or clear the filter." : "No results have been recorded for this student yet."}
            <div class="empty-actions">
                <button class="btn-action" type="button" id="emptyClearBtn"${search ? "" : " style=\"display:none\""}>Clear search</button>
                <button class="btn-primary" type="button" id="emptyAddBtn">+ Add Result</button>
            </div>
        </td></tr>`;

        const emptyClearBtn = document.getElementById("emptyClearBtn");
        const emptyAddBtn = document.getElementById("emptyAddBtn");

        if (emptyClearBtn) {
            emptyClearBtn.addEventListener("click", () => {
                searchInput.value = "";
                renderTable();
            });
        }

        if (emptyAddBtn) {
            emptyAddBtn.addEventListener("click", openModal);
        }

        return;
    }

    resultsTable.innerHTML = filtered.map((result) => `
        <tr>
            <td>
                <div class="stack">
                    <strong>${escapeHtml(result.module.module_name)}</strong>
                    <span class="field-help">${escapeHtml(result.module.module_code)}</span>
                </div>
            </td>
            <td>${escapeHtml(result.caMarks)}</td>
            <td>${escapeHtml(result.grade)}</td>
            <td class="actions-cell">
                <div class="actions-group">
                    <button class="btn-action edit-btn" type="button" data-id="${escapeHtml(result._id)}">Edit</button>
                    <button class="btn-danger delete-btn" type="button" data-id="${escapeHtml(result._id)}" data-module="${escapeHtml(result.module.module_name)}">Delete</button>
                </div>
            </td>
        </tr>
    `).join("");
}

function saveResult() {
    const caMarksValue = Number(caMarksInput.value);

    if (!studentFilter.value) {
        showStatus("Select a student before saving a result.", "error");
        closeModal();
        return;
    }

    if (!moduleSelect.value) {
        showStatus("Select a module before saving.", "error");
        moduleSelect.focus();
        return;
    }

    if (Number.isNaN(caMarksValue) || caMarksInput.value === "" || caMarksValue < 0 || caMarksValue > 100) {
        caError.textContent = "Enter CA marks between 0 and 100.";
        caMarksInput.focus();
        return;
    }

    if (!gradeSelect.value) {
        showStatus("Select a grade before saving.", "error");
        gradeSelect.focus();
        return;
    }

    caError.textContent = "";

    const data = {
        student: studentFilter.value,
        module: moduleSelect.value,
        caMarks: caMarksValue,
        grade: gradeSelect.value
    };

    const isEditing = Boolean(editingId);
    const method = "POST";
    const url = editingId ? `${API}/results/${editingId}/update` : `${API}/results`;

    saveBtn.disabled = true;
    saveBtn.textContent = editingId ? "Saving..." : "Creating...";

    fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error("Save failed");
            }

            closeModal();
            loadResults();
            showStatus(isEditing ? "Result updated successfully." : "Result created successfully.");
        })
        .catch(() => {
            showStatus("Couldn't save the result. Try again.", "error");
        })
        .finally(() => {
            saveBtn.disabled = false;
            saveBtn.textContent = "Save Result";
        });
}

function editResult(id) {
    const result = allResults.find((item) => item._id === id);
    if (!result) {
        return;
    }

    editingId = id;
    formTitle.textContent = "Edit Result";
    openModal(result.module._id);
    caMarksInput.value = result.caMarks;
    gradeSelect.value = result.grade;
}

function deleteResult(id, moduleName) {
    const confirmed = window.confirm(`Delete the result for ${moduleName}? This can't be undone.`);
    if (!confirmed) {
        return;
    }

    fetch(`${API}/results/${id}/delete`, { method: "POST" })
        .then((res) => {
            if (!res.ok) {
                throw new Error("Delete failed");
            }

            loadResults();
            showStatus("Result deleted successfully.");
        })
        .catch(() => {
            showStatus("Couldn't delete the result. Try again.", "error");
        });
}

studentFilter.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);
newResultBtn.addEventListener("click", openModal);
cancelBtn.addEventListener("click", closeModal);
saveBtn.addEventListener("click", saveResult);
clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    renderTable();
    searchInput.focus();
});
caMarksInput.addEventListener("input", () => {
    if (caError.textContent) {
        caError.textContent = "";
    }
});

modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.style.display === "flex") {
        closeModal();
    }
});

resultsTable.addEventListener("click", (event) => {
    const editButton = event.target.closest(".edit-btn");
    const deleteButton = event.target.closest(".delete-btn");

    if (editButton) {
        editResult(editButton.dataset.id);
    }

    if (deleteButton) {
        deleteResult(deleteButton.dataset.id, deleteButton.dataset.module);
    }
});

Promise.all([loadStudents(), loadModules()]).finally(loadResults);
