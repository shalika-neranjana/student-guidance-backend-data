const API_BASE_URL = window.location.protocol === "file:" ? "http://localhost:5000" : "";

const elements = {
    caError: document.getElementById("caError"),
    caMarksInput: document.getElementById("caMarks"),
    cancelBtn: document.getElementById("cancelBtn"),
    clearSearchBtn: document.getElementById("clearSearchBtn"),
    formTitle: document.getElementById("formTitle"),
    gradeSelect: document.getElementById("grade"),
    modal: document.getElementById("modal"),
    moduleSelect: document.getElementById("module"),
    newResultBtn: document.getElementById("newResultBtn"),
    resultCount: document.getElementById("resultCount"),
    resultsTable: document.getElementById("resultsTable"),
    saveBtn: document.getElementById("saveBtn"),
    searchInput: document.getElementById("searchInput"),
    selectedStudentLabel: document.getElementById("selectedStudentLabel"),
    statusBanner: document.getElementById("statusBanner"),
    studentFilter: document.getElementById("studentFilter")
};

const state = {
    editingId: null,
    isLoadingResults: false,
    isSubmitting: false,
    lastFocusedElement: null,
    modules: [],
    results: [],
    students: []
};

function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}

function showStatus(message, type = "success") {
    elements.statusBanner.hidden = false;
    elements.statusBanner.textContent = message;
    elements.statusBanner.className = `status-banner ${type}`;

    window.clearTimeout(showStatus.timeoutId);
    showStatus.timeoutId = window.setTimeout(() => {
        elements.statusBanner.hidden = true;
        elements.statusBanner.className = "status-banner";
        elements.statusBanner.textContent = "";
    }, 3500);
}

function buildStudentName(student) {
    return `${student.firstName} ${student.lastName || ""}`.trim();
}

function getSelectedStudent() {
    return state.students.find((student) => student._id === elements.studentFilter.value) || null;
}

function getSelectedStudentName() {
    const selectedStudent = getSelectedStudent();
    return selectedStudent ? buildStudentName(selectedStudent) : "No student selected";
}

function getVisibleResults() {
    const selectedStudentId = elements.studentFilter.value;
    const searchTerm = elements.searchInput.value.trim().toLowerCase();

    if (!selectedStudentId) {
        return [];
    }

    return state.results.filter((result) => {
        if (result.student?._id !== selectedStudentId) {
            return false;
        }

        const moduleText = `${result.module?.module_name || ""} ${result.module?.module_code || ""}`.toLowerCase();
        return moduleText.includes(searchTerm);
    });
}

function setModalState(isOpen) {
    elements.modal.classList.toggle("open", isOpen);
    elements.modal.setAttribute("aria-hidden", String(!isOpen));
}

function setSaveButtonState(isBusy, label) {
    state.isSubmitting = isBusy;
    elements.saveBtn.disabled = isBusy;
    elements.saveBtn.textContent = label;
}

function updateToolbarState() {
    const hasStudent = Boolean(elements.studentFilter.value);
    const hasSearch = Boolean(elements.searchInput.value.trim());

    elements.newResultBtn.disabled = !hasStudent;
    elements.clearSearchBtn.disabled = !hasSearch;
}

function resetForm() {
    elements.moduleSelect.value = state.modules[0]?._id || "";
    elements.caMarksInput.value = "";
    elements.gradeSelect.value = "";
    elements.caError.textContent = "";
}

function renderStudentOptions() {
    const previousValue = elements.studentFilter.value;
    const options = state.students.map((student) => `
        <option value="${escapeHtml(student._id)}">${escapeHtml(buildStudentName(student))}</option>
    `).join("");

    elements.studentFilter.innerHTML = `
        <option value="">Select a student</option>
        ${options}
    `;

    if (state.students.some((student) => student._id === previousValue)) {
        elements.studentFilter.value = previousValue;
    }
}

function renderModuleOptions(selectedModuleId = "") {
    if (!state.modules.length) {
        elements.moduleSelect.innerHTML = '<option value="">No modules available</option>';
        elements.moduleSelect.value = "";
        return;
    }

    const previousValue = elements.moduleSelect.value;
    const options = state.modules.map((module) => `
        <option value="${escapeHtml(module._id)}">${escapeHtml(module.module_name)} (${escapeHtml(module.module_code)})</option>
    `).join("");

    elements.moduleSelect.innerHTML = options;

    const preferredValue = selectedModuleId || previousValue;
    const moduleExists = state.modules.some((module) => module._id === preferredValue);

    elements.moduleSelect.value = moduleExists ? preferredValue : state.modules[0]._id;
}

