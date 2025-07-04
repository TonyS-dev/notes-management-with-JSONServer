// ========================================
// TASKS FOR JSON SERVER
// ========================================

/* 
1. Environment Setup
✅ Install JSON Server globally on your system
✅ Verify that Node.js is installed
✅ Create the folder structure for the server
✅ Configure JSON Server
✅ Create the data file
✅ Adapt CRUD functions to be Server First
✅ Implement robust error handling
✅ Testing and complete validation
*/


// ========================================
// INITIAL CONFIGURATION AND DATA
// ========================================

const API_URL = "http://localhost:3000/notes";

let notesDatabase = [];
let activeNotes = [];

const uniqueCategories = new Set();
const notesMetadata = new Map();

async function getData() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) { 
            throw new Error(`HTTP error! status: ${response.status}`);
        } 

        notesDatabase = await response.json();
        return notesDatabase;
    } catch (error) {
        console.error("❌ Error fetching data:", error);
        return [];
    }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Load all existing categories from database into the set
 */
async function loadExistingCategories() {
    await getData();
    uniqueCategories.clear();
    
    notesDatabase.forEach(note => {
        if (note.categories && Array.isArray(note.categories)) {
            note.categories.forEach(cat => uniqueCategories.add(cat));
        }
    });
}

/**
 * Find the next available ID
 * @returns {string} The next available ID as string
 */
async function getNextAvailableId() {
    await getData();
    
    if (notesDatabase.length === 0) {
        return "1";
    }
    
    const existingIds = notesDatabase
        .map(note => parseInt(String(note.id), 10))
        .sort((a, b) => a - b);
    
    // Find the first "gap" in the sequence
    for (let i = 1; i <= existingIds.length + 1; i++) {
        if (!existingIds.includes(i)) {
            return String(i);
        }
    }
    
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    return String(nextId);
}

/**
 * Find a note by its ID in the database
 * @param {number|string} id - The ID of the note to find
 * @returns {Object|null} Object of note, or null if not found
 */
async function findNoteById(id) {
    await getData();
    const stringId = String(id);
    const note = notesDatabase.find((note) => String(note.id) === stringId);
    return note ? { note, index: notesDatabase.indexOf(note) } : null;
}

/**
 * Make an HTTP request to the server
 * @param {string} method - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param {string} url - The URL to send the request to
 * @param {Object|null} body - The request body (for POST/PUT/PATCH)
 * @returns {Promise<Object>} The response data as JSON
 * @throws {Error} If the request fails or response is not ok
 */
async function httpRequest(method, url, body = null) {
    try {
        const options = {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : null,
        };

        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("❌ HTTP request error:", error);
        throw error;
    }
}

// ========================================
// CRUD FUNCTIONS - Server First Approach and httpRequest
// ========================================

/**
 * Create a new note and add it to the database
 * @param {string} title - The title of the note
 * @param {string} content - The content/body of the note
 * @param {Array|string} categories - Categories for the note (array or single string)
 * @param {boolean} [showMessage=true] - Whether to show success message
 */
async function createNote(title, content, categories, showMessage = true) {
    try {
        await loadExistingCategories();
        const newId = await getNextAvailableId();

        const processedCategories = Array.isArray(categories)
            ? categories
            : [categories || "General"];
        
        processedCategories.forEach((cat) => uniqueCategories.add(cat));

        const noteTemplate = {
            id: newId,
            title,
            content,
            categories: processedCategories,
            date: new Date().toISOString().split("T")[0],
            isActive: true,
        };

        // SERVER FIRST: POST to server
        const createdNote = await httpRequest("POST", API_URL, noteTemplate);
        
        // SUCCESS: Update local data
        notesMetadata.set(newId, {
            wordCount: content.split(" ").length,
            status: "Active",
        });

        notesDatabase.push(createdNote);
        renderNotes();
        
        if (showMessage) {
            showSuccessMessage(`Note "${title}" has been created`, "create");
        }

        return createdNote;

    } catch (error) {
        console.error("❌ Error creating note:", error);
        showSuccessMessage(`Failed to create note. Please try again.`, "error");
        return null;
    }
}

