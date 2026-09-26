chrome.runtime.onMessage.addListener(async (message) => {
    if (message.type === "open-tab") {
        chrome.tabs.create({ url: message.url });
    }

    if (message.type === "switch-tab") {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!activeTab) {
            return;
        }

        const tabs = await chrome.tabs.query({ currentWindow: true });

        const currentIndex = activeTab.index;
        let nextIndex;

        if (message.direction === "right") {
            if (currentIndex >= tabs.length - 1) {
                return;
            }
            nextIndex = currentIndex + 1;
        } else if (message.direction === "left") {
            if (currentIndex <= 0) {
                return;
            }
            nextIndex = currentIndex - 1;
        } else {
            return;
        }

        await chrome.tabs.update(tabs[nextIndex].id, { active: true });
        await chrome.windows.update(tabs[nextIndex].windowId, { focused: true });
    }
})