// Insert template content into editable elements
function insertTemplate(templateContent) {
    console.log("Inserting template: " + templateContent.substring(0, 50) + "...");
    let activeElem = document.activeElement;

    // Check if activeElem exists
    if (!activeElem || !activeElem.tagName) {
        console.error("No active element found");
        sendError("element-not-recognized");
        return;
    }

    // Element handling
    const tagName = activeElem.tagName.toLowerCase();

    switch (tagName) {
        case "textarea":
        case "input":
            // For input & textarea, use selection
            try {
                if (activeElem.selectionStart >= 0) {
                    let startPos = activeElem.selectionStart;
                    let endPos = activeElem.selectionEnd;
                    activeElem.value = activeElem.value.substring(0, startPos)
                        + templateContent
                        + activeElem.value.substring(endPos, activeElem.value.length);
                    
                    let actualLength = tagName === "input" 
                        ? templateContent.replace(/\n/g, "").length 
                        : templateContent.length;
                    
                    activeElem.selectionStart = activeElem.selectionEnd = startPos + actualLength;
                    activeElem.focus();
                }
            } catch (error) {
                console.error("Error inserting into input/textarea:", error);
                sendError("element-not-recognized");
            }
            break;

        case "div":
        case "p":
        case "span":
        case "article":
        case "section":
            // For contenteditable elements, use DOM manipulation
            // Check if element is actually contenteditable
            if (activeElem.contentEditable !== "true" && activeElem.contentEditable !== "inherit") {
                // Try to find a contenteditable parent
                let parent = activeElem.parentElement;
                let foundEditable = false;
                let depth = 0;
                
                while (parent && depth < 10) {
                    if (parent.contentEditable === "true" || parent.contentEditable === "inherit") {
                        activeElem = parent;
                        foundEditable = true;
                        break;
                    }
                    parent = parent.parentElement;
                    depth++;
                }
                
                if (!foundEditable) {
                    console.error("Element is not contenteditable:", activeElem);
                    sendError("element-not-recognized");
                    return;
                }
            }

            try {
                // Create nodes to be inserted
                let splitMessage = templateContent.split(/\n/);
                let insertNodes = [];
                
                for (let i = 0; i < splitMessage.length; i++) {
                    if (splitMessage[i]) {
                        insertNodes.push(document.createTextNode(splitMessage[i]));
                    }
                    if (i !== splitMessage.length - 1) {
                        insertNodes.push(document.createElement("br"));
                    }
                }

                // Get current selection
                let selection = window.getSelection();
                
                if (selection.rangeCount === 0) {
                    // No selection, just append
                    for (let node of insertNodes) {
                        activeElem.appendChild(node);
                    }
                    break;
                }

                let selectionRange = selection.getRangeAt(0);
                let startOffset = selectionRange.startOffset;
                let endOffset = selectionRange.endOffset;
                let parentNode, startDelete, endDelete;

                if (selectionRange.startContainer.childNodes.length > 0) {
                    parentNode = selectionRange.startContainer;
                    startDelete = selectionRange.startContainer.childNodes[startOffset];
                    startOffset = -1; // Mark delete whole node
                } else {
                    parentNode = selectionRange.startContainer.parentNode;
                    startDelete = selectionRange.startContainer;
                }

                if (selectionRange.endContainer.childNodes.length > 0) {
                    endDelete = selectionRange.endContainer.childNodes[endOffset];
                    endOffset = -1; // Mark delete whole node
                } else {
                    endDelete = selectionRange.endContainer;
                }

                // Get nodes to be deleted
                let deleteNodes = [];
                let deleteMode = false;
                for (let i = 0; i < parentNode.childNodes.length; i++) {
                    if (parentNode.childNodes[i] === startDelete) {
                        deleteMode = true;
                    }
                    if (deleteMode) {
                        deleteNodes.push(parentNode.childNodes[i]);
                    }
                    if (deleteMode && parentNode.childNodes[i] === endDelete) {
                        break;
                    }
                }

                // Start deleting selected content
                let insertAnchor = null;
                if (deleteNodes.length > 1) {
                    for (let i = 0; i < deleteNodes.length; i++) {
                        if (i === 0) {
                            if (startOffset > 0) {
                                let prefixSplit = deleteNodes[i].textContent.substring(0, startOffset);
                                parentNode.replaceChild(document.createTextNode(prefixSplit), deleteNodes[i]);
                            } else {
                                parentNode.removeChild(deleteNodes[i]);
                            }
                        } else if (i === deleteNodes.length - 1) {
                            if (endOffset > 0) {
                                let suffixSplit = deleteNodes[i].textContent.substring(endOffset, deleteNodes[i].textContent.length);
                                insertAnchor = document.createTextNode(suffixSplit);
                                parentNode.replaceChild(insertAnchor, deleteNodes[i]);
                            } else {
                                insertAnchor = deleteNodes[i].nextSibling;
                                parentNode.removeChild(deleteNodes[i]);
                            }
                        } else {
                            parentNode.removeChild(deleteNodes[i]);
                        }
                    }
                } else if (deleteNodes.length === 1) {
                    if (startOffset !== -1) {
                        let prefixSplit = deleteNodes[0].textContent.substring(0, startOffset);
                        let suffixSplit = deleteNodes[0].textContent.substring(endOffset, deleteNodes[0].textContent.length);
                        parentNode.insertBefore(document.createTextNode(prefixSplit), deleteNodes[0]);
                        insertAnchor = parentNode.insertBefore(document.createTextNode(suffixSplit), deleteNodes[0]);
                        parentNode.removeChild(deleteNodes[0]);
                    } else {
                        insertAnchor = deleteNodes[0];
                    }
                }

                // Begin insertion
                for (let i = 0; i < insertNodes.length; i++) {
                    parentNode.insertBefore(insertNodes[i], insertAnchor);
                }
            } catch (error) {
                console.error("Error inserting into contenteditable:", error);
                sendError("element-not-recognized");
            }
            break;

        default:
            console.warn("Unsupported element type:", tagName);
            sendError("element-not-recognized");
    }
}

function sendError(errorType) {
    browser.runtime.sendMessage({ error: errorType }).catch(e => {
        console.error("Failed to send error message:", e);
    });
}

// Handle messages from background script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Content script received message:", message);
    
    if (message.type === "INSERT_TEMPLATE" && message.content) {
        try {
            insertTemplate(message.content);
            sendResponse({ success: true });
        } catch (error) {
            console.error("Error inserting template:", error);
            sendError("element-not-recognized");
            sendResponse({ success: false, error: error.message });
        }
    }
});

console.log("Template insertion content script loaded");