
const CONTEXT_ROOT = "template-root";
const CONTEXT_NULL = "template-null";

// Storage for templates
let ttTemplates = {};

// Rebuild menu from templates
function ttRebuildContextMenu() {
    console.log("Rebuilding context menu. Current templates:", Object.keys(ttTemplates).length);
    
    // Remove all context menus first
    browser.contextMenus.removeAll().then(() => {
        ttBuildContextMenuItems();
    }).catch(error => {
        console.error("Error removing context menus:", error);
        ttBuildContextMenuItems();
    });
}

function ttBuildContextMenuItems() {
    // Recreate root menu item (removeAll deleted everything)
    browser.contextMenus.create({
        id: CONTEXT_ROOT,
        title: browser.i18n.getMessage("contextItemTitle") || "Templates",
        contexts: ["editable"]
    });

    const templateCount = Object.keys(ttTemplates).length;
    console.log("Template count:", templateCount);

    if (templateCount === 0) {
        // Create null item (shown when no templates exist)
        browser.contextMenus.create({
            id: CONTEXT_NULL,
            title: browser.i18n.getMessage("contextItemTitleNull") || "No templates",
            contexts: ["editable"],
            parentId: CONTEXT_ROOT,
            enabled: false
        });
    } else {
        // Add all templates and their options
        for (let tplId in ttTemplates) {
            const template = ttTemplates[tplId];
            console.log("Creating menu for template:", tplId, template.title);
            
            // Create parent item (for main text)
            browser.contextMenus.create({
                id: `parent-${tplId}`,
                title: template.title || "Unnamed",
                contexts: ["editable"],
                parentId: CONTEXT_ROOT
            });

            // Create main text submenu
            browser.contextMenus.create({
                id: `child-${tplId}-main`,
                title: browser.i18n.getMessage("contextMenuMainTemplate") || "📝 Main",
                contexts: ["editable"],
                parentId: `parent-${tplId}`
            });

            // Create option submenus only for options with text content
            for (let i = 0; i < 10; i++) {
                const opt = template.options && template.options[i] ? template.options[i] : {};
                if (opt.text && opt.text.trim()) {
                    const optionName = (opt.name && opt.name.toString().trim()) ? opt.name.toString().trim() : `Option ${i + 1}`;
                    const title = optionName.length > 50 ? optionName.substring(0, 50) + "..." : optionName;
                    browser.contextMenus.create({
                        id: `child-${tplId}-${i}`,
                        title: title,
                        contexts: ["editable"],
                        parentId: `parent-${tplId}`
                    });
                }
            }
        }
    }
}

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
    const itemId = info.menuItemId;
    let messageContent = "";

    if (itemId.startsWith("child-")) {
        const parts = itemId.replace("child-", "").split("-");
        const tplId = parts.slice(0, -1).join("-"); // Handle IDs with hyphens
        const subIndex = parts[parts.length - 1];

        if (ttTemplates[tplId]) {
            if (subIndex === "main") {
                messageContent = ttTemplates[tplId].mainText;
            } else {
                const optIndex = parseInt(subIndex);
                messageContent = ttTemplates[tplId].options[optIndex]?.text || "";
            }
        }
    }

    if (messageContent) {
        console.log(`Inserting template to tab ${tab.id}`);
        browser.tabs.sendMessage(tab.id, {
            type: "INSERT_TEMPLATE",
            content: messageContent
        }).catch(error => {
            console.error("Error sending message to content script:", error);
            notifyError("element-not-recognized");
        });
    }
});

// Load templates from storage
function ttLoadTemplates() {
    return browser.storage.local.get().then(results => {
        // Fix for FF < 52
        if (Array.isArray(results)) {
            results = results[0] || {};
        }

        console.log("Loading templates from storage. Raw results:", results);
        ttTemplates = {};
        for (let key in results) {
            if (key !== "useLightIcon" && key !== "lightIconEnabled") {
                try {
                    const template = JSON.parse(results[key]);
                    if (template.id && template.title !== undefined) {
                        ttTemplates[template.id] = template;
                        console.log("Loaded template:", template.id, template.title);
                    }
                } catch (e) {
                    console.error("Failed to parse template:", key, e);
                }
            }
        }
        console.log("All templates loaded:", ttTemplates);
        ttRebuildContextMenu();
    });
}

// Listen for storage changes
browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local") {
        ttLoadTemplates();
    }
});

// Load templates on startup
ttLoadTemplates();

// Error notification
function ttNotifyError(errorType) {
    const messages = {
        "element-not-recognized": {
            title: browser.i18n.getMessage("notificationTitle") || "Template Insert Error",
            message: browser.i18n.getMessage("errorElemUnaccessible") || "Could not insert template into this element"
        }
    };

    const msg = messages[errorType];
    if (msg) {
        browser.notifications.create("template-error-notif", {
            type: "basic",
            iconUrl: browser.extension.getURL("icons/insert-dark.svg"),
            title: msg.title,
            message: msg.message
        });
    }
}

// Handle messages from content script
browser.runtime.onMessage.addListener((message, sender) => {
    if (message.error) {
        ttNotifyError(message.error);
    }
});