/**
 * Get all active (non-archived) notes from the database
 * @returns {Array} Array of active note objects
 */
async function getActiveNotes() {
    try {
        await getData();
        activeNotes = notesDatabase.filter((note) => note.isActive);
        return activeNotes;
    } catch (error) {
        console.error("❌ Error fetching active notes:", error);
        return [];
    }
}

/**
 * Archive a note (soft delete - sets isActive to false)
 * @param {number|string} id - The ID of the note to archive
 * @returns {boolean} True if archived successfully, false if note not found
 */
async function archiveNote(id) {
    try {
        const stringId = String(id);
        const found = await findNoteById(stringId);
        if (!found) {
            return false;
        }

        // SERVER FIRST: PATCH to server
        await httpRequest("PATCH", `${API_URL}/${stringId}`, { isActive: false });
        
        // SUCCESS: Update local data
        found.note.isActive = false;
        notesMetadata.set(stringId, {
            ...notesMetadata.get(stringId),
            status: "Archived",
        });

        showSuccessMessage(`"${found.note.title}" has been archived`, "archive");
        renderNotes();
        
        return true;

    } catch (error) {
        console.error(`❌ Failed to archive note ${id}:`, error);
        showSuccessMessage(`Failed to archive note. Please try again.`, "error");
        return false;
    }
}

/**
 * Update an existing note's information
 * @param {number|string} id - The ID of the note to update
 * @param {string} title - New title for the note
 * @param {string} content - New content for the note
 * @param {Array|string} categories - New categories for the note
 * @returns {boolean} True if updated successfully, false if note not found
 */
async function updateNote(id, title, content, categories) {
    try {
        await loadExistingCategories();
        
        const stringId = String(id);
        const found = await findNoteById(stringId);
        if (!found) {
            return false;
        }

        const processedCategories = Array.isArray(categories)
            ? categories
            : [categories || "General"];

        processedCategories.forEach((cat) => uniqueCategories.add(cat));

        const updatedNote = {
            ...found.note,
            title,
            content,
            categories: processedCategories,
            date: new Date().toISOString().split("T")[0],
        };

        // SERVER FIRST: PUT to server
        await httpRequest("PUT", `${API_URL}/${stringId}`, updatedNote);
        
        // SUCCESS: Update local data
        Object.assign(found.note, updatedNote);
        
        notesMetadata.set(stringId, {
            wordCount: content.split(" ").length,
            status: found.note.isActive ? "Active" : "Archived",
        });

        showSuccessMessage(`"${title}" has been updated`, "edit");
        return true;

    } catch (error) {
        console.error(`❌ Failed to update note ${id}:`, error);
        showSuccessMessage(`Failed to update note. Please try again.`, "error");
        return false;
    }
}

/**
 * Permanently delete a note from the database
 * @param {number|string} noteId - The ID of the note to delete permanently
 * @returns {boolean} True if deleted successfully, false if note not found
 */
async function deleteNotePermanently(noteId) {
    try {
        const stringId = String(noteId);
        const found = await findNoteById(stringId);
        if (!found) {
            return false;
        }

        const noteTitle = found.note.title;

        // SERVER FIRST: DELETE from server
        await httpRequest("DELETE", `${API_URL}/${stringId}`);
        
        // SUCCESS: Update local data
        notesDatabase.splice(found.index, 1);
        notesMetadata.delete(stringId);

        renderNotes();
        hideConfirmModal();
        showSuccessMessage(`"${noteTitle}" has been deleted permanently`, "delete");

        return true;

    } catch (error) {
        console.error(`❌ Failed to delete note ${noteId}:`, error);
        showSuccessMessage(`Failed to delete note. Please try again.`, "error");
        return false;
    }
}

/**
 * Create a duplicate copy of an existing note
 * @param {number|string} noteId - The ID of the note to duplicate
 */
