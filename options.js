let ttTemplates = {};

function ttGenerateTemplateId() {
    return `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function ttCreateNewTemplate() {
    return {
        id: ttGenerateTemplateId(),
        title: "New Template",
        mainText: "",
        options: [
            { name: "Option 1", text: "" },
            { name: "Option 2", text: "" },
            { name: "Option 3", text: "" },
            { name: "Option 4", text: "" },
            { name: "Option 5", text: "" },
            { name: "Option 6", text: "" },
            { name: "Option 7", text: "" },
            { name: "Option 8", text: "" },
            { name: "Option 9", text: "" },
            { name: "Option 10", text: "" }
        ]
    };
}

function ttRenderTemplateCard(tplId, template) {
    const card = document.createElement("div");
    card.className = "template-card";
    card.id = `card-${tplId}`;

    // Header with title and delete button
    const header = document.createElement("div");
    header.className = "card-header";

    const titleDisplay = document.createElement("div");
    titleDisplay.className = "card-title";
    titleDisplay.textContent = template.title || "Unnamed Template";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn-delete";
    deleteBtn.textContent = "🗑️ Delete";
    deleteBtn.addEventListener("click", () => {
        if (confirm(`Delete template "${template.title}"?`)) {
            ttDeleteTemplate(tplId);
        }
    });

    header.appendChild(titleDisplay);
    header.appendChild(deleteBtn);

    // Title input
    const titleGroup = document.createElement("div");
    titleGroup.className = "form-group";

    const titleLabel = document.createElement("label");
    titleLabel.textContent = "Title:";
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.className = "template-title-input";
    titleInput.value = template.title;
    titleInput.placeholder = "Template title (shown in right-click menu)";

    titleGroup.appendChild(titleLabel);
    titleGroup.appendChild(titleInput);

    // Main text area
    const mainGroup = document.createElement("div");
    mainGroup.className = "form-group";

    const mainLabel = document.createElement("label");
    mainLabel.textContent = "Main Template Text:";
    const mainTextArea = document.createElement("textarea");
    mainTextArea.className = "template-maintext-input";
    mainTextArea.placeholder = "Enter the main template text that will be inserted when clicking the main menu item";
    mainTextArea.value = template.mainText;

    mainGroup.appendChild(mainLabel);
    mainGroup.appendChild(mainTextArea);

    // Optional lines - dynamic container
    const optionsGroup = document.createElement("div");
    optionsGroup.className = "form-group";

    const optionsLabel = document.createElement("label");
    optionsLabel.textContent = "Optional Lines (Sub-Templates):";
    optionsLabel.style.display = "block";
    optionsLabel.style.marginBottom = "10px";

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "options-container";
    optionsContainer.id = `options-container-${tplId}`;

    const optInputs = [];
    let displayedCount = 0;

    // Helper function to render option item
    const createOptionItem = (index) => {
        const optItem = document.createElement("div");
        optItem.className = "option-item";
        optItem.id = `option-item-${index}`;
        optItem.style.display = "flex";
        optItem.style.flexDirection = "column";
        optItem.style.position = "relative";

        const optLabelContainer = document.createElement("div");
        optLabelContainer.style.display = "flex";
        optLabelContainer.style.justifyContent = "space-between";
        optLabelContainer.style.alignItems = "center";
        optLabelContainer.style.marginBottom = "5px";

        const optLabel = document.createElement("label");
        optLabel.textContent = `Option Name:`;
        optLabel.style.fontWeight = "bold";
        optLabel.style.fontSize = "12px";

        const deleteOptBtn = document.createElement("button");
        deleteOptBtn.type = "button";
        deleteOptBtn.textContent = "✕";
        deleteOptBtn.style.background = "#ff6b6b";
        deleteOptBtn.style.color = "white";
        deleteOptBtn.style.border = "none";
        deleteOptBtn.style.borderRadius = "3px";
        deleteOptBtn.style.padding = "2px 6px";
        deleteOptBtn.style.cursor = "pointer";
        deleteOptBtn.style.fontSize = "12px";

        deleteOptBtn.addEventListener("click", (e) => {
            e.preventDefault();
            optItem.style.display = "none";
            optNameInput.value = "";
            optTextArea.value = "";
            displayedCount--;
            updateAddButton();
        });

        optLabelContainer.appendChild(optLabel);
        optLabelContainer.appendChild(deleteOptBtn);

        const optNameInput = document.createElement("input");
        optNameInput.type = "text";
        optNameInput.className = `template-option-name-${index}`;
        optNameInput.placeholder = `Option ${index + 1}`;
        optNameInput.value = template.options[index]?.name || `Option ${index + 1}`;
        optNameInput.style.width = "100%";
        optNameInput.style.padding = "5px";
        optNameInput.style.boxSizing = "border-box";
        optNameInput.style.marginBottom = "5px";
        optNameInput.style.borderRadius = "10px";
        optNameInput.style.border = "1px solid rgba(0,0,0,0.06)";
        optNameInput.style.background = "#fbfbfc";
        optNameInput.style.fontSize = "14px";

        const optTextArea = document.createElement("textarea");
        optTextArea.className = `template-option-input-${index}`;
        optTextArea.placeholder = `Optional template ${index + 1}`;
        optTextArea.value = template.options[index]?.text || "";
        optTextArea.rows = 2;
        optTextArea.style.width = "100%";
        optTextArea.style.padding = "5px";
        optTextArea.style.boxSizing = "border-box";
        optTextArea.style.marginBottom = "8px";

        optInputs[index] = { nameInput: optNameInput, textArea: optTextArea };

        optItem.appendChild(optLabelContainer);
        optItem.appendChild(optNameInput);
        optItem.appendChild(optTextArea);

        return { item: optItem, nameInput: optNameInput, textArea: optTextArea };
    };

    // Display initially 3 options
    for (let i = 0; i < 3; i++) {
        const { item } = createOptionItem(i);
        optionsContainer.appendChild(item);
        displayedCount++;
    }

    // Add option button
    const addOptBtn = document.createElement("button");
    addOptBtn.type = "button";
    addOptBtn.textContent = "+ Add Option";
    addOptBtn.id = `add-opt-btn-${tplId}`;
    addOptBtn.style.background = "#4CAF50";
    addOptBtn.style.color = "white";
    addOptBtn.style.border = "none";
    addOptBtn.style.borderRadius = "4px";
    addOptBtn.style.padding = "6px 12px";
    addOptBtn.style.cursor = "pointer";
    addOptBtn.style.fontSize = "12px";
    addOptBtn.style.marginBottom = "10px";

    const updateAddButton = () => {
        if (displayedCount >= 10) {
            addOptBtn.disabled = true;
            addOptBtn.style.background = "#cccccc";
            addOptBtn.style.cursor = "not-allowed";
        } else {
            addOptBtn.disabled = false;
            addOptBtn.style.background = "#4CAF50";
            addOptBtn.style.cursor = "pointer";
        }
    };

    addOptBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (displayedCount < 10) {
            const { item } = createOptionItem(displayedCount);
            optionsContainer.appendChild(item);
            displayedCount++;
            updateAddButton();
        }
    });

    updateAddButton();

    optionsGroup.appendChild(optionsLabel);
    optionsGroup.appendChild(addOptBtn);
    optionsGroup.appendChild(optionsContainer);

    // Save button
    const actions = document.createElement("div");
    actions.className = "card-actions";

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "btn-save";
    saveBtn.textContent = "💾 Save Template";

    const successMsg = document.createElement("div");
    successMsg.className = "success-message";
    successMsg.textContent = "✓ Saved successfully!";

    saveBtn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Save button clicked for template:", tplId);
        
        // Get updated values
        const updatedTemplate = {
            id: template.id,
            title: titleInput.value || "Unnamed Template",
            mainText: mainTextArea.value,
            options: []
        };

        // Collect all option values (handle sparse array)
        for (let i = 0; i < 10; i++) {
            updatedTemplate.options[i] = {
                name: (optInputs[i] && optInputs[i].nameInput && optInputs[i].nameInput.value) ? optInputs[i].nameInput.value : `Option ${i + 1}`,
                text: (optInputs[i] && optInputs[i].textArea && optInputs[i].textArea.value) ? optInputs[i].textArea.value : ""
            };
        }

        console.log("Saving template data:", updatedTemplate);
        
        // Save to storage
        const storageObj = {};
        storageObj[tplId] = JSON.stringify(updatedTemplate);

        browser.storage.local.set(storageObj).then(() => {
            console.log("Template saved successfully!");
            // Update in-memory copy
            ttTemplates[tplId] = updatedTemplate;
            
            // Show success message
            successMsg.classList.add("show");
            setTimeout(() => {
                successMsg.classList.remove("show");
            }, 2000);
        }).catch(error => {
            console.error("Error saving template:", error);
            alert("Error saving template: " + error.message);
        });
    });

    actions.appendChild(saveBtn);
    actions.appendChild(successMsg);

    // Assemble card
    card.appendChild(header);
    card.appendChild(titleGroup);
    card.appendChild(mainGroup);
    card.appendChild(optionsGroup);
    card.appendChild(actions);

    return card;
}

function ttRenderAllTemplates() {
    const container = document.getElementById("templatesContainer");
    if (!container) {
        console.error("Container element not found!");
        return;
    }

    console.log("Rendering templates. Count:", Object.keys(ttTemplates).length);

    if (Object.keys(ttTemplates).length === 0) {
        container.innerHTML = '<div class="empty-state">No templates yet. Click "Add Template" to get started!</div>';
        return;
    }

    container.innerHTML = "";

    for (let tplId in ttTemplates) {
        const card = ttRenderTemplateCard(tplId, ttTemplates[tplId]);
        container.appendChild(card);
    }
}

function ttLoadTemplates() {
    console.log("ttLoadTemplates() called");
    
    return browser.storage.local.get().then(results => {
        console.log("Raw storage results:", results);
        
        // Fix for FF < 52
        if (Array.isArray(results)) {
            results = results[0] || {};
        }

        ttTemplates = {};
        for (let key in results) {
            if (key !== "useLightIcon" && key !== "lightIconEnabled") {
                try {
                    const template = JSON.parse(results[key]);
                    if (template && template.id && template.title !== undefined) {
                        ttTemplates[template.id] = template;
                        console.log("Loaded template:", template.id, template.title);
                    }
                } catch (e) {
                    console.error("Failed to parse template:", key, e);
                }
            }
        }
        
        console.log("Templates loaded:", Object.keys(ttTemplates).length);
        ttRenderAllTemplates();
        
        return ttTemplates;
    }).catch(error => {
        console.error("Error loading templates:", error);
    });
}

function loadSettings() {
    browser.storage.local.get().then(results => {
        if (Array.isArray(results)) {
            results = results[0] || {};
        }

        const useLightIconCheckbox = document.getElementById("useLightIcon");
        if (useLightIconCheckbox) {
            useLightIconCheckbox.checked = results.useLightIcon === "on";
        }
    });
}

function ttSetupEventListeners() {
    // Add Template button
    const addBtn = document.getElementById("btnAddTemplate");
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            console.log("Add template button clicked");
            const newTemplate = ttCreateNewTemplate();
            ttTemplates[newTemplate.id] = newTemplate;
            
            const storageObj = {};
            storageObj[newTemplate.id] = JSON.stringify(newTemplate);
            
            browser.storage.local.set(storageObj).then(() => {
                console.log("New template created:", newTemplate.id);
                ttRenderAllTemplates();
            });
        });
    }

    // Light icon checkbox
    const useLightIconCheckbox = document.getElementById("useLightIcon");
    if (useLightIconCheckbox) {
        useLightIconCheckbox.addEventListener("change", (e) => {
            const storageObj = { useLightIcon: e.target.checked ? "on" : "off" };
            browser.storage.local.set(storageObj);
        });
    }
}

function ttDeleteTemplate(tplId) {
    browser.storage.local.remove(tplId).then(() => {
        delete ttTemplates[tplId];
        ttRenderAllTemplates();
    });
}

function ttSaveTemplateToStorage(tplId, template) {
    const storageObj = {};
    storageObj[tplId] = JSON.stringify(template);
    browser.storage.local.set(storageObj).then(() => {
        ttTemplates[tplId] = template;
        ttRenderAllTemplates();
    });
}

// Listen to storage changes from background script or other pages
browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local") {
        console.log("Storage changed:", Object.keys(changes));
        ttLoadTemplates();
    }
});

// Initialize when DOM is ready
function ttInit() {
    console.log("Options page initializing...");
    ttSetupEventListeners();
    loadSettings();
    ttLoadTemplates().then(() => {
        console.log("Options page initialized");
    });
}

// Wait for DOM to be ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ttInit);
} else {
    ttInit();
}