function renderEmptyState(message, { showAddAction = false, showClearAction = false } = {}) {
    elements.resultsTable.innerHTML = `
        <tr>
            <td colspan="4" class="empty-state">
                <strong>${escapeHtml(message.title)}</strong>
                ${escapeHtml(message.body)}
                <div class="empty-actions">
                    ${showClearAction ? '<button class="btn-action" type="button" data-empty-action="clear-search">Clear search</button>' : ""}
                    ${showAddAction ? '<button class="btn-primary" type="button" data-empty-action="new-result">+ Add Result</button>' : ""}
                </div>
            </td>
        </tr>
    `;
}

function renderResultsRows(results) {
    elements.resultsTable.innerHTML = results.map((result) => `
        <tr>
            <td>
                <div class="stack">
                    <strong>${escapeHtml(result.module?.module_name || "Unknown module")}</strong>
                    <span class="field-help">${escapeHtml(result.module?.module_code || "")}</span>
                </div>
            </td>
            <td>${escapeHtml(result.caMarks)}</td>
            <td>${escapeHtml(result.grade)}</td>
            <td class="actions-cell">
                <div class="actions-group">
                    <button class="btn-action" type="button" data-action="edit" data-id="${escapeHtml(result._id)}">Edit</button>
                    <button class="btn-danger" type="button" data-action="delete" data-id="${escapeHtml(result._id)}" data-module="${escapeHtml(result.module?.module_name || "this module")}">Delete</button>
                </div>
            </td>
        </tr>
    `).join("");
}

function renderTable() {
    updateToolbarState();

    if (state.isLoadingResults) {
        elements.resultCount.textContent = "Loading...";
        elements.resultsTable.innerHTML = '<tr class="loading-row"><td colspan="4">Loading results...</td></tr>';
        return;
    }

    if (!elements.studentFilter.value) {
        elements.resultCount.textContent = "0 results";
        renderEmptyState(
            {
                body: "Choose a student from the filter above to view, edit, or add results.",
                title: "Select a student to get started"
            }
        );
        return;
    }

    const visibleResults = getVisibleResults();
    elements.resultCount.textContent = `${visibleResults.length} ${visibleResults.length === 1 ? "result" : "results"}`;

    if (!visibleResults.length) {
        renderEmptyState(
            {
                body: elements.searchInput.value.trim()
                    ? "Try a different search term or clear the filter."
                    : "No results have been recorded for this student yet.",
                title: "No results found"
            },
            {
                showAddAction: true,
                showClearAction: Boolean(elements.searchInput.value.trim())
            }
        );
        return;
    }

    renderResultsRows(visibleResults);
}

async function requestJson(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : null;

    if (!response.ok) {
        const error = new Error(payload?.message || "Request failed");
        error.details = payload?.details || [];
        throw error;
    }

    return payload;
}

async function loadStudents() {
    state.students = await requestJson("/students");
    renderStudentOptions();
}

async function loadModules({ forceRefresh = false, selectedModuleId = "" } = {}) {
    if (forceRefresh || state.modules.length === 0) {
        state.modules = await requestJson("/modules");
    }

    renderModuleOptions(selectedModuleId);
    return state.modules;
}

async function loadResults() {
    state.isLoadingResults = true;
    renderTable();

    try {
        state.results = await requestJson("/results");
    } catch (error) {
        state.results = [];
        showStatus(error.message || "Couldn't load results. Check that the API is available.", "error");
    } finally {
        state.isLoadingResults = false;
        renderTable();
    }
}

function ensureStudentSelected() {
    if (elements.studentFilter.value) {
        return true;
    }

    showStatus("Select a student before adding a result.", "error");
    elements.studentFilter.focus();
    return false;
}

async function openModal({ mode, result = null } = {}) {
    if (!ensureStudentSelected()) {
        return;
    }

    state.editingId = result?._id || null;
    elements.formTitle.textContent = mode === "edit" ? "Edit Result" : "Add Result";
    resetForm();
    setSaveButtonState(true, "Loading...");

    try {
        await loadModules({ selectedModuleId: result?.module?._id || "" });
    } catch {
        showStatus("Couldn't load modules. Check that the server is running.", "error");
        return;
    } finally {
        setSaveButtonState(false, "Save Result");
    }

    if (!state.modules.length) {
        showStatus("No modules available. Add modules before creating results.", "error");
        return;
    }

    if (result) {
        elements.caMarksInput.value = String(result.caMarks ?? "");
        elements.gradeSelect.value = result.grade || "";
    }

    state.lastFocusedElement = document.activeElement;
    elements.selectedStudentLabel.textContent = `${mode === "edit" ? "Editing" : "Adding"} result for ${getSelectedStudentName()}.`;
    setModalState(true);

    window.setTimeout(() => {
        elements.moduleSelect.focus();
    }, 0);
}

function closeModal() {
    setModalState(false);
    state.editingId = null;
    elements.formTitle.textContent = "Add Result";
    resetForm();

    if (state.lastFocusedElement instanceof HTMLElement) {
        state.lastFocusedElement.focus();
    }
}