async function duplicateNote(noteId) {
    try {
        const stringId = String(noteId);
        const found = await findNoteById(stringId);
        if (!found) return;

        const original = found.note;
        await createNote(
            `${original.title} (Copy)`,
            original.content,
            [...original.categories],
            false
        );
        
        renderNotes();
        hideAllDropdowns();
        showSuccessMessage(`"${original.title}" has been duplicated`, "duplicate");

    } catch (error) {
        console.error(`❌ Failed to duplicate note ${noteId}:`, error);
        showSuccessMessage(`Failed to duplicate note. Please try again.`, "error");
    }
}

/**
 * Search for notes by title or content
 * @param {string} searchTerm - The term to search for
 * @returns {Array} Array of notes matching the search term
 */
async function searchNotes(searchTerm) {
    try {
        await getData();
        return notesDatabase.filter(
            (note) =>
                note.isActive &&
                (note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 note.content.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    } catch (error) {
        console.error("❌ Error searching notes:", error);
        return [];
    }
}

/**
 * Filter notes by a specific category
 * @param {string} category - The category to filter by
 * @returns {Array} Array of notes in the specified category
 */
async function filterByCategory(category) {
    try {
        await getData();
        return notesDatabase.filter(
            (note) => note.isActive && note.categories.includes(category)
        );
    } catch (error) {
        console.error("❌ Error filtering notes:", error);
        return [];
    }
}

/**
 * Open the edit modal for a specific note
 * @param {number|string} noteId - The ID of the note to edit
 */
async function editNote(noteId) {
    try {
        const stringId = String(noteId);
        const found = await findNoteById(stringId);
        if (found) {
            showNoteModal(found.note);
        }
    } catch (error) {
        console.error(`❌ Failed to edit note ${noteId}:`, error);
        showSuccessMessage(`Failed to load note for editing.`, "error");
    }
}

// ========================================
// MODAL FUNCTIONS
// ========================================

let selectedCategories = [];
let editingNoteId = null;

/**
 * Show the note creation/editing modal
 * @param {Object|null} [note=null] - Note object to edit, or null for creating new note
 */
function showNoteModal(note = null) {
    const modal = document.getElementById("noteModal");
    const form = document.getElementById("noteForm");

    form.reset();
    selectedCategories = [];

    if (note) {
        // Edit mode
        editingNoteId = String(note.id);
        document.getElementById("modalTitle").textContent = "Edit Note";
        document.getElementById("noteTitle").value = note.title;
        document.getElementById("noteContent").value = note.content;
        selectedCategories = [...note.categories];
        document.getElementById("saveBtn").textContent = "Update Note";
    } else {
        // Create mode
        editingNoteId = null;
        document.getElementById("modalTitle").textContent = "Create New Note";
        document.getElementById("saveBtn").textContent = "Save Note";
    }

    updateSelectedCategories();
    updateAvailableCategories();
    modal.classList.add("active");
    document.getElementById("noteTitle").focus();
}

/**
 * Hide the note creation/editing modal
 */
function hideNoteModal() {
    document.getElementById("noteModal").classList.remove("active");
    selectedCategories = [];
    editingNoteId = null;
}

/**
 * Add a new category to the selected categories list
 */
function addCategory() {
    const input = document.getElementById("noteCategory");
    const value = input.value.trim();

    if (value && !selectedCategories.includes(value)) {
        selectedCategories.push(value);
        input.value = "";
        updateSelectedCategories();
        updateAvailableCategories();
    }
}

/**
 * Remove a category from the selected categories list
 * @param {string} category - The category to remove
 */
function removeCategory(category) {
    selectedCategories = selectedCategories.filter((cat) => cat !== category);
    updateSelectedCategories();
    updateAvailableCategories();
}

/**
 * Update the visual display of selected categories in the modal
 */
function updateSelectedCategories() {
    const container = document.getElementById("selectedCategories");
    if (!container) return;

    container.innerHTML = selectedCategories
        .map(
            (cat) =>
                `<div class="category-tag">
            ${cat}
            <button type="button" class="remove-category" onclick="removeCategory('${cat}')">×</button>
        </div>`
        )
        .join("");
}

/**
 * Update the display of available categories that can be selected
 */
function updateAvailableCategories() {
    const container = document.getElementById("availableCategories");
    if (!container) return;

    container.innerHTML = "";

    const availableCategories = Array.from(uniqueCategories).filter(
        (cat) => !selectedCategories.includes(cat)
    );

    if (availableCategories.length === 0) {
        container.innerHTML =
            '<p class="no-categories">All categories are already selected</p>';
        return;
    }

    availableCategories.forEach((category) => {
        const categoryButton = document.createElement("button");
        categoryButton.type = "button";
        categoryButton.className = "available-category-btn";
        categoryButton.textContent = category;
        categoryButton.onclick = () => selectAvailableCategory(category);
        container.appendChild(categoryButton);
    });
}

/**
 * Select a category from the available categories list
 * @param {string} category - The category to select
 */
function selectAvailableCategory(category) {
    if (!selectedCategories.includes(category)) {
        selectedCategories.push(category);
        updateSelectedCategories();
        updateAvailableCategories();
    }
}

/**
 * Handle the form submission for creating or updating a note
 * @param {Event} e - The form submit event
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    const title = document.getElementById("noteTitle").value.trim();
    const content = document.getElementById("noteContent").value.trim();

    if (!title || !content) {
        alert("Please fill in all required fields");
        return;
    }

    const categories =
        selectedCategories.length > 0 ? selectedCategories : ["General"];

    try {
        if (editingNoteId) {
            await updateNote(editingNoteId, title, content, categories);
        } else {
            await createNote(title, content, categories);
        }

        hideNoteModal();
        renderNotes();
    } catch (error) {
        console.error("❌ Error submitting form:", error);
        showSuccessMessage("Failed to save note. Please try again.", "error");
    }
}

// ========================================
// DOM MANIPULATION - WITH STRING IDs
// ========================================

/**
 * Render all active notes to the DOM
 */
async function renderNotes() {
    await getActiveNotes();
    const notesList = document.querySelector(".notes-list");
    if (!notesList) return;

    notesList.innerHTML = "";
    activeNotes.forEach((note) => {
        notesList.appendChild(createNoteElement(note));
    });
}

/**
 * Create a DOM element for a single note
 * @param {Object} note - The note object to create an element for
 * @returns {HTMLElement} The created note element
 */
function createNoteElement(note) {
    const noteDiv = document.createElement("div");
    noteDiv.className = "note-item";
    noteDiv.dataset.noteId = note.id;

    const metadata = notesMetadata.get(String(note.id)) || {
        wordCount: note.content.split(" ").length,
        status: "Active",
    };
    const readingTime = Math.ceil(metadata.wordCount / 200);

    noteDiv.innerHTML = `
        <div class="note-header">
            <p class="date">${new Date(note.date).toLocaleDateString()}</p>
            <div class="note-actions">
                <button class="note-action-btn" onclick="editNote('${note.id}')" title="Edit">✏️</button>
                <button class="note-action-btn" onclick="toggleNoteMenu(event, '${note.id}')" title="More">⋯</button>
                <div class="note-dropdown" id="dropdown-${note.id}">
                    <button class="dropdown-item" onclick="editNote('${note.id}')">✏️ Edit</button>
                    <button class="dropdown-item" onclick="duplicateNote('${note.id}')">📋 Duplicate</button>
                    <button class="dropdown-item" onclick="archiveNote('${note.id}'); renderNotes(); hideAllDropdowns()">📁 Archive</button>
                    <button class="dropdown-item danger" onclick="confirmDeleteNote('${note.id}')">🗑️ Delete</button>
                </div>
            </div>
        </div>
        <h3 class="note-title">${note.title}</h3>
        <div class="note-metadata-preview">
            <div class="note-stats-compact">
                <span>📊 ${metadata.wordCount} words</span>
                <span>⏱️ ${readingTime} min</span>
                <span class="status-badge ${metadata.status.toLowerCase()}">${metadata.status}</span>
            </div>
        </div>
        <p class="note-content">${note.content}</p>
        <div class="categories">
            ${note.categories
                .map((cat) => `<div class="note-category">${cat}</div>`)
                .join("")}
        </div>

        <div class="note-expanded-content">
            <div class="note-metadata">
                <div class="note-stats">
                    <div class="stat-item">
                        <span>📊</span>
                        <span>${metadata.wordCount} words</span>
                    </div>
                    <div class="stat-item">
                        <span>🔤</span>
                        <span>${note.content.length} characters</span>
                    </div>
                    <div class="stat-item">
                        <span>⏱️</span>
                        <span>${readingTime} min read</span>
                    </div>
                </div>
                <div class="note-status">
                    <span class="status-badge ${metadata.status.toLowerCase()}">${metadata.status}</span>
                </div>
            </div>
        </div>

        <div class="expand-indicator">
            ↓
        </div>
    `;

    noteDiv.addEventListener("click", (e) => {
        if (!e.target.closest(".note-actions")) {
            toggleNoteExpansion(note.id);
        }
    });

    return noteDiv;
}

/**
 * Toggle the expansion state of a note (show/hide detailed view)
 * @param {number|string} noteId - The ID of the note to toggle
 */
function toggleNoteExpansion(noteId) {
    const stringId = String(noteId);
    const noteElement = document.querySelector(`[data-note-id="${stringId}"]`);
    if (!noteElement) return;

    // Close other expanded notes
    document.querySelectorAll(".note-item.expanded").forEach((note) => {
        if (note.dataset.noteId !== stringId) {
            note.classList.remove("expanded");
            const otherIndicator = note.querySelector(".expand-indicator");
            if (otherIndicator) {
                otherIndicator.style.transform = "rotate(0deg)";
                otherIndicator.style.transition = "transform 0.3s ease";
            }
        }
    });

    // Toggle current note
    const isExpanding = !noteElement.classList.contains("expanded");
    noteElement.classList.toggle("expanded");

    // Rotate indicator
    const expandIndicator = noteElement.querySelector(".expand-indicator");
    if (expandIndicator) {
        if (isExpanding) {
            expandIndicator.style.transform = "rotate(180deg)";
            expandIndicator.style.transition = "transform 0.3s ease";
        } else {
            expandIndicator.style.transform = "rotate(0deg)";
            expandIndicator.style.transition = "transform 0.3s ease";
        }
    }

    // Smooth scroll if expanding
    if (isExpanding) {
        setTimeout(() => {
            noteElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }, 150);
    }
}

/**
 * Toggle the dropdown menu for a specific note
 * @param {Event} event - The click event
 * @param {number|string} noteId - The ID of the note whose menu to toggle
 */
function toggleNoteMenu(event, noteId) {
    event.stopPropagation();
    hideAllDropdowns();
    const stringId = String(noteId);
    document.getElementById(`dropdown-${stringId}`).classList.toggle("active");
}

/**
 * Hide all dropdown menus
 */
function hideAllDropdowns() {
    document.querySelectorAll(".note-dropdown").forEach((dropdown) => {
        dropdown.classList.remove("active");
    });
}

/**
 * Show the delete confirmation modal for a specific note
 * @param {number|string} noteId - The ID of the note to confirm deletion for
 */
async function confirmDeleteNote(noteId) {
    try {
        const stringId = String(noteId);
        const found = await findNoteById(stringId);
        if (!found) return;

        hideAllDropdowns();

        document.getElementById("previewTitle").textContent = found.note.title;
        document.getElementById("previewContent").textContent =
            found.note.content.substring(0, 200) + "...";
        document.getElementById("previewCategories").innerHTML =
            found.note.categories
                .map((cat) => `<span class="category-tag">${cat}</span>`)
                .join("");

        document
            .getElementById("confirmDeleteBtn")
            .setAttribute("data-note-id", stringId);
        document.getElementById("confirmModal").classList.add("active");
    } catch (error) {
        console.error(`❌ Error loading note for deletion ${noteId}:`, error);
        showSuccessMessage("Failed to load note for deletion.", "error");
    }
}

/**
 * Hide the delete confirmation modal
 */
function hideConfirmModal() {
    document.getElementById("confirmModal").classList.remove("active");
}

/**
 * Collapse all expanded notes back to their normal state
 */
function collapseAllNotes() {
    document.querySelectorAll(".note-item.expanded").forEach((note) => {
        note.classList.remove("expanded");
        const indicator = note.querySelector(".expand-indicator");
        if (indicator) {
            indicator.style.transform = "rotate(0deg)";
            indicator.style.transition = "transform 0.3s ease";
        }
    });
}

/**
 * Show a success message with optional type-specific styling
 * @param {string} message - The message to display
 * @param {string} [type='success'] - The type of message (create, edit, duplicate, delete, archive, error)
 */
function showSuccessMessage(message, type = "success") {
    const successDiv = document.createElement("div");
    successDiv.className = "success-message";

    const icons = {
        create: "✅",
        edit: "✏️",
        duplicate: "📋",
        delete: "🗑️",
        archive: "📁",
        error: "❌",
    };

    const messageClass = type === "error" ? "error" : type;
    successDiv.innerHTML = `<div class="success-content ${messageClass}">${
        icons[type] || "✅"
    } ${message}</div>`;

    // Handle message stacking
    const existingMessages = document.querySelectorAll(".success-message");
    if (existingMessages.length > 0) {
        successDiv.style.top = `${20 + existingMessages.length * 60}px`;
    }

    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
        // Reposition remaining messages
        const remainingMessages = document.querySelectorAll(".success-message");
        remainingMessages.forEach((message, index) => {
            message.style.top = `${20 + index * 60}px`;
        });
    }, 3000);
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await getData();
        await loadExistingCategories();
        console.log("📝 Notes App initialized with Server First approach");

        // Basic events
        document
            .querySelector(".new-note")
            ?.addEventListener("click", () => showNoteModal());
        document
            .getElementById("noteForm")
            ?.addEventListener("submit", handleFormSubmit);
        document
            .getElementById("addCategoryBtn")
            ?.addEventListener("click", addCategory);
        document
            .getElementById("confirmDeleteBtn")
            ?.addEventListener("click", async () => {
                const noteId = document
                    .getElementById("confirmDeleteBtn")
                    .getAttribute("data-note-id");
                await deleteNotePermanently(noteId);
            });

        // Modal close events
        ["closeModal", "cancelBtn"].forEach((id) => {
            document.getElementById(id)?.addEventListener("click", hideNoteModal);
        });

        ["closeConfirmModal", "cancelDeleteBtn"].forEach((id) => {
            document
                .getElementById(id)
                ?.addEventListener("click", hideConfirmModal);
        });

        // Close modals on overlay click
        const modalOverlay = document.getElementById("noteModal");
        const confirmModalOverlay = document.getElementById("confirmModal");

        if (modalOverlay) {
            modalOverlay.addEventListener("click", (e) => {
                if (e.target === modalOverlay) hideNoteModal();
            });
        }

        if (confirmModalOverlay) {
            confirmModalOverlay.addEventListener("click", (e) => {
                if (e.target === confirmModalOverlay) hideConfirmModal();
            });
        }

        // Category input enter key
        document
            .getElementById("noteCategory")
            ?.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    addCategory();
                }
            });

        // Navigation buttons
        document.querySelectorAll(".nav-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                document
                    .querySelectorAll(".nav-btn")
                    .forEach((btn) => btn.classList.remove("active"));
                e.target.classList.add("active");
            });
        });

        // Global click handler
        document.addEventListener("click", (e) => {
            if (
                !e.target.closest(".note-item") &&
                !e.target.closest(".note-actions")
            ) {
                hideAllDropdowns();
                collapseAllNotes();
            }
        });

        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                hideAllDropdowns();
                hideConfirmModal();
                collapseAllNotes();
            }
        });

        renderNotes();
    } catch (error) {
        console.error("❌ Failed to initialize app:", error);
        showSuccessMessage("Failed to load application. Please refresh.", "error");
    }
});