if (window.__tt_injected) {
    console.log("Template insertion content script already injected");
} else {
    window.__tt_injected = true;

    function getDeepActiveElement(rootDoc) {
        let active = (rootDoc || document).activeElement;
        while (active && active.shadowRoot && active.shadowRoot.activeElement) {
            active = active.shadowRoot.activeElement;
        }
        return active;
    }

    function isTextInput(el) {
        if (!el || !el.tagName) return false;
        const tag = el.tagName.toLowerCase();
        if (tag === "textarea") return true;
        if (tag !== "input") return false;

        const type = (el.type || "text").toLowerCase();
        const textLikeTypes = [
            "text", "search", "url", "tel", "email", "password", "number"
        ];
        return textLikeTypes.includes(type);
    }

    function setNativeValue(el, value) {
        const proto = el.tagName.toLowerCase() === "textarea"
            ? HTMLTextAreaElement.prototype
            : HTMLInputElement.prototype;

        const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
        if (descriptor && typeof descriptor.set === "function") {
            descriptor.set.call(el, value);
        } else {
            el.value = value;
        }
    }

    function dispatchInputLifecycle(el, insertedText) {
        let inputEvent;
        try {
            inputEvent = new InputEvent("input", {
                bubbles: true,
                composed: true,
                inputType: "insertText",
                data: insertedText
            });
        } catch (e) {
            inputEvent = new Event("input", { bubbles: true, composed: true });
        }

        el.dispatchEvent(inputEvent);
        el.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }

    function insertIntoTextControl(el, templateContent) {
        const tag = el.tagName.toLowerCase();
        const insertText = tag === "input"
            ? templateContent.replace(/\n/g, " ")
            : templateContent;

        const hasSelection = typeof el.selectionStart === "number" && typeof el.selectionEnd === "number";

        if (hasSelection && typeof el.setRangeText === "function") {
            const start = el.selectionStart;
            const end = el.selectionEnd;
            el.setRangeText(insertText, start, end, "end");
        } else {
            const value = el.value || "";
            const start = hasSelection ? el.selectionStart : value.length;
            const end = hasSelection ? el.selectionEnd : value.length;
            const nextValue = value.slice(0, start) + insertText + value.slice(end);
            setNativeValue(el, nextValue);

            const caret = start + insertText.length;
            if (typeof el.setSelectionRange === "function") {
                el.setSelectionRange(caret, caret);
            }
        }

        el.focus();
        dispatchInputLifecycle(el, insertText);
    }

    function insertIntoContentEditable(el, templateContent) {
        let editable = el;
        if (!editable.isContentEditable) {
            editable = el.closest('[contenteditable="true"], [contenteditable=""], [contenteditable]:not([contenteditable="false"])');
        }

        if (!editable || !editable.isContentEditable) {
            return false;
        }

        editable.focus();

        // Prefer execCommand for broader editor compatibility (triggers editor internals in many apps)
        if (document.queryCommandSupported && document.queryCommandSupported("insertText")) {
            const ok = document.execCommand("insertText", false, templateContent);
            if (ok) {
                dispatchInputLifecycle(editable, templateContent);
                return true;
            }
        }

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            editable.appendChild(document.createTextNode(templateContent));
            dispatchInputLifecycle(editable, templateContent);
            return true;
        }

        const range = selection.getRangeAt(0);
        range.deleteContents();

        const lines = templateContent.split("\n");
        const frag = document.createDocumentFragment();
        for (let i = 0; i < lines.length; i++) {
            if (lines[i]) {
                frag.appendChild(document.createTextNode(lines[i]));
            }
            if (i < lines.length - 1) {
                frag.appendChild(document.createElement("br"));
            }
        }

        const lastNode = frag.lastChild;
        range.insertNode(frag);

        if (lastNode) {
            range.setStartAfter(lastNode);
            range.setEndAfter(lastNode);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        dispatchInputLifecycle(editable, templateContent);
        return true;
    }

    function insertTemplate(templateContent) {
        console.log("Inserting template: " + templateContent.substring(0, 50) + "...");

        const activeElem = getDeepActiveElement(document);
        if (!activeElem || !activeElem.tagName) {
            console.error("No active element found");
            sendError("element-not-recognized");
            return;
        }

        try {
            if (isTextInput(activeElem)) {
                insertIntoTextControl(activeElem, templateContent);
                return;
            }

            if (insertIntoContentEditable(activeElem, templateContent)) {
                return;
            }

            console.warn("Unsupported element type:", activeElem.tagName.toLowerCase(), activeElem);
            sendError("element-not-recognized");
        } catch (error) {
            console.error("Error inserting template:", error);
            sendError("element-not-recognized");
        }
    }

    function sendError(errorType) {
        chrome.runtime.sendMessage({ error: errorType }).catch(e => {
            console.error("Failed to send error message:", e);
        });
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
}