function validateForm() {
    const caMarksValue = Number(elements.caMarksInput.value);

    if (!ensureStudentSelected()) {
        closeModal();
        return null;
    }

    if (!elements.moduleSelect.value) {
        showStatus("Select a module before saving.", "error");
        elements.moduleSelect.focus();
        return null;
    }

    if (
        elements.caMarksInput.value === "" ||
        Number.isNaN(caMarksValue) ||
        caMarksValue < 0 ||
        caMarksValue > 100
    ) {
        elements.caError.textContent = "Enter CA marks between 0 and 100.";
        elements.caMarksInput.focus();
        return null;
    }

    if (!elements.gradeSelect.value) {
        showStatus("Select a grade before saving.", "error");
        elements.gradeSelect.focus();
        return null;
    }

    elements.caError.textContent = "";

    return {
        caMarks: caMarksValue,
        grade: elements.gradeSelect.value,
        module: elements.moduleSelect.value,
        student: elements.studentFilter.value
    };
}

function applyValidationErrors(error) {
    const caMarksError = error.details.find((detail) => detail.field === "caMarks");

    if (caMarksError) {
        elements.caError.textContent = caMarksError.message;
        elements.caMarksInput.focus();
        return true;
    }

    return false;
}

async function saveResult() {
    const payload = validateForm();

    if (!payload) {
        return;
    }

    const isEditing = Boolean(state.editingId);
    const requestPath = isEditing ? `/results/${state.editingId}` : "/results";
    const requestMethod = isEditing ? "PUT" : "POST";

    setSaveButtonState(true, isEditing ? "Saving..." : "Creating...");

    try {
        await requestJson(requestPath, {
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" },
            method: requestMethod
        });

        closeModal();
        await loadResults();
        showStatus(isEditing ? "Result updated successfully." : "Result created successfully.");
    } catch (error) {
        const validationHandled = applyValidationErrors(error);

        if (!validationHandled) {
            showStatus(error.message || "Couldn't save the result. Try again.", "error");
        }
    } finally {
        setSaveButtonState(false, "Save Result");
    }
}

async function deleteResult(id, moduleName) {
    const confirmed = window.confirm(`Delete the result for ${moduleName}? This can't be undone.`);

    if (!confirmed) {
        return;
    }

    try {
        await requestJson(`/results/${id}`, { method: "DELETE" });
        await loadResults();
        showStatus("Result deleted successfully.");
    } catch (error) {
        showStatus(error.message || "Couldn't delete the result. Try again.", "error");
    }
}

async function handleTableAction(target) {
    const emptyAction = target.closest("[data-empty-action]");

    if (emptyAction?.dataset.emptyAction === "clear-search") {
        elements.searchInput.value = "";
        renderTable();
        elements.searchInput.focus();
        return;
    }

    if (emptyAction?.dataset.emptyAction === "new-result") {
        await openModal({ mode: "create" });
        return;
    }

    const actionButton = target.closest("[data-action]");

    if (!actionButton) {
        return;
    }

    const result = state.results.find((item) => item._id === actionButton.dataset.id);

    if (!result) {
        showStatus("The selected result could not be found.", "error");
        return;
    }

    if (actionButton.dataset.action === "edit") {
        await openModal({ mode: "edit", result });
        return;
    }

    if (actionButton.dataset.action === "delete") {
        await deleteResult(result._id, actionButton.dataset.module || "this module");
    }
}

async function initializeApp() {
    renderTable();

    try {
        await Promise.all([loadStudents(), loadModules(), loadResults()]);
    } catch {
        showStatus("Couldn't finish loading the dashboard. Check that the server is running.", "error");
    } finally {
        updateToolbarState();
        renderTable();
    }
}

elements.studentFilter.addEventListener("change", () => {
    updateToolbarState();
    renderTable();
});

elements.searchInput.addEventListener("input", () => {
    updateToolbarState();
    renderTable();
});

elements.newResultBtn.addEventListener("click", async () => {
    await openModal({ mode: "create" });
});

elements.cancelBtn.addEventListener("click", closeModal);
elements.saveBtn.addEventListener("click", saveResult);

elements.clearSearchBtn.addEventListener("click", () => {
    elements.searchInput.value = "";
    renderTable();
    elements.searchInput.focus();
});

elements.caMarksInput.addEventListener("input", () => {
    if (elements.caError.textContent) {
        elements.caError.textContent = "";
    }
});

elements.modal.addEventListener("click", (event) => {
    if (event.target === elements.modal) {
        closeModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.modal.classList.contains("open")) {
        closeModal();
    }
});

elements.resultsTable.addEventListener("click", async (event) => {
    await handleTableAction(event.target);
});

void initializeApp();
