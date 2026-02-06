// Load and display templates
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
            { name: "Option 5", text: "" }
        ]
    };
}

function ttRenderTemplateList() {
    const listContainer = document.getElementById("templateList");
    
    if (Object.keys(ttTemplates).length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No templates yet. Click "Add Template" to get started!</div>';
        return;
    }

    listContainer.innerHTML = "";

    for (let tplId in ttTemplates) {
        const template = ttTemplates[tplId];
        const card = document.createElement("div");
        card.className = "template-item";
        card.id = `card-${tplId}`;

        const titleDiv = document.createElement("div");
        titleDiv.className = "template-item-title";
        titleDiv.textContent = template.title || "Unnamed Template";

        const previewDiv = document.createElement("div");
        previewDiv.className = "template-preview";
        previewDiv.title = template.mainText;
        previewDiv.textContent = `Main: ${template.mainText.substring(0, 40)}${template.mainText.length > 40 ? "..." : ""}`;

        const optionsDiv = document.createElement("div");
        optionsDiv.className = "template-preview";
        const optCount = template.options && Array.isArray(template.options) 
            ? template.options.filter(o => o && o.text && o.text.trim()).length 
            : 0;
        optionsDiv.textContent = `Options: ${optCount}/10`;

        const btnGroup = document.createElement("div");
        btnGroup.className = "btn-group";

        const editBtn = document.createElement("button");
        editBtn.className = "template-btn";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => ttEditTemplate(tplId));

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "template-btn template-btn-delete";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => {
            if (confirm(`Delete template "${template.title}"?`)) {
                ttDeleteTemplate(tplId);
            }
        });

        btnGroup.appendChild(editBtn);
        btnGroup.appendChild(deleteBtn);

        card.appendChild(titleDiv);
        card.appendChild(previewDiv);
        card.appendChild(optionsDiv);
        card.appendChild(btnGroup);

        listContainer.appendChild(card);
    }
}

function ttEditTemplate(tplId) {
    const template = ttTemplates[tplId];
    const card = document.getElementById(`card-${tplId}`);
    
    // Create edit form
    const form = document.createElement("form");
    form.className = "template-edit-form";
    form.style.padding = "15px";
    form.style.backgroundColor = "#f0f0f0";
    form.style.borderRadius = "4px";
    form.style.marginTop = "10px";

    // Title input
    const titleLabel = document.createElement("label");
    titleLabel.textContent = "Template Title:";
    titleLabel.style.display = "block";
    titleLabel.style.marginBottom = "5px";
    titleLabel.style.fontWeight = "bold";
    
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.value = template.title;
    titleInput.style.width = "100%";
    titleInput.style.padding = "5px";
    titleInput.style.marginBottom = "10px";
    titleInput.style.boxSizing = "border-box";

    // Main text
    const mainLabel = document.createElement("label");
    mainLabel.textContent = "Main Template Text:";
    mainLabel.style.display = "block";
    mainLabel.style.marginBottom = "5px";
    mainLabel.style.fontWeight = "bold";
    mainLabel.style.marginTop = "10px";

    const mainTextArea = document.createElement("textarea");
    mainTextArea.value = template.mainText;
    mainTextArea.rows = 4;
    mainTextArea.style.width = "100%";
    mainTextArea.style.padding = "5px";
    mainTextArea.style.marginBottom = "10px";
    mainTextArea.style.boxSizing = "border-box";

    // Options - dynamic container
    const optionsLabel = document.createElement("label");
    optionsLabel.textContent = "Optional Lines (Sub-Templates):";
    optionsLabel.style.display = "block";
    optionsLabel.style.marginBottom = "10px";
    optionsLabel.style.fontWeight = "bold";
    optionsLabel.style.marginTop = "10px";

    // Ensure options array exists
    if (!template.options || !Array.isArray(template.options)) {
        template.options = [];
    }
    
    const optionsContainer = document.createElement("div");
    const optionInputs = [];
    let displayedCount = 0;

    // Helper to create option item
    const createOptionItem = (index) => {
        const optItem = document.createElement("div");
        optItem.id = `opt-item-${index}`;
        optItem.style.display = "flex";
        optItem.style.flexDirection = "column";
        optItem.style.marginBottom = "8px";

        const optLabelContainer = document.createElement("div");
        optLabelContainer.style.display = "flex";
        optLabelContainer.style.justifyContent = "space-between";
        optLabelContainer.style.alignItems = "center";
        optLabelContainer.style.marginBottom = "5px";

        const optLabel = document.createElement("label");
        optLabel.textContent = `Option Name:`;
        optLabel.style.fontSize = "12px";
        optLabel.style.fontWeight = "bold";

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
        optNameInput.placeholder = `Option ${index + 1}`;
        const optName = (template.options[index] && template.options[index].name) ? template.options[index].name : `Option ${index + 1}`;
        optNameInput.value = optName;
        optNameInput.style.width = "100%";
        optNameInput.style.padding = "5px";
        optNameInput.style.marginBottom = "5px";
        optNameInput.style.boxSizing = "border-box";

        const optTextArea = document.createElement("textarea");
        const optText = (template.options[index] && template.options[index].text) ? template.options[index].text : "";
        optTextArea.value = optText;
        optTextArea.rows = 2;
        optTextArea.style.width = "100%";
        optTextArea.style.padding = "5px";
        optTextArea.style.marginBottom = "8px";
        optTextArea.style.boxSizing = "border-box";

        optionInputs[index] = { nameInput: optNameInput, textArea: optTextArea };

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

    // Buttons
    const btnContainer = document.createElement("div");
    btnContainer.style.marginTop = "15px";
    btnContainer.style.display = "flex";
    btnContainer.style.gap = "10px";

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.textContent = "Save";
    saveBtn.style.background = "linear-gradient(180deg,#007aff 0%,#0066d6 100%)";
    saveBtn.style.color = "#ffffff";
    saveBtn.style.padding = "8px 14px";
    saveBtn.style.borderRadius = "10px";
    saveBtn.style.border = "none";
    saveBtn.style.cursor = "pointer";
    saveBtn.style.fontWeight = "600";
    saveBtn.style.boxShadow = "0 6px 12px rgba(0,122,255,0.18)";
    saveBtn.style.textShadow = "0 1px 2px rgba(0,0,0,0.15)";
    saveBtn.addEventListener("click", () => {
        template.title = titleInput.value || "Unnamed";
        template.mainText = mainTextArea.value;
        
        // Ensure options array exists and has 10 items
        if (!template.options || !Array.isArray(template.options)) {
            template.options = [];
        }
        
        for (let i = 0; i < 10; i++) {
            if (!template.options[i]) {
                template.options[i] = {};
            }
            // Collect from optionInputs, which is sparse array (has values only for created indices)
            template.options[i].name = (optionInputs[i] && optionInputs[i].nameInput && optionInputs[i].nameInput.value) ? optionInputs[i].nameInput.value : `Option ${i + 1}`;
            template.options[i].text = (optionInputs[i] && optionInputs[i].textArea && optionInputs[i].textArea.value) ? optionInputs[i].textArea.value : "";
        }
        // Save and safely refresh the list. avoid replaceChild when parent may be detached
        try {
            ttSaveTemplateToStorage(tplId, template);
        } catch (e) {
            console.error('Error calling ttSaveTemplateToStorage:', e);
        }
        try {
            ttRenderTemplateList();
        } catch (e) {
            console.error('Error rendering template list after save:', e);
        }
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.backgroundColor = "#666";
    cancelBtn.style.color = "white";
    cancelBtn.style.padding = "8px 16px";
    cancelBtn.style.border = "none";
    cancelBtn.style.borderRadius = "4px";
    cancelBtn.style.cursor = "pointer";
    cancelBtn.addEventListener("click", () => {
        ttRenderTemplateList();
    });

    btnContainer.appendChild(saveBtn);
    btnContainer.appendChild(cancelBtn);

    form.appendChild(titleLabel);
    form.appendChild(titleInput);
    form.appendChild(mainLabel);
    form.appendChild(mainTextArea);
    form.appendChild(optionsLabel);
    form.appendChild(addOptBtn);
    form.appendChild(optionsContainer);
    form.appendChild(btnContainer);

    card.parentNode.replaceChild(form, card);
}

function ttDeleteTemplate(tplId) {
    browser.storage.local.remove(tplId).then(() => {
        delete ttTemplates[tplId];
        ttRenderTemplateList();
    });
}

function ttSaveTemplateToStorage(tplId, template) {
    console.log("ttSaveTemplateToStorage called with:", tplId, template);
    const storageObj = {};
    storageObj[tplId] = JSON.stringify(template);
    browser.storage.local.set(storageObj).then(() => {
        console.log("Template saved successfully to storage");
        ttTemplates[tplId] = template;
        ttRenderTemplateList();
    }).catch(error => {
        console.error("Error saving template:", error);
    });
}

function ttLoadTemplates() {
    browser.storage.local.get().then(results => {
        if (Array.isArray(results)) {
            results = results[0] || {};
        }

        ttTemplates = {};
        for (let key in results) {
            if (key !== "useLightIcon" && key !== "lightIconEnabled") {
                try {
                    const template = JSON.parse(results[key]);
                    if (template.id && template.title !== undefined) {
                        ttTemplates[template.id] = template;
                    }
                } catch (e) {
                    console.error("Failed to parse template:", key, e);
                }
            }
        }
        ttRenderTemplateList();
    });
}

// Event listeners
function ttSetupPopupListeners() {
    const addBtn = document.getElementById("btnAdd");
    console.log("Setting up popup listeners. addBtn:", addBtn);
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            console.log("Add Template button clicked");
            const newTemplate = ttCreateNewTemplate();
            console.log("Created new template:", newTemplate);
            ttSaveTemplateToStorage(newTemplate.id, newTemplate);
        });
    } else {
        console.error("Add Template button not found!");
    }
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded fired");
    ttLoadTemplates();
    ttSetupPopupListeners();
});
